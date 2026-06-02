import type { Order } from "./types";

const BRAND_COLOR = "#f97316";
const SITE_NAME = "ElectroShop-Tech";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://electroshop-tech.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "contact.electrotech@gmail.com";

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const PAYMENT_LABELS: Record<Order["paymentStatus"], string> = {
  unpaid: "Non payée",
  paid: "Payée",
  failed: "Échouée",
  refunded: "Remboursée",
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Render a print-ready (A4) HTML invoice for an order. The page auto-opens
 * the browser print dialog so it can be saved as a PDF — no native binary
 * dependency required, which keeps it serverless-friendly on Vercel.
 */
export function renderInvoiceHTML(order: Order, opts: { autoPrint?: boolean } = {}): string {
  const ref = order.id.slice(-12).toUpperCase();
  const date = new Date(order.createdAt).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const deliveryFee = Math.max(
    0,
    order.total - (order.subtotal - (order.promoDiscount ?? 0))
  );

  const rows = order.items
    .map(
      (it) => `
      <tr>
        <td class="desc">${esc(it.productName)}</td>
        <td class="num">${it.quantity}</td>
        <td class="num">${it.price.toFixed(2)}€</td>
        <td class="num">${(it.price * it.quantity).toFixed(2)}€</td>
      </tr>`
    )
    .join("");

  const promoRow =
    order.promoDiscount && order.promoDiscount > 0
      ? `<tr><td class="lbl">Remise${order.promoCode ? ` (${esc(order.promoCode)})` : ""}</td><td class="val">-${order.promoDiscount.toFixed(2)}€</td></tr>`
      : "";

  const autoPrint = opts.autoPrint
    ? `<script>window.addEventListener("load",function(){setTimeout(function(){window.print();},300);});</script>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Facture ${esc(ref)} — ${SITE_NAME}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; color: #1e293b; margin: 0; padding: 32px; background: #fff; }
  .sheet { max-width: 800px; margin: 0 auto; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid ${BRAND_COLOR}; padding-bottom: 20px; margin-bottom: 28px; }
  .brand { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
  .brand span { color: ${BRAND_COLOR}; }
  .muted { color: #64748b; font-size: 12px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .meta { text-align: right; font-size: 13px; }
  .meta strong { color: #0f172a; }
  .cols { display: flex; gap: 32px; margin-bottom: 28px; }
  .col { flex: 1; }
  .col h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin: 0 0 6px; }
  .col p { margin: 0; font-size: 13px; line-height: 1.6; }
  table.items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  table.items thead th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; border-bottom: 2px solid #e2e8f0; padding: 8px 6px; }
  table.items th.num, table.items td.num { text-align: right; }
  table.items td { padding: 10px 6px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
  td.desc { font-weight: 600; }
  .totals { width: 280px; margin-left: auto; }
  .totals table { width: 100%; border-collapse: collapse; }
  .totals td { padding: 6px 0; font-size: 13px; }
  .totals td.val { text-align: right; font-weight: 600; }
  .totals tr.grand td { border-top: 2px solid #e2e8f0; padding-top: 12px; font-size: 17px; font-weight: 900; }
  .totals tr.grand td.val { color: ${BRAND_COLOR}; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; background: #f1f5f9; color: #334155; }
  .foot { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 11px; }
  @media print { body { padding: 0; } .noprint { display: none; } }
</style>
</head>
<body>
  <div class="sheet">
    <div class="top">
      <div>
        <div class="brand">ElectroShop<span>-Tech</span></div>
        <p class="muted">Technologie · Multimédia · Performance<br/>${esc(SITE_URL)} · ${esc(ADMIN_EMAIL)}</p>
      </div>
      <div class="meta">
        <h1>FACTURE</h1>
        <p class="muted">N° ${esc(ref)}</p>
        <p>Date : <strong>${esc(date)}</strong></p>
        <p>Statut : <span class="badge">${STATUS_LABELS[order.status]}</span></p>
        <p>Paiement : <span class="badge">${PAYMENT_LABELS[order.paymentStatus]}</span></p>
      </div>
    </div>

    <div class="cols">
      <div class="col">
        <h3>Facturé à</h3>
        <p>
          <strong>${esc(order.customerName)}</strong><br/>
          ${esc(order.customerEmail || "")}<br/>
          ${order.customerPhone ? esc(order.customerPhone) : ""}
        </p>
      </div>
      <div class="col">
        <h3>Livraison</h3>
        <p>
          ${esc(order.address.street)}<br/>
          ${esc(order.address.postalCode)} ${esc(order.address.city)}<br/>
          ${esc(order.address.country)}
        </p>
      </div>
    </div>

    <table class="items">
      <thead>
        <tr>
          <th>Produit</th>
          <th class="num">Qté</th>
          <th class="num">Prix U.</th>
          <th class="num">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="totals">
      <table>
        <tr><td class="lbl">Sous-total</td><td class="val">${order.subtotal.toFixed(2)}€</td></tr>
        ${promoRow}
        <tr><td class="lbl">Livraison</td><td class="val">${deliveryFee > 0 ? deliveryFee.toFixed(2) + "€" : "Gratuite"}</td></tr>
        <tr class="grand"><td>Total</td><td class="val">${order.total.toFixed(2)}€</td></tr>
      </table>
    </div>

    <div class="foot">
      Merci pour votre confiance — ${SITE_NAME}<br/>
      Cette facture a été générée automatiquement et est valable sans signature.
    </div>
  </div>
  ${autoPrint}
</body>
</html>`;
}
