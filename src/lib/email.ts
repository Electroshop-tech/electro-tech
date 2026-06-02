import { Resend } from "resend";
import type { Order } from "./types";
import { getSiteSettings } from "./store";

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

const BRAND_COLOR = "#f97316";
const SITE_NAME = "ElectroShop-Tech";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://electroshop-tech.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "contact.electrotetch@gmail.com";

// Resolve the address that should receive order/contact notifications.
// Priority: the email saved by the owner in admin Settings → env → default.
async function getAdminRecipient(): Promise<string> {
  try {
    const settings = await getSiteSettings();
    const siteEmail = settings.siteEmail?.trim();
    if (siteEmail) return siteEmail;
  } catch (err) {
    console.error("[email] Failed to load site settings for recipient:", err);
  }
  return ADMIN_EMAIL;
}

// Public-facing contact address shown to customers in emails.
const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "contact@electroshop-tech.com";
// Verified sending address on the electroshop-tech.com domain (Resend).
const FROM_EMAIL = process.env.RESEND_FROM ?? `${SITE_NAME} <commandes@electroshop-tech.com>`;

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

function baseLayout(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%);padding:28px 32px;text-align:center;">
            <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">${SITE_NAME}</span>
            <br/><span style="font-size:11px;color:${BRAND_COLOR};font-weight:700;letter-spacing:2px;text-transform:uppercase;">Technologie · Multimédia · Performance</span>
          </td>
        </tr>
        <!-- Content -->
        <tr><td style="padding:32px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} ${SITE_NAME} · Tous droits réservés</p>
            <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;"><a href="${SITE_URL}" style="color:${BRAND_COLOR};text-decoration:none;">${SITE_URL}</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function orderItemsTable(order: Order): string {
  const rows = order.items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
        <span style="font-weight:600;color:#1e293b;">${item.productName}</span>
        <br/><span style="font-size:12px;color:#94a3b8;">Qté : ${item.quantity}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;color:#1e293b;">
        ${(item.price * item.quantity).toFixed(2)}€
      </td>
    </tr>
  `).join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <thead>
        <tr>
          <th style="text-align:left;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;border-bottom:2px solid #e2e8f0;">Produit</th>
          <th style="text-align:right;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;border-bottom:2px solid #e2e8f0;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td style="padding-top:12px;font-weight:900;color:#1e293b;font-size:16px;">Total</td>
          <td style="padding-top:12px;text-align:right;font-weight:900;color:${BRAND_COLOR};font-size:18px;">${order.total.toFixed(2)}€</td>
        </tr>
      </tfoot>
    </table>
  `;
}

