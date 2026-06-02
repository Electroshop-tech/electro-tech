"use client";

import { useEffect, useState, useCallback } from "react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  lastLogin: string | null;
  createdAt: string;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  owner: { label: "Propriétaire", color: "text-purple-600 bg-purple-50 border-purple-200" },
  manager: { label: "Manager", color: "text-blue-600 bg-blue-50 border-blue-200" },
  staff: { label: "Employé", color: "text-slate-600 bg-slate-50 border-slate-200" },
};

const EMPTY = { email: "", name: "", role: "staff", password: "" };

export default function StaffPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.status === 403) { setForbidden(true); setLoading(false); return; }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      console.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setError("");
    if (!form.email || !form.name || (!editing && form.password.length < 6)) {
      setError("Remplissez tous les champs (mot de passe ≥ 6 caractères).");
      return;
    }
    setSaving(true);
    try {
      const res = editing
        ? await fetch("/api/admin/users", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editing.id, name: form.name, role: form.role, ...(form.password ? { password: form.password } : {}) }),
          })
        : await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur"); setSaving(false); return; }
      setForm(EMPTY);
      setEditing(null);
      await load();
    } catch {
      setError("Erreur serveur");
    } finally {
      setSaving(false);
    }
  };

  const patch = async (u: AdminUser, body: Record<string, unknown>) => {
    setBusy(u.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id, ...body }),
      });
      const data = await res.json();
      if (res.ok) setUsers((prev) => prev.map((x) => (x.id === u.id ? data : x)));
      else alert(data.error ?? "Erreur");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (u: AdminUser) => {
    if (!confirm(`Supprimer le compte de ${u.name} ?`)) return;
    setBusy(u.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id }),
      });
      const data = await res.json();
      if (res.ok) setUsers((prev) => prev.filter((x) => x.id !== u.id));
      else alert(data.error ?? "Erreur");
    } finally {
      setBusy(null);
    }
  };

  const startEdit = (u: AdminUser) => { setEditing(u); setForm({ email: u.email, name: u.name, role: u.role, password: "" }); setError(""); };
  const cancelEdit = () => { setEditing(null); setForm(EMPTY); setError(""); };

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 bg-white";

  if (forbidden) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center max-w-2xl">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-lg font-black text-gray-900">Accès restreint</h1>
        <p className="text-sm text-gray-500 mt-2">Seuls les propriétaires et managers peuvent gérer les comptes du personnel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900">Comptes &amp; rôles</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gérez les accès du personnel à l&rsquo;administration.</p>
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <h3 className="text-slate-700 font-black text-sm">{editing ? `Modifier ${editing.name}` : "Nouveau compte"}</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Nom complet</label>
            <input className={inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Yassine M." />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">E-mail</label>
            <input className={inputCls} type="email" value={form.email} disabled={!!editing} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="staff@electroshop-tech.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Rôle</label>
            <select className={inputCls} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              <option value="staff">Employé — accès limité</option>
              <option value="manager">Manager — gère le catalogue & commandes</option>
              <option value="owner">Propriétaire — accès total</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">{editing ? "Nouveau mot de passe (facultatif)" : "Mot de passe"}</label>
            <input className={inputCls} type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
          </div>
        </div>
        {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
        <div className="flex gap-2">
          <button onClick={save} disabled={saving} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-colors">
            {saving ? "Enregistrement..." : editing ? "Mettre à jour" : "Créer le compte"}
          </button>
          {editing && <button onClick={cancelEdit} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-slate-600 hover:bg-gray-50">Annuler</button>}
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">Aucun compte staff. Créez le premier ci-dessus.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {users.map((u) => {
              const r = ROLE_LABELS[u.role] ?? ROLE_LABELS.staff;
              return (
                <div key={u.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500 text-sm shrink-0">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${r.color}`}>{r.label}</span>
                      {!u.active && <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border text-red-600 bg-red-50 border-red-200">Désactivé</span>}
                    </div>
                    <div className="text-slate-400 text-xs truncate">{u.email}{u.lastLogin ? ` · dernière connexion ${new Date(u.lastLogin).toLocaleDateString("fr-FR")}` : " · jamais connecté"}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => patch(u, { active: !u.active })} disabled={busy === u.id} className="text-xs font-bold px-2.5 py-1.5 rounded-lg text-slate-500 hover:bg-gray-100 transition-colors disabled:opacity-50">
                      {u.active ? "Désactiver" : "Activer"}
                    </button>
                    <button onClick={() => startEdit(u)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => remove(u)} disabled={busy === u.id} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
