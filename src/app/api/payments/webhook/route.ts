import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { updateOrderPaymentStatus, getOrderById } from "@/lib/store";
import { rateLimit } from "@/lib/rateLimit";
import { validate, paymentWebhookSchema } from "@/lib/validation";

/**
 * Payment webhook endpoint.
 *
 * The store currently ships with Cash-on-Delivery only, but this endpoint is a
 * production-ready scaffold for any future provider (Stripe, CMI, PayZone…).
 *
 * Security: the raw request body is verified with an HMAC-SHA256 signature using
 * the `PAYMENT_WEBHOOK_SECRET` env var, supplied by the provider in the
 * `x-webhook-signature` header. If no secret is configured, the endpoint refuses
 * to process events (fail closed).
 */
function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 30, prefix: "payment-webhook" });
  if (limited) return limited;

  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[payment] PAYMENT_WEBHOOK_SECRET not configured — rejecting webhook");
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 503 });
  }

  // Read the raw body once for signature verification, then parse.
  const rawBody = await req.text();
  const signature = req.headers.get("x-webhook-signature");
  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }

  const parsed = validate(paymentWebhookSchema, payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { orderId, status } = parsed.data;
  const existing = await getOrderById(orderId);
  if (!existing) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  const updated = await updateOrderPaymentStatus(orderId, status);
  if (!updated) {
    return NextResponse.json({ error: "Mise à jour échouée." }, { status: 500 });
  }

  console.log(`[payment] Order ${orderId} payment status → ${status}`);
  return NextResponse.json({ ok: true, orderId, paymentStatus: status });
}