// ── Customer confirmation email ───────────────────────────────────────────────
export async function sendOrderConfirmation(order: Order): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not configured — skipping customer confirmation for order ${order.id}`);
    return;
  }

  const content = `
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:900;color:#1e293b;">Commande confirmée ! 🎉</h1>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Merci <strong>${order.customerName}</strong>, votre commande a bien été reçue.</p>

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#92400e;">
        <strong>N° de commande :</strong> <code style="background:#fee0c0;padding:2px 8px;border-radius:6px;font-weight:700;">${order.id.slice(-12).toUpperCase()}</code>
      </p>
      <p style="margin:6px 0 0;font-size:13px;color:#92400e;">
        <strong>Statut :</strong> ${STATUS_LABELS[order.status]}
      </p>
    </div>

    <h3 style="font-size:14px;font-weight:700;color:#1e293b;margin:0 0 8px;">Récapitulatif de votre commande</h3>
    ${orderItemsTable(order)}

    <h3 style="font-size:14px;font-weight:700;color:#1e293b;margin:20px 0 8px;">Adresse de livraison</h3>
    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
      ${order.address.street}<br/>
      ${order.address.postalCode} ${order.address.city}<br/>
      ${order.address.country}
    </p>

    <div style="margin:28px 0 0;text-align:center;">
      <a href="${SITE_URL}/compte" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 32px;border-radius:10px;">
        Suivre ma commande →
      </a>
    </div>
    <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
      Des questions ? Contactez-nous à <a href="mailto:${CONTACT_EMAIL}" style="color:${BRAND_COLOR};">${CONTACT_EMAIL}</a>
    </p>
  `;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: order.customerEmail,
    subject: `✅ Commande confirmée – ${order.id.slice(-8).toUpperCase()} | ${SITE_NAME}`,
    html: baseLayout(content, "Confirmation de commande"),
  });

  if (error) {
    console.error(`[email] Failed to send customer confirmation:`, error);
  } else {
    console.log(`[email] Confirmation sent to ${order.customerEmail}`);
  }
}

// ── Admin notification email ──────────────────────────────────────────────────
export async function sendAdminOrderNotification(order: Order): Promise<void> {
  const resend = getResend();

  if (!resend) {
    console.log(`[email] RESEND_API_KEY not configured — skipping admin notification for order ${order.id}`);
    return;
  }

  const adminRecipient = await getAdminRecipient();

  const content = `
    <h1 style="margin:0 0 4px;font-size:20px;font-weight:900;color:#1e293b;">Nouvelle commande reçue 🛍️</h1>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Une nouvelle commande vient d'être passée sur ${SITE_NAME}.</p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#166534;padding:3px 0;"><strong>Commande :</strong></td>
          <td style="font-size:13px;color:#166534;text-align:right;"><code style="background:#dcfce7;padding:2px 8px;border-radius:6px;font-weight:700;">${order.id.slice(-12).toUpperCase()}</code></td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#166534;padding:3px 0;"><strong>Client :</strong></td>
          <td style="font-size:13px;color:#166534;text-align:right;">${order.customerName}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#166534;padding:3px 0;"><strong>Email :</strong></td>
          <td style="font-size:13px;color:#166534;text-align:right;">${order.customerEmail}</td>
        </tr>
        ${order.customerPhone ? `<tr><td style="font-size:13px;color:#166534;padding:3px 0;"><strong>Téléphone :</strong></td><td style="font-size:13px;color:#166534;text-align:right;">${order.customerPhone}</td></tr>` : ""}
        <tr>
          <td style="font-size:13px;color:#166534;padding:3px 0;"><strong>Paiement :</strong></td>
          <td style="font-size:13px;color:#166534;text-align:right;">${order.paymentMethod === "cash_on_delivery" ? "Paiement à la livraison" : order.paymentMethod}</td>
        </tr>
      </table>
    </div>

    <h3 style="font-size:14px;font-weight:700;color:#1e293b;margin:0 0 8px;">Détail de la commande</h3>
    ${orderItemsTable(order)}

    <h3 style="font-size:14px;font-weight:700;color:#1e293b;margin:20px 0 8px;">Adresse de livraison</h3>
    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
      ${order.address.street}<br/>
      ${order.address.postalCode} ${order.address.city}<br/>
      ${order.address.country}
    </p>

    <div style="margin:28px 0 0;text-align:center;">
      <a href="${SITE_URL}/admin/orders" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 32px;border-radius:10px;">
        Voir dans le panel admin →
      </a>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: adminRecipient,
    subject: `🛍️ Nouvelle commande ${order.id.slice(-8).toUpperCase()} – ${order.customerName} (${order.total.toFixed(2)}€)`,
    html: baseLayout(content, "Nouvelle commande"),
  });

  if (error) {
    console.error(`[email] Failed to send admin notification:`, error);
  } else {
    console.log(`[email] Admin notification sent to ${adminRecipient}`);
  }
}

// ── Newsletter bulk email ─────────────────────────────────────────────────────
export async function sendNewsletterBulk(
  subscribers: { email: string; unsubscribeToken: string }[],
  subject: string,
  body: string,
  image?: { imageBase64: string; imageMimeType: string }
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const resend = getResend();
  if (!resend) {
    console.log("[email] RESEND_API_KEY not configured — skipping newsletter bulk send");
    return { sent: 0, failed: subscribers.length, errors: ["RESEND_API_KEY not configured"] };
  }

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  // Send in batches of 10 to avoid rate limits
  const BATCH_SIZE = 10;
  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(sub => {
        const unsubUrl = `${SITE_URL}/api/newsletter/unsubscribe?token=${sub.unsubscribeToken}`;
        const imageHtml = image
          ? `<div style="margin:0 0 20px;text-align:center;"><img src="data:${image.imageMimeType};base64,${image.imageBase64}" alt="" style="max-width:100%;max-height:400px;border-radius:12px;display:inline-block;" /></div>`
          : "";
        const htmlContent = baseLayout(
          `
          ${imageHtml}
          <div style="font-size:14px;color:#334155;line-height:1.7;">
            ${body.split("\n").map(line => line.trim() ? `<p style="margin:0 0 12px;">${line}</p>` : "").join("")}
          </div>
          <div style="margin:28px 0 0;text-align:center;">
            <a href="${SITE_URL}/produits" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 32px;border-radius:10px;">
              Découvrir nos produits →
            </a>
          </div>
          <p style="margin:20px 0 0;font-size:11px;color:#94a3b8;text-align:center;">
            Vous recevez cet e-mail car vous êtes abonné(e) à la newsletter ${SITE_NAME}.<br/>
            <a href="${unsubUrl}" style="color:${BRAND_COLOR};">Se désabonner</a>
          </p>
          `,
          subject
        );
        return resend.emails.send({
          from: FROM_EMAIL,
          to: sub.email,
          subject,
          html: htmlContent,
        });
      })
    );
    for (const result of results) {
      if (result.status === "fulfilled" && !result.value.error) {
        sent++;
      } else {
        failed++;
        const errMsg = result.status === "rejected"
          ? String(result.reason)
          : JSON.stringify((result.value as { error: unknown }).error);
        errors.push(errMsg);
      }
    }
  }

  console.log(`[email] Newsletter sent: ${sent}/${subscribers.length} (${failed} failed)`);
  return { sent, failed, errors };
}

