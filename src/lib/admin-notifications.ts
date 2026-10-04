import "server-only";
import prisma from "@/lib/prisma";

export const phonePattern = /^\+[1-9]\d{7,14}$/;
export type PhoneChannel = "sms" | "whatsapp";

export function phoneProviderConfigured(channel: PhoneChannel) {
  const base = /^AC[a-f0-9]{32}$/i.test(process.env.TWILIO_ACCOUNT_SID || "") && Boolean(process.env.TWILIO_AUTH_TOKEN) && (process.env.JWT_SECRET?.length ?? 0) >= 32;
  return base && (channel === "sms" ? phonePattern.test(process.env.TWILIO_SMS_FROM || "") :
    /^whatsapp:\+[1-9]\d{7,14}$/.test(process.env.TWILIO_WHATSAPP_FROM || "") && /^HX[a-f0-9]{32}$/i.test(process.env.TWILIO_WHATSAPP_CONTENT_SID || ""));
}

export async function getPhoneAlertSettings() {
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: ["adminPhoneAlertsEnabled", "adminPhoneAlertsNumber", "adminPhoneAlertsChannel"] } } });
  const settings = Object.fromEntries(rows.map(row => [row.key, row.value]));
  return { enabled: settings.adminPhoneAlertsEnabled === "true", phone: settings.adminPhoneAlertsNumber || "",
    channel: (settings.adminPhoneAlertsChannel === "whatsapp" ? "whatsapp" : "sms") as PhoneChannel };
}

// Capture the opted-in destination at event creation. Enabling later never sends old orders.
export async function notificationSeed(event: "ORDER_CREATED" | "PAYMENT_RECEIVED") {
  const settings = await getPhoneAlertSettings();
  const enabled = settings.enabled && phonePattern.test(settings.phone);
  return { event, phoneStatus: enabled ? "PENDING" : "DISABLED", phoneTo: enabled ? settings.phone : null, phoneChannel: enabled ? settings.channel : null };
}

export function adminOrderLink(orderId: string) {
  const site = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  if (site.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(site.hostname))) throw new Error("Site URL must use HTTPS");
  return `${site.origin}/admin/orders?order=${encodeURIComponent(orderId)}`;
}

// Twilio does not offer a general message-create idempotency key. Never automatically
// resend an ambiguous request: a timeout or interrupted send is UNKNOWN for review.
export async function dispatchPhoneAlert(id: string) {
  const notification = await prisma.adminOrderNotification.findUnique({ where: { id }, include: { order: true } });
  if (!notification || notification.phoneStatus !== "PENDING") return;
  const settings = await getPhoneAlertSettings();
  if (!settings.enabled || settings.phone !== notification.phoneTo || settings.channel !== notification.phoneChannel) {
    await prisma.adminOrderNotification.updateMany({ where: { id, phoneStatus: "PENDING" }, data: { phoneStatus: "DISABLED" } });
    return;
  }
  if (!phoneProviderConfigured(settings.channel)) {
    await prisma.adminOrderNotification.updateMany({ where: { id, phoneStatus: "PENDING" }, data: { phoneStatus: "FAILED", phoneError: "Service téléphonique non configuré." } });
    return;
  }
  const claimed = await prisma.adminOrderNotification.updateMany({ where: { id, phoneStatus: "PENDING" }, data: { phoneStatus: "SENDING", phoneStartedAt: new Date(), phoneError: null } });
  if (!claimed.count) return;
  let attempted = false;
  try {
    const order = notification.order;
    const number = order.orderNumber || order.id;
    const amount = `${order.total.toFixed(2)} ${order.paymentCurrency}`;
    const status = order.paymentStatus === "PAID" ? "Paiement confirme - a traiter" : order.paymentMethod === "assisted" ? "Client a contacter - paiement accompagne" : order.paymentMethod === "stripe" ? "En attente de paiement - a suivre" : "A traiter - paiement a la livraison";
    const link = adminOrderLink(order.id);
    const body = new URLSearchParams();
    if (settings.channel === "whatsapp") {
      body.set("From", process.env.TWILIO_WHATSAPP_FROM!);
      body.set("To", `whatsapp:${notification.phoneTo}`);
      body.set("ContentSid", process.env.TWILIO_WHATSAPP_CONTENT_SID!);
      body.set("ContentVariables", JSON.stringify({ "1": number, "2": amount, "3": status, "4": link }));
    } else {
      body.set("From", process.env.TWILIO_SMS_FROM!);
      body.set("To", notification.phoneTo!);
      body.set("Body", `ElectroShop-Tech: commande ${number}, ${amount}. ${status}. ${link}`);
    }
    attempted = true;
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
      body, signal: AbortSignal.timeout(10000), cache: "no-store",
    });
    if (!response.ok) {
      const definite = response.status >= 400 && response.status < 500;
      await prisma.adminOrderNotification.update({ where: { id }, data: { phoneStatus: definite ? "FAILED" : "UNKNOWN", phoneError: `Service téléphonique : réponse ${response.status}.` } });
      return;
    }
    const data = await response.json();
    if (typeof data.sid !== "string" || !/^SM[a-f0-9]{32}$/i.test(data.sid)) throw new Error("Missing message reference");
    await prisma.adminOrderNotification.update({ where: { id }, data: { phoneStatus: "ACCEPTED", phoneReference: data.sid, phoneAcceptedAt: new Date(), phoneError: null } });
  } catch {
    await prisma.adminOrderNotification.updateMany({ where: { id, phoneStatus: "SENDING" }, data: { phoneStatus: attempted ? "UNKNOWN" : "FAILED", phoneError: attempted ? "Résultat incertain. Vérifiez Twilio avant tout nouvel envoi." : "Configuration du message invalide." } });
  }
}

export async function dispatchOrderAlerts(orderId: string) {
  const pending = await prisma.adminOrderNotification.findMany({ where: { orderId, phoneStatus: "PENDING" }, select: { id: true } });
  await Promise.all(pending.map(row => dispatchPhoneAlert(row.id)));
}

export async function drainPhoneAlerts() {
  await prisma.adminOrderNotification.updateMany({ where: { phoneStatus: "SENDING", phoneStartedAt: { lt: new Date(Date.now() - 5 * 60000) } },
    data: { phoneStatus: "UNKNOWN", phoneError: "Envoi interrompu. Vérifiez Twilio avant tout nouvel envoi." } });
  const rows = await prisma.adminOrderNotification.findMany({ where: { phoneStatus: "PENDING" }, orderBy: { createdAt: "asc" }, take: 3, select: { id: true } });
  await Promise.all(rows.map(row => dispatchPhoneAlert(row.id)));
  return rows.length;
}
