import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/payments/stripe";
import { after } from "next/server";
import { drainPhoneAlerts } from "@/lib/admin-notifications";
import { processPaymentEvent } from "@/lib/payments/webhook";
import { PaymentError } from "@/lib/payments/validation";

export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Webhook non configuré." }, { status: 503 });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Signature absente." }, { status: 400 });
  const body = await req.text();
  if (body.length > 1000000) return NextResponse.json({ error: "Événement trop volumineux." }, { status: 413 });
  let event;
  try { event = getStripe().webhooks.constructEvent(body, signature, secret); }
  catch { return NextResponse.json({ error: "Signature invalide." }, { status: 400 }); }
  try {
    after(async () => { try { await drainPhoneAlerts(); } catch { console.error("[notifications] Phone queue unavailable"); } });
    await processPaymentEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[payment] Webhook processing failed", { eventId: event.id, type: event.type });
    return NextResponse.json({ error: "Traitement du paiement impossible." }, { status: error instanceof PaymentError && error.status < 500 ? 400 : 500 });
  }
}
