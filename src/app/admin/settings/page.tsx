"use client";

import { useState, useEffect } from "react";


const DEFAULTS = {
  siteName: "ElectroShop-Tech",
  siteEmail: "contact.electrotetch@gmail.com",
  sitePhone: "(+212) 716-408919",
  currency: "EUR",
  deliveryFee: "30",
  freeDeliveryFrom: "500",
  maintenanceMode: "false",
  newOrderEmail: "true",
  lowStockAlert: "true",
  lowStockThreshold: "5",
};

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    siteName: DEFAULTS.siteName,
    siteEmail: DEFAULTS.siteEmail,
    sitePhone: DEFAULTS.sitePhone,
    currency: DEFAULTS.currency,
    deliveryFee: DEFAULTS.deliveryFee,
    freeDeliveryFrom: DEFAULTS.freeDeliveryFrom,
    maintenanceMode: false,
    newOrderEmail: true,
    lowStockAlert: true,
    lowStockThreshold: DEFAULTS.lowStockThreshold,
  });

  useEffect(() => {
    fetch("/api/admin/settings", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        if (data && typeof data === "object" && !data.error) {
          setForm(prev => ({
            siteName: data.siteName ?? prev.siteName,
            siteEmail: data.siteEmail ?? prev.siteEmail,
            sitePhone: data.sitePhone ?? prev.sitePhone,
            currency: data.currency ?? prev.currency,
            deliveryFee: data.deliveryFee ?? prev.deliveryFee,
            freeDeliveryFrom: data.freeDeliveryFrom ?? prev.freeDeliveryFrom,
            maintenanceMode: data.maintenanceMode === "true",
            newOrderEmail: data.newOrderEmail !== "false",
            lowStockAlert: data.lowStockAlert !== "false",
            lowStockThreshold: data.lowStockThreshold ?? prev.lowStockThreshold,
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({
        siteName: form.siteName,
        siteEmail: form.siteEmail,
        sitePhone: form.sitePhone,
        currency: form.currency,
        deliveryFee: form.deliveryFee,
        freeDeliveryFrom: form.freeDeliveryFrom,
        maintenanceMode: String(form.maintenanceMode),
        newOrderEmail: String(form.newOrderEmail),
        lowStockAlert: String(form.lowStockAlert),
        lowStockThreshold: form.lowStockThreshold,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition bg-gray-50 focus:bg-white";
  const labelCls = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="max-w-3xl space-y-7 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900">Paramètres</h1>
        <p className="text-gray-500 text-sm mt-1">Configuration générale de la boutique</p>
      </div>

      {saved && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-sm font-semibold">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Paramètres enregistrés avec succès.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
      <form onSubmit={handleSave} className="space-y-6">
        {/* General */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <span className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            Informations générales
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Nom de la boutique</label><input className={inputCls} value={form.siteName} onChange={e => setForm(f => ({ ...f, siteName: e.target.value }))} /></div>
            <div><label className={labelCls}>Email de contact</label><input type="email" className={inputCls} value={form.siteEmail} onChange={e => setForm(f => ({ ...f, siteEmail: e.target.value }))} /></div>
            <div><label className={labelCls}>Téléphone</label><input className={inputCls} value={form.sitePhone} onChange={e => setForm(f => ({ ...f, sitePhone: e.target.value }))} /></div>
            <div><label className={labelCls}>Devise</label>
              <select className={inputCls} value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                <option value="EUR">EUR — Euro</option>
                <option value="MAD">MAD — Dirham marocain</option>
                <option value="USD">USD — Dollar américain</option>
              </select>
            </div>
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <span className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            </span>
            Livraison
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Frais de livraison (€)</label><input type="number" min={0} className={inputCls} value={form.deliveryFee} onChange={e => setForm(f => ({ ...f, deliveryFee: e.target.value }))} /></div>
            <div><label className={labelCls}>Livraison gratuite à partir de (€)</label><input type="number" min={0} className={inputCls} value={form.freeDeliveryFrom} onChange={e => setForm(f => ({ ...f, freeDeliveryFrom: e.target.value }))} /></div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <span className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </span>
            Notifications
          </h2>
          <div className="space-y-3">
            {[
              { key: "newOrderEmail" as const, label: "Email lors d'une nouvelle commande", desc: "Recevoir un e-mail à chaque nouvelle commande" },
              { key: "lowStockAlert" as const, label: "Alerte stock faible", desc: "Être notifié quand un produit est en rupture imminente" },
            ].map(opt => (
              <label key={opt.key} className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input type="checkbox" className="sr-only" checked={form[opt.key]} onChange={e => setForm(f => ({ ...f, [opt.key]: e.target.checked }))} />
                  <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${form[opt.key] ? "bg-orange-500 border-orange-500" : "border-gray-300"}`}>
                    {form[opt.key] && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
            {form.lowStockAlert && (
              <div className="ml-8">
                <label className={labelCls}>Seuil de stock (unités)</label>
                <input type="number" min={1} className={inputCls + " max-w-xs"} value={form.lowStockThreshold} onChange={e => setForm(f => ({ ...f, lowStockThreshold: e.target.value }))} />
              </div>
            )}
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-black text-red-600 flex items-center gap-2">
            <span className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </span>
            Zone dangereuse
          </h2>
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="relative mt-0.5">
              <input type="checkbox" className="sr-only" checked={form.maintenanceMode} onChange={e => setForm(f => ({ ...f, maintenanceMode: e.target.checked }))} />
              <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${form.maintenanceMode ? "bg-red-500 border-red-500" : "border-gray-300"}`}>
                {form.maintenanceMode && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Mode maintenance</p>
              <p className="text-xs text-gray-400 mt-0.5">Affiche une page de maintenance aux visiteurs du site</p>
            </div>
          </label>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-sm">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
