"use client";

import { useState, useEffect, useCallback } from "react";

interface Promo {
  id: number;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  uses: number;
  maxUses: number;
  active: boolean;
  expires: string;
}

const headers = { "Content-Type": "application/json" };

export default function PromotionsPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent" as "percent" | "fixed", value: "", minOrder: "", maxUses: "", expires: "" });

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/promos", { credentials: "include" })
      .then(r => r.json())
      .then(d => setPromos(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/promos", {
      method: "POST",
      headers,
      body: JSON.stringify({
        code: form.code.toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minOrder: Number(form.minOrder) || 0,
        maxUses: Number(form.maxUses) || 100,
        active: true,
        expires: form.expires,
      }),
    });
    setShowForm(false);
    setForm({ code: "", type: "percent", value: "", minOrder: "", maxUses: "", expires: "" });
    load();
  }

  async function toggleActive(p: Promo) {
    await fetch("/api/admin/promos", {
      method: "PUT",
      headers,
      body: JSON.stringify({ id: p.id, active: !p.active }),
    });
    load();
  }

  async function deletePromo(id: number) {
    if (!confirm("Supprimer ce code promo ?")) return;
    await fetch("/api/admin/promos", {
      method: "DELETE",
      headers,
      body: JSON.stringify({ id }),
    });
    load();
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition bg-gray-50";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Promotions</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez vos codes promo et réductions</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Nouveau code
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-black text-gray-900 mb-5">Créer un code promo</h2>
          <form onSubmit={handleAdd} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Code</label>
              <input required className={inputCls} placeholder="ex: SOLDES20" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Type</label>
              <select className={inputCls} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as "percent" | "fixed" }))}>
                <option value="percent">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Valeur ({form.type === "percent" ? "%" : "MAD"})</label>
              <input required type="number" min={1} className={inputCls} placeholder="10" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Commande min (€)</label>
              <input type="number" min={0} className={inputCls} placeholder="0" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Utilisations max</label>
              <input required type="number" min={1} className={inputCls} placeholder="100" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Date d&apos;expiration</label>
              <input required type="date" className={inputCls} value={form.expires} onChange={e => setForm(f => ({ ...f, expires: e.target.value }))} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Annuler</button>
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition">Créer</button>
            </div>
          </form>
        </div>
      )}

      {/* Promo list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : promos.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Aucun code promo. Cliquez sur &quot;Nouveau code&quot; pour en créer un.</div>
        ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Code</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Réduction</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Utilisations</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Expiration</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Statut</th>
              <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {promos.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <code className="font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg text-xs">{p.code}</code>
                  {p.minOrder > 0 && <p className="text-xs text-gray-400 mt-1">Min. {p.minOrder}€</p>}
                </td>
                <td className="px-5 py-4 font-bold text-gray-800">
                  {p.value}{p.type === "percent" ? "%" : "€"}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full" style={{ width: `${Math.min(100, (p.uses / p.maxUses) * 100)}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{p.uses}/{p.maxUses}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-gray-500">{new Date(p.expires).toLocaleDateString("fr-FR")}</td>
                <td className="px-5 py-4">
                  <button onClick={() => toggleActive(p)} className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all ${p.active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                    {p.active ? "Actif" : "Inactif"}
                  </button>
                </td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => deletePromo(p.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}
