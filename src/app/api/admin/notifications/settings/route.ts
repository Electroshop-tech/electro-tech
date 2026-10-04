import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminPayload } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { getPhoneAlertSettings, phonePattern, phoneProviderConfigured } from "@/lib/admin-notifications";

export async function GET(req: NextRequest) {
  const admin = await getAdminPayload(req);
  if (!admin) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  if (!["owner", "manager"].includes(admin.staffRole)) return NextResponse.json({ error: "Accès réservé aux responsables." }, { status: 403 });
  return NextResponse.json({ ...await getPhoneAlertSettings(), configured: { sms: phoneProviderConfigured("sms"), whatsapp: phoneProviderConfigured("whatsapp") } }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminPayload(req);
  if (!admin) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  if (!["owner", "manager"].includes(admin.staffRole)) return NextResponse.json({ error: "Accès réservé aux responsables." }, { status: 403 });
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: "Origine invalide." }, { status: 403 });
  try {
    const parsed = z.object({ enabled: z.boolean(), phone: z.string().trim().max(16), channel: z.enum(["sms", "whatsapp"]) }).strict().safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });
    const { enabled, phone, channel } = parsed.data;
    if ((enabled || phone) && !phonePattern.test(phone)) return NextResponse.json({ error: "Utilisez le format international, par exemple +33612345678." }, { status: 400 });
    if (enabled && !phoneProviderConfigured(channel)) return NextResponse.json({ error: "Configurez Twilio sur le serveur avant d’activer ce canal." }, { status: 503 });
    await prisma.$transaction(Object.entries({ adminPhoneAlertsEnabled: String(enabled), adminPhoneAlertsNumber: phone, adminPhoneAlertsChannel: channel })
      .map(([key, value]) => prisma.siteSetting.upsert({ where: { key }, create: { key, value }, update: { value } })));
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Enregistrement impossible." }, { status: 500 }); }
}
