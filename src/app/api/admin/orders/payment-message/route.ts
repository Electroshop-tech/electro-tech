import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/adminAuth";
import { rateLimit } from "@/lib/rateLimit";
import { getOrderById } from "@/lib/store";
import { paymentLink, paymentMessage } from "@/lib/payment-message";
import { sendPaymentRequestEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: "Origine invalide." }, { status: 403 });
  const limited = rateLimit(req, { limit: 10, prefix: "admin-payment-message" });
  if (limited) return limited;
  const parsed = z.object({ orderId: z.string().min(1).max(100), url: z.string().max(2048) }).strict().safeParse(await req.json().catch(() => null));
  const url = parsed.success ? paymentLink(parsed.data.url) : null;
  if (!parsed.success || !url) return NextResponse.json({ error: "Ajoutez un lien de paiement HTTPS valide." }, { status: 400 });
  const order = await getOrderById(parsed.data.orderId);
  if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  if (["paid", "refunded"].includes(order.paymentStatus) || ["cancelled", "delivered"].includes(order.status)) return NextResponse.json({ error: "Cette commande ne peut plus recevoir de demande de paiement." }, { status: 409 });
  if (!z.string().email().safeParse(order.customerEmail).success) return NextResponse.json({ error: "Le client n’a pas d’adresse email valide." }, { status: 400 });
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "Configurez le service email pour envoyer le message depuis le panneau admin." }, { status: 503 });
  try {
    // Identical retries share a provider key; no payment status is changed.
    const key = createHash("sha256").update(JSON.stringify([order.id, order.customerEmail, paymentMessage(order, url)])).digest("hex");
    await sendPaymentRequestEmail(order, url, `payment-request/${key}`);
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "L’envoi n’a pas été confirmé. Vérifiez le service email puis réessayez." }, { status: 502 });
  }
}
