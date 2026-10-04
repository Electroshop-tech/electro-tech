import type Stripe from "stripe";

export class PaymentError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function amountInCents(total: number) {
  const cents = Math.round(total * 100);
  if (!Number.isFinite(total) || total <= 0 || !Number.isSafeInteger(cents) || cents < 50) {
    throw new PaymentError("Le montant de cette commande ne permet pas le paiement en ligne.");
  }
  return cents;
}

export function validatePaidSession(session: Stripe.Checkout.Session, expected: { orderId: string; amount: number; currency: string; generation: string; sessionId: string | null }) {
  if (session.mode !== "payment" || session.payment_status !== "paid" || session.status !== "complete") throw new PaymentError("Paiement non confirmé.", 409);
  if (session.metadata?.orderId !== expected.orderId || session.client_reference_id !== expected.orderId || session.metadata?.checkoutGeneration !== expected.generation
    || (expected.sessionId && session.id !== expected.sessionId)) throw new PaymentError("Référence de paiement incorrecte.", 409);
  if (session.amount_total !== expected.amount || session.currency?.toUpperCase() !== expected.currency.toUpperCase()) throw new PaymentError("Montant ou devise incorrects.", 409);
  if (typeof session.payment_intent !== "string" || !session.payment_intent) throw new PaymentError("Référence bancaire absente.", 409);
  return session.payment_intent;
}
