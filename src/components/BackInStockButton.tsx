"use client";

import { useState } from "react";

export default function BackInStockButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(`/api/products/${slug}/notify-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Une erreur est survenue.");
        setStatus("error");
        return;
      }
      setMessage(data.alreadyExists ? "Vous êtes déjà inscrit pour ce produit." : "Parfait ! Nous vous préviendrons dès le retour en stock.");
      setStatus("success");
    } catch {
      setMessage("Une erreur est survenue. Réessayez.");
      setStatus("error");
    }
  }

  return (
    <div className="border-t border-gray-100 pt-4">
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <p className="text-sm font-black text-slate-900 flex items-center gap-2">
          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          Produit en rupture de stock
        </p>
        {status === "success" ? (
          <p className="text-sm text-emerald-700 font-semibold mt-2">{message}</p>
        ) : !open ? (
          <>
            <p className="text-xs text-slate-600 mt-1.5 mb-3">Soyez informé(e) par e-mail dès qu&rsquo;il est de nouveau disponible.</p>
            <button
              onClick={() => setOpen(true)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-sm py-2.5 rounded-lg transition-colors"
            >
              Prévenez-moi
            </button>
          </>
        ) : (
          <form onSubmit={submit} className="mt-3 space-y-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@email.com"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {status === "error" && <p className="text-xs text-red-600 font-semibold">{message}</p>}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-sm py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {status === "loading" ? "Envoi..." : "M'avertir du retour en stock"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
