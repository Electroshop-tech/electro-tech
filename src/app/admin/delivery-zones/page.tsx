"use client";

import { useEffect, useState } from "react";

interface DeliveryZone {
  id: number;
  name: string;
  cities: string[];
  fee: number;
  active: boolean;
}

export default function AdminDeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", cities: "", fee: "", active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/delivery-zones", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setZones(d.zones ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function resetForm() {
    setForm({ name: "", cities: "", fee: "", active: true });
    setEditing(null);
  }

  function startEdit(zone: DeliveryZone) {
    setEditing(zone.id);
    setForm({ name: zone.name, cities: zone.cities.join(", "), fee: String(zone.fee), active: zone.active });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const cities = form.cities.split(",").map(c => c.trim()).filter(Boolean);
    const data = { name: form.name, cities, fee: Number(form.fee) || 0, active: form.active };

    if (editing) {
      const res = await fetch("/api/admin/delivery-zones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: editing, ...data }),
      });
      const d = await res.json();
      if (res.ok) setZones(prev => prev.map(z => z.id === editing ? d.zone : z));
    } else {
      const res = await fetch("/api/admin/delivery-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (res.ok) setZones(prev => [...prev, d.zone]);
    }
    resetForm();
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette zone ?")) return;
    const res = await fetch("/api/admin/delivery-zones", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id }),
    });
    if (res.ok) setZones(prev => prev.filter(z => z.id !== id));
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900">Zones de livraison</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez les frais de livraison par zone géographique</p>
      </div>

      {/* Add/Edit form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          {editing ? "Modifier la zone" : "Ajouter une zone"}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Nom de la zone</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Casablanca et région"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Frais de livraison (€)</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={form.fee}
              onChange={e => setForm(f => ({ ...f, fee: e.target.value }))}
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Villes (séparées par des virgules)</label>
          <input
            type="text"
            required
            value={form.cities}
            onChange={e => setForm(f => ({ ...f, cities: e.target.value }))}
            placeholder="Casablanca, Mohammedia, Benslimane"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
              className="w-4 h-4 accent-orange-500"
            />
            <span className="text-sm text-gray-600 font-medium">Active</span>
          </label>
          <div className="flex-1" />
          {editing && (
            <button type="button" onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700 font-medium">
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            {saving ? "..." : editing ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </form>

      {/* Zones list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : zones.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">🚚</div>
          <p className="text-gray-500 font-semibold">Aucune zone de livraison configurée</p>
          <p className="text-gray-400 text-sm mt-1">Ajoutez des zones ci-dessus pour définir les frais de livraison</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Zone</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Villes</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Frais</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {zones.map(zone => (
                <tr key={zone.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-gray-800">{zone.name}</td>
                  <td className="px-5 py-4 text-gray-600">
                    <div className="flex flex-wrap gap-1">
                      {zone.cities.slice(0, 5).map(c => (
                        <span key={c} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                      {zone.cities.length > 5 && (
                        <span className="text-xs text-gray-400">+{zone.cities.length - 5}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-orange-600">{zone.fee.toFixed(2)}€</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${zone.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${zone.active ? "bg-green-400" : "bg-gray-400"}`} />
                      {zone.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right space-x-2">
                    <button onClick={() => startEdit(zone)} className="text-xs text-blue-600 hover:text-blue-800 font-bold">Modifier</button>
                    <button onClick={() => handleDelete(zone.id)} className="text-xs text-red-500 hover:text-red-700 font-bold">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