// ── Contact form notification to admin ────────────────────────────────────────
export async function sendContactNotification(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log("[email] RESEND_API_KEY not configured — skipping contact notification");
    return;
  }

  const adminRecipient = await getAdminRecipient();

  const content = `
    <h1 style="margin:0 0 4px;font-size:20px;font-weight:900;color:#1e293b;">Nouveau message de contact 📩</h1>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Un visiteur a envoyé un message via le formulaire de contact.</p>

    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#0c4a6e;padding:3px 0;"><strong>Nom :</strong></td>
          <td style="font-size:13px;color:#0c4a6e;text-align:right;">${data.name}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#0c4a6e;padding:3px 0;"><strong>Email :</strong></td>
          <td style="font-size:13px;color:#0c4a6e;text-align:right;"><a href="mailto:${data.email}" style="color:${BRAND_COLOR};">${data.email}</a></td>
        </tr>
        ${data.phone ? `<tr><td style="font-size:13px;color:#0c4a6e;padding:3px 0;"><strong>Tél :</strong></td><td style="font-size:13px;color:#0c4a6e;text-align:right;">${data.phone}</td></tr>` : ""}
        <tr>
          <td style="font-size:13px;color:#0c4a6e;padding:3px 0;"><strong>Sujet :</strong></td>
          <td style="font-size:13px;color:#0c4a6e;text-align:right;">${data.subject}</td>
        </tr>
      </table>
    </div>

    <h3 style="font-size:14px;font-weight:700;color:#1e293b;margin:0 0 8px;">Message</h3>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;">
      <p style="margin:0;font-size:13px;color:#334155;line-height:1.7;white-space:pre-wrap;">${data.message}</p>
    </div>

    <div style="margin:28px 0 0;text-align:center;">
      <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 32px;border-radius:10px;">
        Répondre au client →
      </a>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: adminRecipient,
    subject: `📩 Contact: ${data.subject} — ${data.name}`,
    html: baseLayout(content, "Nouveau message de contact"),
  });

  if (error) {
    console.error("[email] Failed to send contact notification:", error);
  } else {
    console.log(`[email] Contact notification sent to ${adminRecipient}`);
  }
}

// ── Password reset email ──────────────────────────────────────────────────────
export async function sendPasswordResetEmail(email: string, firstName: string, token: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not configured — skipping password reset for ${email}`);
    return;
  }

  const resetUrl = `${SITE_URL}/reinitialiser-mot-de-passe?token=${token}`;
  const content = `
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:900;color:#1e293b;">Réinitialisation du mot de passe 🔐</h1>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Bonjour <strong>${firstName}</strong>, vous avez demandé à réinitialiser votre mot de passe.</p>

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#92400e;">
        Ce lien expirera dans <strong>1 heure</strong>. Si vous n'avez pas fait cette demande, ignorez cet e-mail.
      </p>
    </div>

    <div style="margin:28px 0;text-align:center;">
      <a href="${resetUrl}" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:14px 40px;border-radius:10px;">
        Réinitialiser mon mot de passe →
      </a>
    </div>

    <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
      Si le bouton ne fonctionne pas, copiez ce lien :<br/>
      <a href="${resetUrl}" style="color:${BRAND_COLOR};word-break:break-all;font-size:11px;">${resetUrl}</a>
    </p>
  `;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `🔐 Réinitialisation de mot de passe | ${SITE_NAME}`,
    html: baseLayout(content, "Réinitialisation de mot de passe"),
  });

  if (error) {
    console.error("[email] Failed to send password reset:", error);
  } else {
    console.log(`[email] Password reset sent to ${email}`);
  }
}

