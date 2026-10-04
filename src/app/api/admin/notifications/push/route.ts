import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminPayload } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { pushConfigured, validPushEndpoint, sendPush, pushFailure } from "@/lib/admin-push";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
const subscriptionSchema = z.object({ endpoint: z.string().max(2048).refine(validPushEndpoint), keys: z.object({
  p256dh: z.string().regex(/^[A-Za-z0-9_-]+$/).refine(s => Buffer.from(s, "base64url").length === 65),
  auth: z.string().regex(/^[A-Za-z0-9_-]+$/).refine(s => Buffer.from(s, "base64url").length === 16),
}) });

async function authorize(req: NextRequest) {
  const admin = await getAdminPayload(req);
  if (!admin) return { error: NextResponse.json({ error: "Non autorisé." }, { status: 401 }) };
  if (!["owner", "manager"].includes(admin.staffRole)) return { error: NextResponse.json({ error: "Accès réservé aux responsables." }, { status: 403 }) };
  if (req.method !== "GET" && req.headers.get("origin") !== req.nextUrl.origin) return { error: NextResponse.json({ error: "Origine invalide." }, { status: 403 }) };
  if (admin.uid) {
    const user = await prisma.adminUser.findUnique({ where: { id: admin.uid } });
    if (!user?.active || !["owner", "manager"].includes(user.role)) return { error: NextResponse.json({ error: "Compte désactivé." }, { status: 403 }) };
  }
  return { owner: admin.uid || "primary-owner" };
}

export async function GET(req: NextRequest) {
  const auth = await authorize(req); if (auth.error) return auth.error;
  try {
    const endpoint = req.nextUrl.searchParams.get("endpoint");
    const device = endpoint ? await prisma.adminPushSubscription.findFirst({ where: { endpoint, owner: auth.owner } }) : null;
    const failed = device ? await prisma.adminPushDelivery.count({ where: { subscriptionId: device.id, status: "FAILED" } }) : 0;
    const pending = device ? await prisma.adminPushDelivery.count({ where: { subscriptionId: device.id, status: { in: ["PENDING", "SENDING"] } } }) : 0;
    return NextResponse.json({ configured: pushConfigured(), publicKey: process.env.VAPID_PUBLIC_KEY || null, subscribed: Boolean(device), failed, pending }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Notifications indisponibles." }, { status: 503 }); }
}

export async function POST(req: NextRequest) {
  const auth = await authorize(req); if (auth.error) return auth.error;
  const limited = rateLimit(req, { prefix: "admin-push", limit: 20 }); if (limited) return limited;
  if (!pushConfigured()) return NextResponse.json({ error: "Le service de notifications doit être configuré sur le serveur." }, { status: 503 });
  try {
    if (Number(req.headers.get("content-length")) > 5000) return NextResponse.json({ error: "Requête trop volumineuse." }, { status: 413 });
    const input = z.object({ action: z.enum(["subscribe", "test"]), subscription: subscriptionSchema }).safeParse(await req.json());
    if (!input.success) return NextResponse.json({ error: "Abonnement invalide." }, { status: 400 });
    const { endpoint, keys } = input.data.subscription;
    const device = await prisma.adminPushSubscription.findUnique({ where: { endpoint } });
    if (device && device.owner !== auth.owner) return NextResponse.json({ error: "Cet appareil est lié à un autre compte." }, { status: 409 });
    if (input.data.action === "test") {
      if (!device) return NextResponse.json({ error: "Activez d’abord cet appareil." }, { status: 400 });
      try { await sendPush(device, { title: "Notifications activées", body: "Les prochaines commandes apparaîtront ici.", tag: "admin-push-test", url: "/admin/notifications" }); }
      catch (error) {
        if (pushFailure(error) === "EXPIRED") await prisma.adminPushSubscription.deleteMany({ where: { id: device.id } });
        return NextResponse.json({ error: "Test non envoyé. Réactivez cet appareil ou réessayez." }, { status: 502 });
      }
    } else {
      await prisma.adminPushSubscription.upsert({ where: { endpoint }, create: { endpoint, owner: auth.owner!, ...keys }, update: keys });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const code = typeof (error as { code?: unknown })?.code === "string" ? (error as { code: string }).code : "UNKNOWN";
    console.error("[admin/push] Registration failed", { code });
    if (code === "P2021" || code === "P2022") return NextResponse.json({ error: "Le service de notifications nécessite une mise à jour de la base de données. Contactez le responsable du site." }, { status: 503 });
    return NextResponse.json({ error: "Enregistrement impossible. Réessayez." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await authorize(req); if (auth.error) return auth.error;
  try {
    const input = z.object({ endpoint: z.string().max(2048) }).safeParse(await req.json());
    if (!input.success) return NextResponse.json({ error: "Appareil invalide." }, { status: 400 });
    await prisma.adminPushSubscription.deleteMany({ where: { endpoint: input.data.endpoint, owner: auth.owner } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Désactivation impossible." }, { status: 500 }); }
}
