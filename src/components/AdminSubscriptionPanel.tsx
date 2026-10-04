"use client";
import { useState } from "react";
import type { Order } from "@/lib/types";

export default function AdminSubscriptionPanel({ order, onUpdated }: { order: Order; onUpdated: (updated: Order) => void }) {
  const [information, setInformation] = useState(order.subscriptionInformation || "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function save(send: boolean) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/orders/subscription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: order.id, information, send }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Action impossible.");
      onUpdated(data.order); setMessage(data.delivery === "sent" ? "Abonnement envoyé par email." : order.paymentStatus === "paid" ? "Informations enregistrées. Cliquez sur Envoyer l’abonnement par email pour les transmettre au client." : "Informations enregistrées. Elles seront envoyées automatiquement après le paiement.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Erreur de connexion."); }
    finally { setBusy(false); }
  }
  return <section className="sm:col-span-2 rounded-xl border border-slate-200 bg-white p-4">
    <h3 className="text-sm font-semibold text-slate-900">Paiement et abonnement</h3>
    <dl className="my-4 grid gap-3 text-xs sm:grid-cols-2">
      <div><dt className="text-slate-500">Commande</dt><dd className="break-all">{order.orderNumber || order.id}</dd></div>
      <div><dt className="text-slate-500">Email du client</dt><dd className="break-all">{order.customerEmail || "Non renseigné"}</dd></div>
      <div><dt className="text-slate-500">Prestataire</dt><dd>{order.paymentProvider || "—"}</dd></div>
      <div><dt className="text-slate-500">Référence</dt><dd className="break-all">{order.paymentReference || "—"}</dd></div>
      <div><dt className="text-slate-500">Montant payé</dt><dd>{order.paymentAmount === undefined ? "—" : new Intl.NumberFormat("fr-FR", { style: "currency", currency: order.paymentCurrency || "EUR" }).format(order.paymentAmount / 100)}</dd></div>
      <div><dt className="text-slate-500">Date du paiement</dt><dd>{order.paidAt ? new Date(order.paidAt).toLocaleString("fr-FR") : "—"}</dd></div>
      <div><dt className="text-slate-500">Livraison de l’abonnement</dt><dd>{order.subscriptionSentAt ? `Envoyé le ${new Date(order.subscriptionSentAt).toLocaleString("fr-FR")}` : order.subscriptionDeliveryError ? "Envoi échoué — à réessayer" : order.subscriptionFirstAttemptAt ? "Envoi en cours / à vérifier" : "En attente"}</dd></div>
    </dl>
    <label htmlFor={`subscription-${order.id}`} className="block text-xs font-semibold text-slate-700">Informations de l’abonnement</label>
    <textarea id={`subscription-${order.id}`} value={information} onChange={e => setInformation(e.target.value)} rows={5} maxLength={20000} disabled={busy || Boolean(order.subscriptionSentAt || order.subscriptionFirstAttemptAt)} className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm disabled:bg-slate-50" placeholder="Identifiants, lien d’accès, durée et instructions…" />
    <p className="mt-2 text-xs text-slate-500">Envoi uniquement par email au client, après confirmation du paiement.</p>
    {!order.subscriptionSentAt && <div className="mt-4 flex flex-wrap gap-3">
      <button type="button" onClick={() => save(false)} disabled={busy || !information.trim() || Boolean(order.subscriptionFirstAttemptAt)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold disabled:opacity-50">Enregistrer les informations</button>
      <button type="button" onClick={() => save(true)} disabled={busy || !information.trim() || order.paymentStatus !== "paid" || order.status === "cancelled"} className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{busy ? "Traitement…" : "Envoyer l’abonnement par email"}</button>
    </div>}
    {message && <p role="status" className="mt-3 text-sm text-slate-700">{message}</p>}
    {order.subscriptionDeliveryError && <p className="mt-3 text-xs text-red-700">{order.subscriptionDeliveryError}</p>}
  </section>;
}