// ── Order status change email ─────────────────────────────────────────────────
export async function sendOrderStatusEmail(order: Order, trackingNumber?: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not configured — skipping status email for order ${order.id}`);
    return;
  }

  const statusEmojis: Record<string, string> = {
    confirmed: "✅",
    preparing: "📦",
    shipped: "🚚",
    delivered: "📦",
    cancelled: "❌",
  };

  const statusMessages: Record<string, string> = {
    confirmed: "Votre commande a été confirmée et sera bientôt préparée pour l'expédition.",
    preparing: "Votre commande est en cours de préparation dans nos entrepôts.",
    shipped: "Votre commande est en route ! Elle devrait arriver prochainement.",
    delivered: "Votre commande a été livrée avec succès. Merci pour votre confiance !",
    cancelled: "Votre commande a été annulée. Si vous avez des questions, contactez-nous.",
  };

  const emoji = statusEmojis[order.status] ?? "📋";
  const message = statusMessages[order.status] ?? `Le statut de votre commande a été mis à jour : ${STATUS_LABELS[order.status]}.`;

  const trackingSection = trackingNumber && order.status === "shipped"
    ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin:16px 0;">
        <p style="margin:0;font-size:13px;color:#166534;">
          <strong>N° de suivi :</strong> <code style="background:#dcfce7;padding:2px 8px;border-radius:6px;font-weight:700;">${trackingNumber}</code>
        </p>
      </div>`
    : "";

  const content = `
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:900;color:#1e293b;">Mise à jour de commande ${emoji}</h1>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Bonjour <strong>${order.customerName}</strong>,</p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin-bottom:16px;">
      <p style="margin:0 0 8px;font-size:13px;color:#475569;">
        <strong>N° de commande :</strong> <code style="background:#e2e8f0;padding:2px 8px;border-radius:6px;font-weight:700;">${order.id.slice(-12).toUpperCase()}</code>
      </p>
      <p style="margin:0;font-size:13px;color:#475569;">
        <strong>Nouveau statut :</strong> <span style="color:${BRAND_COLOR};font-weight:700;">${STATUS_LABELS[order.status]}</span>
      </p>
    </div>

    <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.6;">${message}</p>

    ${trackingSection}

    ${orderItemsTable(order)}

    <div style="margin:28px 0 0;text-align:center;">
      <a href="${SITE_URL}/suivi-commande" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 32px;border-radius:10px;">
        Suivre ma commande →
      </a>
    </div>
    <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
      Des questions ? <a href="mailto:${CONTACT_EMAIL}" style="color:${BRAND_COLOR};">${CONTACT_EMAIL}</a>
    </p>
  `;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: order.customerEmail,
    subject: `${emoji} Commande ${STATUS_LABELS[order.status]} – ${order.id.slice(-8).toUpperCase()} | ${SITE_NAME}`,
    html: baseLayout(content, "Mise à jour de commande"),
  });

  if (error) {
    console.error("[email] Failed to send status email:", error);
  } else {
    console.log(`[email] Status email (${order.status}) sent to ${order.customerEmail}`);
  }
}

// ── Welcome email ─────────────────────────────────────────────────────────────
export async function sendWelcomeEmail(email: string, firstName: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not configured — skipping welcome email for ${email}`);
    return;
  }

  const content = `
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:900;color:#1e293b;">Bienvenue sur ${SITE_NAME} ! 🎉</h1>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Bonjour <strong>${firstName}</strong>, votre compte a été créé avec succès.</p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px;">
      <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#166534;">Ce que vous pouvez faire :</h3>
      <ul style="margin:0;padding:0 0 0 16px;font-size:13px;color:#166534;line-height:2;">
        <li>Suivre vos commandes en temps réel</li>
        <li>Sauvegarder vos produits favoris</li>
        <li>Bénéficier d'offres exclusives</li>
        <li>Commander plus rapidement</li>
      </ul>
    </div>

    <div style="margin:28px 0 0;text-align:center;">
      <a href="${SITE_URL}/produits" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 32px;border-radius:10px;">
        Découvrir nos produits →
      </a>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `🎉 Bienvenue sur ${SITE_NAME} !`,
    html: baseLayout(content, "Bienvenue"),
  });

  if (error) {
    console.error("[email] Failed to send welcome email:", error);
  } else {
    console.log(`[email] Welcome email sent to ${email}`);
  }
}

// ── Back-in-stock notification ────────────────────────────────────────────────

export async function sendBackInStockEmail(emails: string[], productName: string, productSlug: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not configured — skipping back-in-stock email for ${productName}`);
    return;
  }
  if (emails.length === 0) return;

  const content = `
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:900;color:#1e293b;">C'est de retour ! 🎉</h1>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Bonne nouvelle — le produit que vous attendiez est de nouveau disponible.</p>

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;font-size:16px;font-weight:800;color:#9a3412;">${productName}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#c2410c;">Stock limité — commandez vite avant qu'il ne reparte !</p>
    </div>

    <div style="margin:28px 0 0;text-align:center;">
      <a href="${SITE_URL}/produits/${productSlug}" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 32px;border-radius:10px;">
        Voir le produit →
      </a>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: FROM_EMAIL,
    bcc: emails,
    subject: `🔔 ${productName} est de nouveau en stock !`,
    html: baseLayout(content, "De retour en stock"),
  });

  if (error) {
    console.error("[email] Failed to send back-in-stock email:", error);
  } else {
    console.log(`[email] Back-in-stock email sent to ${emails.length} subscriber(s) for ${productName}`);
  }
}
