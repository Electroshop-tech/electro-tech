"use client";

import { useState } from "react";

export default function ReturnRequestForm() {
  const [form, setForm] = useState({ orderId: "", customerName: "", customerEmail: "", customerPhone: "", reason: "", comment: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("Une erreur est survenue. Réessayez.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="text-slate-900 font-black text-lg">Demande envoyée !</h3>
        <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">Votre demande de retour a bien été enregistrée. Notre équipe vous contactera sous 24h pour confirmer la procédure.</p>
      </div>
    );
  }

  const inputCls = "w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent";

  return (
    <form onSubmit={submit} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">Numéro de commande *</label>
          <input required value={form.orderId} onChange={update("orderId")} placeholder="Ex: cmd_xxxxx" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">E-mail de commande *</label>
          <input required type="email" value={form.customerEmail} onChange={update("customerEmail")} placeholder="vous@email.com" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">Nom complet *</label>
          <input required value={form.customerName} onChange={update("customerName")} placeholder="Votre nom" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">Téléphone</label>
          <input value={form.customerPhone} onChange={update("customerPhone")} placeholder="(+212) ..." className={inputCls} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">Motif du retour *</label>
        <select required value={form.reason} onChange={update("reason")} className={inputCls}>
          <option value="">Sélectionnez un motif</option>
          <option value="Changement d'avis">Changement d&rsquo;avis</option>
          <option value="Produit défectueux">Produit défectueux</option>
          <option value="Produit non conforme">Produit non conforme à la description</option>
          <option value="Erreur de commande">Erreur de commande</option>
          <option value="Autre">Autre</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">Commentaire</label>
        <textarea value={form.comment} onChange={update("comment")} rows={3} placeholder="Précisez votre demande (facultatif)..." className={inputCls} />
      </div>
      {status === "error" && <p className="text-sm text-red-600 font-semibold">{error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-sm py-3 rounded-xl transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "Envoi..." : "Envoyer ma demande de retour"}
      </button>
    </form>
  );
}
