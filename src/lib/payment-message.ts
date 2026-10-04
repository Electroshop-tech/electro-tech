import type { Order } from "./types";

export function paymentLink(value: string): string | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function paymentMessage(order: Order, url: string): string {
  const money = (value: number) => value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
  return [
    `Bonjour ${order.customerName},`, "",
    `Merci pour votre commande ${order.orderNumber || order.id} chez ElectroShop-Tech.`, "",
    "Articles commandés :",
    ...order.items.map(item => `• ${item.productName} × ${item.quantity} — ${money(item.price * item.quantity)}`),
    "", `Total à régler : ${money(order.total)}`, "",
    "Pour régler votre commande, utilisez ce lien :", url, "",
    "Nous préparerons votre commande après confirmation du paiement.",
    "Une question ? Répondez à ce message, nous sommes à votre disposition.", "",
    "Merci pour votre confiance !", "L’équipe ElectroShop-Tech",
  ].join("\n");
}
