import "server-only";
import prisma from "@/lib/prisma";
import { getOrderById } from "@/lib/store";
import { prepareOrderConfirmation, prepareAdminOrderNotification, sendPreparedOrderEmail, type OrderEmailPayload } from "@/lib/email";

// Resend retains idempotency keys for 24 hours. Stop automatic retries sooner.
const retryWindow = 23 * 60 * 60 * 1000;
export async function dispatchOrderEmail(id: string) {
  const row = await prisma.orderEmailDelivery.findUnique({ where: { id } });
  if (!row || row.status !== "PENDING" || row.nextAttemptAt > new Date()) return;
  if (row.firstAttemptAt && Date.now() - row.firstAttemptAt.getTime() >= retryWindow) {
    await prisma.orderEmailDelivery.updateMany({ where: { id, status: "PENDING" }, data: { status: "UNKNOWN", error: "Délai de reprise dépassé. Vérifiez les journaux Resend avant tout nouvel envoi." } });
    return;
  }
  const claimed = await prisma.orderEmailDelivery.updateMany({ where: { id, status: "PENDING" }, data: { status: "SENDING", startedAt: new Date(), error: null } });
  if (!claimed.count) return;
  try {
    let payload = row.payload as OrderEmailPayload | null;
    if (!payload) {
      const order = await getOrderById(row.orderId);
      if (!order) throw new Error("Commande introuvable.");
      payload = row.kind === "CUSTOMER_CONFIRMATION" ? await prepareOrderConfirmation(order) : await prepareAdminOrderNotification(order);
      if (!payload) {
        await prisma.orderEmailDelivery.update({ where: { id }, data: { status: "SKIPPED", error: "Email administrateur désactivé dans les paramètres." } });
        return;
      }
      // Freeze recipient and content so every retry uses exactly the same request.
      await prisma.orderEmailDelivery.update({ where: { id }, data: { payload } });
    }
    if (!process.env.RESEND_API_KEY) throw new Error("Service email non configuré (RESEND_API_KEY manquant).");
    await prisma.orderEmailDelivery.update({ where: { id }, data: { firstAttemptAt: row.firstAttemptAt ?? new Date(), attempts: { increment: 1 } } });
    const providerId = await sendPreparedOrderEmail(payload, `order-email/${id}`);
    await prisma.orderEmailDelivery.update({ where: { id }, data: { status: "ACCEPTED", providerId, acceptedAt: new Date(), error: null } });
  } catch (error) {
    await prisma.orderEmailDelivery.updateMany({ where: { id, status: "SENDING" }, data: {
      status: !process.env.RESEND_API_KEY || row.attempts >= 5 ? "FAILED" : "PENDING",
      nextAttemptAt: new Date(Date.now() + 5 * 60000),
      error: error instanceof Error ? error.message : "Envoi email indisponible.",
    } });
  }
}

export async function dispatchOrderEmails(orderId: string) {
  const rows = await prisma.orderEmailDelivery.findMany({ where: { orderId, status: "PENDING" }, select: { id: true } });
  await Promise.all(rows.map(row => dispatchOrderEmail(row.id)));
}

export async function drainOrderEmails() {
  await prisma.orderEmailDelivery.updateMany({ where: { status: "SENDING", startedAt: { lt: new Date(Date.now() - 5 * 60000) } }, data: { status: "PENDING" } });
  const rows = await prisma.orderEmailDelivery.findMany({ where: { status: "PENDING", nextAttemptAt: { lte: new Date() } }, orderBy: { createdAt: "asc" }, take: 6, select: { id: true } });
  await Promise.all(rows.map(row => dispatchOrderEmail(row.id)));
  return rows.length;
}
