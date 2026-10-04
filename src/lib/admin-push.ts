import "server-only";
import webpush from "web-push";
import prisma from "@/lib/prisma";

export function pushConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT);
}

// Restrict destinations to browser push providers; never fetch arbitrary admin-supplied URLs.
export function validPushEndpoint(endpoint: string) {
  try {
    const url = new URL(endpoint);
    return url.protocol === "https:" && !url.username && !url.password && !url.port &&
      (url.hostname === "fcm.googleapis.com" || url.hostname === "updates.push.services.mozilla.com" ||
       url.hostname === "web.push.apple.com" || url.hostname.endsWith(".push.apple.com") ||
       url.hostname === "wns.windows.com" || url.hostname.endsWith(".notify.windows.com"));
  } catch { return false; }
}

export async function sendPush(subscription: { endpoint: string; p256dh: string; auth: string }, payload: object) {
  if (!pushConfigured()) throw new Error("Push not configured");
  if (!validPushEndpoint(subscription.endpoint)) throw new Error("Invalid push endpoint");
  return webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } }, JSON.stringify(payload), {
    vapidDetails: { subject: process.env.VAPID_SUBJECT!, publicKey: process.env.VAPID_PUBLIC_KEY!, privateKey: process.env.VAPID_PRIVATE_KEY! },
    TTL: 7 * 86400, urgency: "high", timeout: 8000,
  });
}

export function pushFailure(error: unknown) {
  const status = (error as { statusCode?: number })?.statusCode;
  return status === 404 || status === 410 ? "EXPIRED" : status && status >= 400 && status < 500 && status !== 429 ? "FAILED" : "PENDING";
}

export async function drainPushAlerts() {
  if (!pushConfigured()) return 0;
  // The order's durable notification is the outbox. Reconcile missing deliveries
  // after a crash, including orders created while no admin panel is open.
  const subscriptions = await prisma.adminPushSubscription.findMany();
  const users = await prisma.adminUser.findMany({ where: { active: true, role: { in: ["owner", "manager"] } }, select: { id: true } });
  const authorized = new Set(users.map(user => user.id));
  for (const subscription of subscriptions) {
    if (subscription.owner !== "primary-owner" && !authorized.has(subscription.owner)) {
      await prisma.adminPushSubscription.deleteMany({ where: { id: subscription.id } });
      continue;
    }
    const notices = await prisma.adminOrderNotification.findMany({
      where: { createdAt: { gte: subscription.createdAt }, pushDeliveries: { none: { subscriptionId: subscription.id } } },
      orderBy: { createdAt: "asc" }, take: 100, select: { id: true },
    });
    if (notices.length) await prisma.adminPushDelivery.createMany({ data: notices.map(n => ({ notificationId: n.id, subscriptionId: subscription.id })), skipDuplicates: true });
  }
  await prisma.adminPushDelivery.updateMany({ where: { status: "SENDING", startedAt: { lt: new Date(Date.now() - 120000) } }, data: { status: "PENDING" } });
  const deliveries = await prisma.adminPushDelivery.findMany({ where: { status: "PENDING", nextAttemptAt: { lte: new Date() } }, orderBy: { nextAttemptAt: "asc" }, take: 12,
    include: { subscription: true, notification: true } });
  // Four concurrent sends keep a batch within the cron's execution limit.
  for (let offset = 0; offset < deliveries.length; offset += 4) {
    await Promise.all(deliveries.slice(offset, offset + 4).map(async delivery => {
      const claimed = await prisma.adminPushDelivery.updateMany({ where: { id: delivery.id, status: "PENDING" }, data: { status: "SENDING", startedAt: new Date(), attempts: { increment: 1 } } });
      if (!claimed.count) return;
      try {
        await sendPush(delivery.subscription, {
          title: delivery.notification.event === "PAYMENT_RECEIVED" ? "Paiement confirmé" : "Nouvelle commande",
          body: "Une commande vous attend dans le panneau administrateur.",
          tag: delivery.notificationId, url: `/admin/orders?order=${encodeURIComponent(delivery.notification.orderId)}`,
        });
        await prisma.adminPushDelivery.updateMany({ where: { id: delivery.id, status: "SENDING" }, data: { status: "ACCEPTED", acceptedAt: new Date(), error: null } });
      } catch (error) {
        const status = pushFailure(error);
        if (status === "EXPIRED") {
          await prisma.adminPushSubscription.deleteMany({ where: { id: delivery.subscriptionId } });
        } else {
          await prisma.adminPushDelivery.updateMany({ where: { id: delivery.id, status: "SENDING" }, data: {
            status, nextAttemptAt: new Date(Date.now() + Math.min(3600000, 30000 * 2 ** Math.min(delivery.attempts, 7))),
            error: status === "FAILED" ? "Service push refusé : vérifiez la configuration." : "Service temporairement indisponible. Nouvel essai programmé.",
          } });
        }
      }
    }));
  }
  return deliveries.length;
}
