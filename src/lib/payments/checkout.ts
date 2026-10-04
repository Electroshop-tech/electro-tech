import "server-only";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import { getStripe, paymentSiteUrl } from "./stripe";
import { amountInCents, PaymentError } from "./validation";

export async function createOrderCheckout(orderId: string, retry = 0): Promise<string> {
  const { order, checkout, amount } = await prisma.$transaction(async (tx) => {
  await tx.$queryRaw`SELECT "id" FROM "Order" WHERE "id" = ${orderId} FOR UPDATE`;
  const order = await tx.order.findUnique({ where: { id: orderId } });
  if (!order) throw new PaymentError("Commande introuvable.", 404);
  if (order.paymentStatus === "PAID" || order.paymentStatus === "REFUNDED") throw new PaymentError("Cette commande a déjà été réglée.", 409);
  if (order.status === "CANCELLED") throw new PaymentError("Cette commande a été annulée.", 409);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.customerEmail)) throw new PaymentError("Une adresse email valide est nécessaire.");
  const amount = amountInCents(order.total);
  if (order.paymentCurrency !== "EUR") throw new PaymentError("Devise de commande non prise en charge.");
  const checkout = await tx.paymentCheckout.upsert({
    where: { orderId }, update: {}, create: { orderId, amount, currency: order.paymentCurrency },
  });
  if (checkout.amount !== amount || checkout.currency !== order.paymentCurrency) throw new PaymentError("La commande a changé. Contactez notre équipe.", 409);
  return { order, checkout, amount };
  });
  const stripe = getStripe();
  if (checkout.sessionId) {
    const previous = await stripe.checkout.sessions.retrieve(checkout.sessionId);
    if (previous.status === "open" && previous.payment_status === "unpaid" && previous.url) return previous.url;
    const failedAttempt = previous.status === "complete" && previous.payment_status === "unpaid" && order.paymentStatus === "FAILED";
    if (previous.status !== "expired" && !failedAttempt) throw new PaymentError("Le paiement est en cours de confirmation. Ne payez pas une seconde fois.", 409);
    if (retry > 1) throw new PaymentError("Veuillez réessayer dans un instant.", 409);
    await prisma.paymentCheckout.updateMany({ where: { orderId, generation: checkout.generation },
      data: { generation: randomUUID(), sessionId: null, createdAt: new Date() } });
    return createOrderCheckout(orderId, retry + 1);
  }
  // Recover abandoned creation attempts without reusing a Stripe key after 24h.
  if (Date.now() - checkout.createdAt.getTime() > 23 * 60 * 60 * 1000) {
    throw new PaymentError("Cette tentative nécessite une vérification par notre équipe.", 409);
  }
  const site = paymentSiteUrl();
  const metadata = { orderId, checkoutGeneration: checkout.generation };
  const session = await stripe.checkout.sessions.create({
    mode: "payment", allowed_payment_method_types: ["card"], locale: "fr",
    adaptive_pricing: { enabled: false }, allow_promotion_codes: false,
    client_reference_id: orderId, customer_email: order.customerEmail,
    metadata, payment_intent_data: { metadata },
    line_items: [{ quantity: 1, price_data: { currency: checkout.currency.toLowerCase(), unit_amount: amount,
      product_data: { name: `Commande ${order.orderNumber || order.id}` } } }],
    success_url: `${site}/payment/success?orderId=${encodeURIComponent(orderId)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/payment/cancel?orderId=${encodeURIComponent(orderId)}`,
  }, { idempotencyKey: `checkout:${checkout.generation}` });
  if (!session.url) throw new PaymentError("Impossible d’ouvrir le paiement.", 502);
  const stored = await prisma.paymentCheckout.updateMany({ where: { orderId, generation: checkout.generation }, data: { sessionId: session.id } });
  if (stored.count !== 1) throw new PaymentError("Veuillez réessayer dans un instant.", 409);
  return session.url;
}
