import "server-only";
import type Stripe from "stripe";
import prisma from "@/lib/prisma";
import { getStripe } from "./stripe";
import { amountInCents, PaymentError, validatePaidSession } from "./validation";
import { deliverSubscription } from "./subscriptions";
import { notificationSeed } from "@/lib/admin-notifications";

export async function processPaymentEvent(event: Stripe.Event) {
  const handled = ["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired"];
  if (!handled.includes(event.type)) return;
  const payload = event.data.object as Stripe.Checkout.Session;
  const session = await getStripe().checkout.sessions.retrieve(payload.id);
  const orderId = session.metadata?.orderId;
  if (!orderId) throw new PaymentError("Métadonnées absentes.", 400);
  const paidNotification = session.payment_status === "paid" ? await notificationSeed("PAYMENT_RECEIVED") : null;
  // Serialize events per order. The event row and payment update commit together.
  await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "Order" WHERE "id" = ${orderId} FOR UPDATE`;
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { checkout: true } });
    if (!order || !order.checkout) throw new PaymentError("Commande ou tentative inconnue.", 409);
    const checkout = order.checkout;
    if (await tx.paymentWebhookEvent.findUnique({ where: { id: event.id } })) return;
    if (session.metadata?.checkoutGeneration !== checkout.generation || (checkout.sessionId && session.id !== checkout.sessionId)) {
      // Late expiry/failure for a superseded attempt cannot change current payment.
      if (session.payment_status !== "paid") return;
      throw new PaymentError("Tentative de paiement incohérente.", 409);
    }
    if (session.payment_status === "paid") {
      const reference = validatePaidSession(session, { orderId, amount: amountInCents(order.total), currency: order.paymentCurrency,
        generation: checkout.generation, sessionId: checkout.sessionId });
      if (checkout.amount !== session.amount_total || checkout.currency.toUpperCase() !== session.currency?.toUpperCase()) throw new PaymentError("Montant enregistré incorrect.", 409);
      if (order.paymentStatus === "REFUNDED") return;
      if (order.paymentStatus === "PAID" && order.paymentReference !== reference) throw new PaymentError("Commande déjà réglée avec une autre référence.", 409);
      if (order.paymentStatus !== "PAID") await tx.order.update({ where: { id: orderId }, data: {
        paymentStatus: "PAID", paymentMethod: "stripe", paymentProvider: "stripe",
        paymentReference: reference, paymentAmount: session.amount_total, paidAt: new Date(event.created * 1000),
        ...(order.status === "PENDING" ? { status: "CONFIRMED" } : {}),
        ...(paidNotification ? { adminNotifications: { create: paidNotification } } : {}),
      } });
    } else if (event.type === "checkout.session.async_payment_failed" && order.paymentStatus !== "PAID" && order.paymentStatus !== "REFUNDED") {
      await tx.order.update({ where: { id: orderId }, data: { paymentStatus: "FAILED" } });
    }
    await tx.paymentWebhookEvent.create({ data: { id: event.id, orderId } });
  });
  // If sending fails, return 5xx so Stripe retries; payment remains recorded.
  // Repeated events only retry delivery, never the payment itself.
  if (session.payment_status === "paid") {
    const delivery = await deliverSubscription(orderId);
    if (delivery === "sending") throw new PaymentError("Envoi déjà en cours.", 503);
  }
}
