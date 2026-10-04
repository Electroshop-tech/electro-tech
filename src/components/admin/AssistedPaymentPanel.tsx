"use client";

import { useEffect, useId, useState } from "react";
import type { Order } from "@/lib/types";
import { normalizePhone } from "@/lib/whatsapp";
import { paymentLink, paymentMessage } from "@/lib/payment-message";
import styles from "./AssistedPaymentPanel.module.css";

export default function AssistedPaymentPanel({ order, url, onUrlChange }: { order: Order; url: string; onUrlChange: (url: string) => void }) {
  const fieldId = useId();
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/payments/config", { signal: controller.signal }).then(r => r.json()).then(data => setAvailable(Boolean(data.available))).catch(() => {});
    return () => controller.abort();
  }, []);
  if (["paid", "refunded"].includes(order.paymentStatus) || ["cancelled", "delivered"].includes(order.status)) return null;
  const validUrl = paymentLink(url);
  const phone = order.customerPhone ? normalizePhone(order.customerPhone, order.address.country.trim().toLowerCase() === "france" ? "33" : "212") : "";
  const hasPhone = /^\d{8,15}$/.test(phone);
  const message = paymentMessage(order, validUrl || "[Votre lien de paiement]");
  const button = "rounded-lg px-3 py-2.5 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed";

  async function request(action: "generate" | "email") {
    setBusy(true); setError(""); setFeedback("");
    try {
      const res = await fetch(`/api/admin/orders/${action === "generate" ? "payment-link" : "payment-message"}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "generate" ? { orderId: order.id } : { orderId: order.id, url: validUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impossible de terminer cette action.");
      if (action === "generate") {
        const destination = typeof data.url === "string" ? paymentLink(data.url) : null;
        if (!destination || new URL(destination).hostname !== "checkout.stripe.com") throw new Error("Lien de paiement invalide.");
        onUrlChange(destination);
        window.dispatchEvent(new Event("admin-orders-changed"));
      } else setFeedback(`Email accepté pour envoi à ${order.customerEmail}.`);
    } catch (e) { setError(e instanceof Error ? e.message : "Action indisponible. Réessayez."); }
    finally { setBusy(false); }
  }
  async function copyMessage() {
    try { await navigator.clipboard.writeText(message); setFeedback("Message copié."); setError(""); }
    catch { setError("La copie est indisponible. Sélectionnez le texte dans l’aperçu."); }
  }

  return <section className={styles.panel} aria-label="Demande de paiement">
    <div className={styles.heading}><span className={styles.icon} aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18M7 15h4" /></svg></span><div><h3>Demande de paiement</h3><p>Un message prêt à envoyer au client</p></div></div>
    <label className="block text-xs font-bold text-slate-700" htmlFor={`payment-link-${fieldId}`}><span className={styles.step}>1</span>Lien de paiement</label>
    <input id={`payment-link-${fieldId}`} type="url" inputMode="url" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={2048} placeholder="https://buy.stripe.com/…" value={url} disabled={busy}
      onChange={e => { onUrlChange(e.target.value); setError(""); setFeedback(""); }} aria-invalid={Boolean(url && !validUrl)} aria-describedby={`payment-help-${fieldId}`}
      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
    <p id={`payment-help-${fieldId}`} className={`mt-1.5 text-xs ${url && !validUrl ? "text-red-700" : "text-slate-500"}`}>{url && !validUrl ? "Saisissez une adresse complète commençant par https://." : "Créez le lien dans votre compte Stripe pour le montant de cette commande, puis collez-le ici. Le message inclura automatiquement les articles, le total et votre lien."}</p>
    {available && <button type="button" onClick={() => request("generate")} disabled={!order.customerEmail || busy} className={`${button} mt-2 border border-slate-200 bg-white text-slate-700`}>Générer un lien Stripe</button>}
    <details className={styles.preview} open={Boolean(validUrl)}>
      <summary>Voir le message et les articles</summary>
      <textarea aria-label="Aperçu du message à envoyer" id={`payment-preview-${fieldId}`} readOnly value={message} rows={10} className="w-full resize-y p-3 text-xs leading-relaxed text-slate-700" />
    </details>
    <h4 className="mt-4 text-xs font-bold text-slate-700"><span className={styles.step}>2</span>Partager le message prêt à envoyer</h4>
    <p className="mt-2 break-all text-xs text-slate-500">{hasPhone ? `WhatsApp : +${phone}` : "Numéro WhatsApp manquant ou invalide."}</p>
    <p className="mt-1 break-all text-xs text-slate-500">{order.customerEmail ? `Email : ${order.customerEmail}` : "Adresse email manquante."}</p>
    <div className={styles.actions}>
      {validUrl && hasPhone && !busy ? <a href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className={`${button} bg-emerald-600 text-white hover:bg-emerald-700`}>WhatsApp — message avec le lien</a> : <button type="button" disabled className={`${button} bg-emerald-600 text-white`}>WhatsApp — message avec le lien</button>}
      <button type="button" onClick={() => request("email")} disabled={!validUrl || !order.customerEmail || busy} className={`${button} bg-orange-500 text-white hover:bg-orange-600`}>{busy ? "Traitement en cours…" : "Envoyer par email"}</button>
      <button type="button" onClick={copyMessage} disabled={!validUrl || busy} className={`${button} border border-slate-200 bg-white text-slate-700`}>Copier le message</button>
    </div>
    <p className="mt-2 text-xs leading-relaxed text-slate-500">WhatsApp ouvre la conversation du client avec le message complet : appuyez sur Envoyer pour le partager. L’email est envoyé directement depuis ce panneau. Pour un lien créé dans Stripe puis collé ici, vérifiez le règlement dans Stripe avant de confirmer le paiement de la commande.</p>
    {feedback && <p role="status" className="mt-3 text-xs text-emerald-700">{feedback}</p>}
    {error && <p role="alert" className="mt-3 text-xs text-red-700">{error}</p>}
  </section>;
}
