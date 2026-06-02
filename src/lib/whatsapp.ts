import type { Order } from "./types";

const SITE_NAME = "ElectroShop-Tech";

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "en attente",
  confirmed: "confirmée",
  preparing: "en préparation",
  shipped: "expédiée",
  delivered: "livrée",
  cancelled: "annulée",
};

/**
 * Normalise a phone number to international digits for wa.me.
 * Moroccan local numbers (0XXXXXXXXX) are converted to +212.
 */
export function normalizePhone(phone: string, defaultCountryCode = "212"): string {
  let p = phone.replace(/[^\d+]/g, "");
  if (p.startsWith("+")) return p.slice(1);
  if (p.startsWith("00")) return p.slice(2);
  if (p.startsWith("0")) return defaultCountryCode + p.slice(1);
  return p;
}

/**
 * Build a click-to-chat WhatsApp link (no API key required).
 * Returns an empty string when no valid phone is available.
 */
export function buildWhatsAppLink(phone: string | undefined, message: string): string {
  if (!phone) return "";
  const digits = normalizePhone(phone);
  if (digits.length < 8) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Pre-filled message an admin can send to a customer about their order. */
export function orderStatusMessage(order: Order): string {
  const ref = order.id.slice(-8).toUpperCase();
  const lines = [
    `Bonjour ${order.customerName},`,
    "",
    `Votre commande #${ref} chez ${SITE_NAME} est désormais *${STATUS_LABELS[order.status]}*.`,
  ];
  if (order.trackingNumber) {
    lines.push(`Numéro de suivi : ${order.trackingNumber}`);
  }
  lines.push("", `Total : ${order.total.toFixed(2)}€`, "", "Merci pour votre confiance !");
  return lines.join("\n");
}

/** Convenience: WhatsApp link addressed to the order's customer. */
export function customerWhatsAppLink(order: Order): string {
  return buildWhatsAppLink(order.customerPhone, orderStatusMessage(order));
}
