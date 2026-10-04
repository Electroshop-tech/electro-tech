"use client";
import { useState } from "react";

export default function PayOrderButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function pay() {
    if (loading) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/payments/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Impossible d’ouvrir le paiement.");
      const destination = new URL(data.url);
      if (destination.protocol !== "https:" || destination.hostname !== "checkout.stripe.com") throw new Error("Adresse de paiement invalide.");
      window.location.assign(destination.href);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion. Veuillez réessayer."); setLoading(false);
    }
  }
  return <div>
    <button type="button" onClick={pay} disabled={loading} className="w-full rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60" aria-busy={loading}>
      {loading ? "Ouverture du paiement sécurisé…" : "Payer maintenant"}
    </button>
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    <p className="mt-3 text-xs text-slate-500">Paiement sécurisé par Stripe. Vos coordonnées bancaires restent chez le prestataire.</p>
  </div>;
}
