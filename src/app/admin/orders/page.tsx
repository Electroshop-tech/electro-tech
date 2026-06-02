"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/lib/types";

const STATUS_MAP: Record<Order["status"], { label: string; color: string; dot: string }> = {
  pending:   { label: "En attente",  color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-400" },
  confirmed: { label: "Confirmée",   color: "bg-blue-100 text-blue-700 border-blue-200",       dot: "bg-blue-400" },
  shipped:   { label: "Expédiée",    color: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-400" },
  delivered: { label: "Livrée",      color: "bg-green-100 text-green-700 border-green-200",    dot: "bg-green-400" },
  cancelled: { label: "Annulée",     color: "bg-red-100 text-red-700 border-red-200",          dot: "bg-red-400" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Order["status"] | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/orders", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setOrders(d.orders ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: Order["status"]) {
    setUpdating(id);
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, status, trackingNumber: trackingInputs[id] || undefined }),
    });
    const data = await res.json();
    if (res.ok) setOrders(prev => prev.map(o => o.id === id ? data.order : o));
    setUpdating(null);
  }

  async function saveTracking(id: string) {
    setUpdating(id);
    const order = orders.find(o => o.id === id);
    if (!order) return;
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, status: order.status, trackingNumber: trackingInputs[id] || "" }),
    });
    const data = await res.json();
    if (res.ok) setOrders(prev => prev.map(o => o.id === id ? data.order : o));
    setUpdating(null);
  }

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  function exportCSV() {
    const rows = [["ID", "Client", "Email", "Téléphone", "Total (€)", "Statut", "Paiement", "Adresse", "Date", "Articles"]];
    for (const o of filtered) {
      rows.push([
        o.id,
        o.customerName,
        o.customerEmail,
        o.customerPhone ?? "",
        o.total.toFixed(2),
        STATUS_MAP[o.status].label,
        o.paymentMethod === "cash_on_delivery" ? "À la livraison" : o.paymentMethod,
        `${o.address.street}, ${o.address.postalCode} ${o.address.city}, ${o.address.country}`,
        new Date(o.createdAt).toLocaleDateString("fr-FR"),
        o.items.map(it => `${it.productName} x${it.quantity}`).join(" | "),
      ]);
    }
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Commandes</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} commande{orders.length !== 1 ? "s" : ""} au total</p>
        </div>
        {orders.length > 0 && (
          <button onClick={exportCSV} className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Exporter CSV
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "confirmed", "shipped", "delivered", "cancelled"] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              filter === s
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {s === "all" ? "Toutes" : STATUS_MAP[s].label}
            <span className="ml-1.5 opacity-70">
              ({s === "all" ? orders.length : orders.filter(o => o.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-500 font-semibold">Aucune commande trouvée</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Commande</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Client</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Changer statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(order => {
                const s = STATUS_MAP[order.status];
                const isExp = expanded === order.id;
                return (
                  <>
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setExpanded(isExp ? null : order.id)}>
                      <td className="px-5 py-4 font-bold text-gray-800">
                        <span className="text-orange-500 mr-1">{isExp ? "▾" : "▸"}</span>
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">{order.customerName}</p>
                        <p className="text-xs text-gray-400">{order.customerEmail}</p>
                        {order.customerPhone && <p className="text-xs text-gray-400">{order.customerPhone}</p>}
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-900">{order.total.toFixed(2)}€</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${s.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                        <select
                          value={order.status}
                          disabled={updating === order.id}
                          onChange={e => updateStatus(order.id, e.target.value as Order["status"])}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white disabled:opacity-50"
                        >
                          {(Object.keys(STATUS_MAP) as Order["status"][]).map(st => (
                            <option key={st} value={st}>{STATUS_MAP[st].label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    {isExp && (
                      <tr key={order.id + "-detail"}>
                        <td colSpan={6} className="bg-gray-50 px-8 py-4 border-b border-gray-100">
                          <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Articles commandés</p>
                              <div className="space-y-2">
                                {order.items.map((item, i) => (
                                  <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-700">{item.productName} <span className="text-gray-400">×{item.quantity}</span></span>
                                    <span className="font-bold text-gray-900">{(item.price * item.quantity).toFixed(2)}€</span>
                                  </div>
                                ))}
                                <div className="flex items-center justify-between text-sm font-black pt-2 border-t border-gray-200">
                                  <span>Total</span>
                                  <span className="text-orange-600">{order.total.toFixed(2)}€</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Livraison</p>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {order.address.street}<br />
                                {order.address.postalCode} {order.address.city}<br />
                                {order.address.country}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                <strong>Paiement :</strong> {order.paymentMethod === "cash_on_delivery" ? "À la livraison" : order.paymentMethod}
                              </p>
                              {order.notes && <p className="text-xs text-gray-500 mt-1"><strong>Notes :</strong> {order.notes}</p>}
                              {order.promoCode && <p className="text-xs text-gray-500 mt-1"><strong>Code promo :</strong> {order.promoCode} (-{order.promoDiscount?.toFixed(2)}€)</p>}
                              <div className="mt-3">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">N° de suivi</p>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={trackingInputs[order.id] ?? order.trackingNumber ?? ""}
                                    onChange={e => setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                                    placeholder="Numéro de suivi..."
                                    className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                                  />
                                  <button
                                    onClick={() => saveTracking(order.id)}
                                    disabled={updating === order.id}
                                    className="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                  >
                                    Sauver
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
