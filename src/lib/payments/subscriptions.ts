import "server-only";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import { sendSubscriptionEmail } from "@/lib/email";
import { PaymentError } from "./validation";

export async function saveSubscriptionInformation(orderId: string, information: string) {
  const updated = await prisma.order.updateMany({
    where: { id: orderId, subscriptionSentAt: null, subscriptionFirstAttemptAt: null },
    data: { subscriptionInformation: information.trim(), subscriptionDeliveryError: null },
  });
  if (updated.count !== 1) throw new PaymentError("Un envoi a déjà commencé. Les informations ne peuvent plus être modifiées.", 409);
}

export async function deliverSubscription(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new PaymentError("Commande introuvable.", 404);
  if (order.subscriptionSentAt) return "sent";
  if (order.paymentStatus !== "PAID" || order.status === "CANCELLED" || !order.subscriptionInformation?.trim()) return "waiting";
  if (order.subscriptionFirstAttemptAt && Date.now() - order.subscriptionFirstAttemptAt.getTime() > 23 * 60 * 60 * 1000) {
    throw new PaymentError("Envoi à vérifier dans Resend avant toute nouvelle tentative : la fenêtre d’idempotence est dépassée.", 409);
  }
  const now = new Date();
  const key = order.subscriptionDeliveryKey || randomUUID();
  // Claim atomically; a crashed worker may be retried with the same email key.
  const claimed = await prisma.order.updateMany({ where: {
    id: orderId, paymentStatus: "PAID", status: { not: "CANCELLED" }, subscriptionSentAt: null,
    subscriptionInformation: order.subscriptionInformation,
    OR: [{ subscriptionSendingAt: null }, { subscriptionSendingAt: { lt: new Date(Date.now() - 180000) } }],
  }, data: { subscriptionSendingAt: now, subscriptionDeliveryKey: key,
    subscriptionFirstAttemptAt: order.subscriptionFirstAttemptAt || now, subscriptionDeliveryError: null } });
  if (!claimed.count) return "sending";
  try {
    const emailId = await sendSubscriptionEmail({
      customerName: order.customerName, customerEmail: order.customerEmail,
      orderNumber: order.orderNumber || order.id, information: order.subscriptionInformation,
      idempotencyKey: `subscription:${key}`,
    });
    await prisma.order.updateMany({ where: { id: orderId, subscriptionDeliveryKey: key }, data: {
      subscriptionSentAt: new Date(), subscriptionEmailId: emailId, subscriptionSendingAt: null, subscriptionDeliveryError: null,
    } });
    return "sent";
  } catch {
    await prisma.order.updateMany({ where: { id: orderId, subscriptionDeliveryKey: key }, data: {
      subscriptionSendingAt: null, subscriptionDeliveryError: "Échec de l’envoi. Vérifiez la configuration email puis réessayez.",
    } });
    throw new PaymentError("L’email n’a pas pu être envoyé. Veuillez réessayer.", 502);
  }
}
