import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin, getAdminPayload } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { dispatchPhoneAlert } from "@/lib/admin-notifications";
import { rateLimit } from "@/lib/rateLimit";
import { dispatchOrderEmail } from "@/lib/order-emails";

export async function GET(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
  const [notifications, unread] = await Promise.all([
    prisma.adminOrderNotification.findMany({ orderBy: { createdAt: "desc" }, take: 50, select: {
      id: true, event: true, readAt: true, createdAt: true, phoneStatus: true, phoneChannel: true, phoneError: true,
      order: { select: { id: true, orderNumber: true, customerName: true, total: true, paymentCurrency: true, paymentStatus: true, paymentMethod: true, status: true,
        emailDeliveries: { select: { id: true, kind: true, status: true, error: true } },
      } },
    } }), prisma.adminOrderNotification.count({ where: { readAt: null } }),
  ]);
  return NextResponse.json({ notifications, unread }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[admin/notifications] Failed to load notifications", error);
    return NextResponse.json({ error: "Notifications indisponibles. Veuillez réessayer." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdminPayload(req);
  if (!admin) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: "Origine invalide." }, { status: 403 });
  try {
    const parsed = z.object({ action: z.enum(["read", "read_all", "retry", "retry_email"]), id: z.string().min(1).max(100).optional() }).strict().safeParse(await req.json());
    if (!parsed.success || (parsed.data.action !== "read_all" && !parsed.data.id)) return NextResponse.json({ error: "Demande invalide." }, { status: 400 });
    const { action, id } = parsed.data;
    if (action === "retry_email") {
      if (!["owner", "manager"].includes(admin.staffRole)) return NextResponse.json({ error: "Accès réservé aux responsables." }, { status: 403 });
      const limited = rateLimit(req, { limit: 10, prefix: "admin-email-retry" });
      if (limited) return limited;
      const changed = await prisma.orderEmailDelivery.updateMany({ where: { id, status: "FAILED" }, data: { status: "PENDING", nextAttemptAt: new Date(), error: null } });
      if (!changed.count) return NextResponse.json({ error: "Seuls les emails en échec peuvent être relancés. Vérifiez les envois incertains dans Resend." }, { status: 409 });
      await dispatchOrderEmail(id!);
    } else if (action === "retry") {
      if (!["owner", "manager"].includes(admin.staffRole)) return NextResponse.json({ error: "Accès réservé aux responsables." }, { status: 403 });
      const limited = rateLimit(req, { limit: 10, prefix: "admin-phone-retry" });
      if (limited) return limited;
      const changed = await prisma.adminOrderNotification.updateMany({ where: { id, phoneStatus: "FAILED" }, data: { phoneStatus: "PENDING", phoneError: null } });
      if (!changed.count) return NextResponse.json({ error: "Seuls les envois refusés peuvent être relancés." }, { status: 409 });
      await dispatchPhoneAlert(id!);
    } else {
      await prisma.adminOrderNotification.updateMany({ where: { readAt: null, ...(action === "read" ? { id } : {}) }, data: { readAt: new Date() } });
    }
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Notifications indisponibles." }, { status: 500 }); }
}
