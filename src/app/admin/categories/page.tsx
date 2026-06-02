"use client";

import { useEffect, useState, useCallback } from "react";
import type { Category } from "@/lib/types";


const EMPTY = { name: "", slug: "", icon: "📦" };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/categories", { credentials: "include" })
      .then((r) => r.json()).then(setCategories).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.name || !form.slug) return;
    setSaving(true);
    if (editing) {
      await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ ...form, id: editing.id }),
      });
      setEditing(null);
    } else {
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify(form),
      });
    }
    setForm(EMPTY);
    setSaving(false);
    load();
  };

  const handleEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, slug: c.slug, icon: c.icon }); };
  const handleCancel = () => { setEditing(null); setForm(EMPTY); };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    setDeleting(id);
    await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
    load();
  };

  const slugify = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 bg-white";

  return (
    <div className="space-y-5 max-w-4xl">
      <h2 className="text-slate-900 font-black text-lg">Catégories</h2>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <h3 className="text-slate-700 font-black text-sm">{editing ? "Modifier la catégorie" : "Nouvelle catégorie"}</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Nom</label>
            <input className={inputCls} value={form.name} onChange={(e) => {
              setForm((f) => ({ ...f, name: e.target.value, slug: editing ? f.slug : slugify(e.target.value) }));
            }} placeholder="Passerelle Multimédia" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Slug</label>
            <input className={inputCls} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} placeholder="passerelle-multimedia" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Icône (emoji)</label>
            <input className={inputCls} value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="📦" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving || !form.name || !form.slug}
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
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">Aucune catégorie</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50">
                <span className="text-2xl">{c.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                  <div className="text-slate-400 text-xs">/categorie/{c.slug}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(c)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50">
                    {deleting === c.id ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
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
