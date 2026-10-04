"use client";
import { useEffect, useState } from "react";

export default function PhoneAlertSettings() {
  const [form, setForm] = useState({ enabled: false, phone: "", channel: "sms" });
  const [configured, setConfigured] = useState({ sms: false, whatsapp: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    let active = true;
    fetch("/api/admin/notifications/settings", { cache: "no-store" }).then(async r => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Paramètres indisponibles.");
      if (active) { setForm({ enabled: data.enabled, phone: data.phone, channel: data.channel }); setConfigured(data.configured); }
    }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function save() {
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await fetch("/api/admin/notifications/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Enregistrement impossible.");
      setSaved(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Enregistrement impossible."); }
    finally { setSaving(false); }
  }
  const ready = form.channel === "sms" ? configured.sms : configured.whatsapp;
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
    <div className="flex items-start justify-between gap-4">
      <div><p className="text-[10px] uppercase tracking-[.16em] text-orange-600 font-bold mb-2">Restez informé</p><h2 className="font-bold text-lg text-slate-900">Alertes sur votre téléphone</h2><p className="text-sm text-slate-500 mt-1">Nouvelle commande et paiement confirmé, même lorsque le tableau de bord est fermé.</p></div>
      <span className="bg-orange-50 text-orange-600 rounded-xl p-3" aria-hidden="true">↗</span>
    </div>
    {loading ? <p className="text-sm text-slate-500">Chargement…</p> : <>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="text-xs font-semibold text-slate-600 space-y-2 block">Canal<select value={form.channel} onChange={e => { setSaved(false); setForm(f => ({ ...f, channel: e.target.value })); }} className="block w-full rounded-xl border border-slate-200 p-3 bg-slate-50 text-sm"><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option></select></label>
        <label className="text-xs font-semibold text-slate-600 space-y-2 block">Numéro de l’administrateur<input type="tel" autoComplete="tel" placeholder="+33612345678" value={form.phone} onChange={e => { setSaved(false); setForm(f => ({ ...f, phone: e.target.value })); }} className="block w-full rounded-xl border border-slate-200 p-3 bg-slate-50 text-sm" /></label>
      </div>
      {!ready && <p className="text-xs leading-relaxed bg-amber-50 text-amber-800 rounded-xl p-3">Ce canal nécessite une configuration Twilio côté serveur. Les alertes du tableau de bord restent disponibles.</p>}
      <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-700"><input type="checkbox" checked={form.enabled} onChange={e => { setSaved(false); setForm(f => ({ ...f, enabled: e.target.checked })); }} className="w-5 h-5 accent-orange-500" /><span>Activer les messages pour les prochaines commandes</span></label>
      <p className="text-xs text-slate-500">Réglage commun à la boutique. En activant cette option, vous acceptez de recevoir ces alertes sur ce numéro. Les frais de messagerie dépendent de votre compte Twilio.</p>
      <div className="flex flex-wrap items-center gap-3"><button type="button" disabled={saving} onClick={save} className="rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-5 py-3 text-sm font-semibold">{saving ? "Enregistrement…" : "Enregistrer les alertes"}</button>{saved && <span role="status" className="text-sm text-emerald-700">Préférences enregistrées.</span>}</div>
    </>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </section>;
}
