"use client";

import { useEffect, useState, useCallback } from "react";
import type { HeroSlide } from "@/lib/types";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "admin1234";

const EMPTY: Omit<HeroSlide, "id"> = {
  title: "", subtitle: "", badge: "", discount: "", price: "",
  href: "", bgColor: "from-slate-900 to-slate-700", accentColor: "text-orange-400",
};

export default function HeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/hero", { headers: { "x-admin-key": ADMIN_KEY } })
      .then((r) => r.json()).then(setSlides).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.title || !form.href) return;
    setSaving(true);
    if (editing) {
      await fetch("/api/admin/hero", {
        method: "PUT",
        headers: { "x-admin-key": ADMIN_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editing.id }),
      });
      setEditing(null);
    } else {
      await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "x-admin-key": ADMIN_KEY, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setForm(EMPTY);
    setSaving(false);
    load();
  };

  const handleEdit = (s: HeroSlide) => {
    setEditing(s);
    setForm({ title: s.title, subtitle: s.subtitle, badge: s.badge, discount: s.discount, price: s.price, href: s.href, bgColor: s.bgColor, accentColor: s.accentColor });
  };
  const handleCancel = () => { setEditing(null); setForm(EMPTY); };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce slide ?")) return;
    setDeleting(id);
    await fetch("/api/admin/hero", {
      method: "DELETE",
      headers: { "x-admin-key": ADMIN_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
    load();
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 bg-white";
  const labelCls = "block text-xs font-bold text-slate-500 mb-1.5";

  const BG_OPTIONS = [
    "from-slate-900 to-slate-700", "from-indigo-950 to-slate-900",
    "from-orange-950 to-orange-900", "from-blue-950 to-slate-900",
    "from-emerald-950 to-slate-900",
  ];
  const ACCENT_OPTIONS = [
    "text-orange-400", "text-indigo-400", "text-blue-400",
    "text-emerald-400", "text-pink-400",
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <h2 className="text-slate-900 font-black text-lg">Bannières Hero</h2>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <h3 className="text-slate-700 font-black text-sm">{editing ? "Modifier le slide" : "Nouveau slide"}</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Titre du produit *</label>
            <input className={inputCls} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Android TV Box X96Q" />
          </div>
          <div>
            <label className={labelCls}>Lien href *</label>
            <input className={inputCls} value={form.href} onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))} placeholder="/produits/android-tv-box-x96q" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Sous-titre</label>
          <input className={inputCls} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Processeur Quad-Core · Android 10 · 4K Ultra HD" />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Badge</label>
            <input className={inputCls} value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} placeholder="Bestseller" />
          </div>
          <div>
            <label className={labelCls}>Réduction</label>
            <input className={inputCls} value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))} placeholder="-20%" />
          </div>
          <div>
            <label className={labelCls}>Prix</label>
            <input className={inputCls} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="55€" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Dégradé de fond</label>
            <select className={inputCls} value={form.bgColor} onChange={(e) => setForm((f) => ({ ...f, bgColor: e.target.value }))}>
              {BG_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Couleur accent</label>
            <select className={inputCls} value={form.accentColor} onChange={(e) => setForm((f) => ({ ...f, accentColor: e.target.value }))}>
              {ACCENT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
        {/* Preview */}
        <div className={`bg-gradient-to-r ${form.bgColor} rounded-xl p-5 text-white`}>
          <span className={`text-xs font-bold ${form.accentColor}`}>{form.badge || "Badge"}</span>
          <p className="font-black text-base mt-1">{form.title || "Titre du produit"}</p>
          <p className="text-slate-400 text-xs mt-1">{form.subtitle || "Sous-titre"}</p>
          <div className="flex items-center gap-3 mt-2">
            {form.discount && <span className="bg-orange-500 text-white text-xs font-black px-2 py-1 rounded-lg">{form.discount}</span>}
            {form.price && <span className={`font-black text-lg ${form.accentColor}`}>{form.price}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving || !form.title || !form.href}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-colors">
            {saving ? "Enregistrement..." : editing ? "Mettre à jour" : "Ajouter"}
          </button>
          {editing && <button onClick={handleCancel} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-slate-600 hover:bg-gray-50">Annuler</button>}
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : slides.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">Aucun slide</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {slides.map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50">
                <div className={`bg-gradient-to-r ${s.bgColor} rounded-xl w-14 h-10 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-sm truncate">{s.title}</div>
                  <div className="text-slate-400 text-xs">{s.badge} · {s.discount} · {s.price}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(s)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50">
                    {deleting === s.id ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
