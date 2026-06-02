"use client";

import { useEffect, useState, Fragment } from "react";
import type { Order } from "@/lib/types";
import { customerWhatsAppLink } from "@/lib/whatsapp";

const STATUS_MAP: Record<Order["status"], { label: string; color: string; dot: string }> = {
  pending:   { label: "En attente",  color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-400" },
  confirmed: { label: "Confirmée",   color: "bg-blue-100 text-blue-700 border-blue-200",       dot: "bg-blue-400" },
  preparing: { label: "En préparation", color: "bg-indigo-100 text-indigo-700 border-indigo-200", dot: "bg-indigo-400" },
  shipped:   { label: "Expédiée",    color: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-400" },
  delivered: { label: "Livrée",      color: "bg-green-100 text-green-700 border-green-200",    dot: "bg-green-400" },
  cancelled: { label: "Annulée",     color: "bg-red-100 text-red-700 border-red-200",          dot: "bg-red-400" },
};

const PAYMENT_MAP: Record<Order["paymentStatus"], { label: string; color: string }> = {
  unpaid:   { label: "Non payée",   color: "bg-gray-100 text-gray-600 border-gray-200" },
  paid:     { label: "Payée",       color: "bg-green-100 text-green-700 border-green-200" },
  failed:   { label: "Échouée",     color: "bg-red-100 text-red-700 border-red-200" },
  refunded: { label: "Remboursée",  color: "bg-amber-100 text-amber-700 border-amber-200" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Order["status"] | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetch("/api/admin/orders", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setOrders(d.orders ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function patchOrder(id: string, body: Record<string, unknown>) {
    setUpdating(id);
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, ...body }),
    });
    const data = await res.json();
    if (res.ok) setOrders(prev => prev.map(o => o.id === id ? data.order : o));
    setUpdating(null);
  }

  async function updateStatus(id: string, status: Order["status"]) {
    await patchOrder(id, { status, trackingNumber: trackingInputs[id] || undefined });
  }

  async function saveTracking(id: string) {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    await patchOrder(id, { status: order.status, trackingNumber: trackingInputs[id] || "" });
  }

  async function savePayment(id: string, paymentStatus: Order["paymentStatus"]) {
    await patchOrder(id, { paymentStatus });
  }

  async function saveNotes(id: string) {
    await patchOrder(id, { notes: noteInputs[id] ?? "" });
  }

  const filtered = orders.filter(o => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hit =
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        (o.customerPhone ?? "").toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q);
      if (!hit) return false;
    }
    if (dateFrom && new Date(o.createdAt).getTime() < new Date(dateFrom + "T00:00:00").getTime()) return false;
    if (dateTo && new Date(o.createdAt).getTime() > new Date(dateTo + "T23:59:59").getTime()) return false;
    return true;
  });

  function openInvoice(id: string) {
    window.open(`/api/admin/orders/${id}/invoice`, "_blank", "noopener");
  }

  function exportCSV() {
    const rows = [["ID", "Client", "Email", "Téléphone", "Total (€)", "Statut", "Paiement", "État paiement", "Adresse", "Date", "Articles"]];
    for (const o of filtered) {
      rows.push([
        o.id,
        o.customerName,
        o.customerEmail,
        o.customerPhone ?? "",
        o.total.toFixed(2),
        STATUS_MAP[o.status].label,
        o.paymentMethod === "cash_on_delivery" ? "À la livraison" : o.paymentMethod,
        PAYMENT_MAP[o.paymentStatus].label,
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

  function renderDetail(order: Order) {
    return (
      <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
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
          {order.promoCode && <p className="text-xs text-gray-500 mt-1"><strong>Code promo :</strong> {order.promoCode} (-{order.promoDiscount?.toFixed(2)}€)</p>}

          {/* Payment status */}
          <div className="mt-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Statut du paiement</p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${PAYMENT_MAP[order.paymentStatus].color}`}>
                {PAYMENT_MAP[order.paymentStatus].label}
              </span>
              <select
                value={order.paymentStatus}
                disabled={updating === order.id}
                onChange={e => savePayment(order.id, e.target.value as Order["paymentStatus"])}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white disabled:opacity-50"
              >
                {(Object.keys(PAYMENT_MAP) as Order["paymentStatus"][]).map(ps => (
                  <option key={ps} value={ps}>{PAYMENT_MAP[ps].label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tracking number */}
          <div className="mt-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">N° de suivi</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={trackingInputs[order.id] ?? order.trackingNumber ?? ""}
                onChange={e => setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                placeholder="Numéro de suivi..."
                className="flex-1 min-w-0 text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              />
              <button
                onClick={() => saveTracking(order.id)}
                disabled={updating === order.id}
                className="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 shrink-0"
              >
                Sauver
              </button>
            </div>
          </div>

          {/* Internal notes */}
          <div className="mt-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Notes internes</p>
            <textarea
              value={noteInputs[order.id] ?? order.notes ?? ""}
              onChange={e => setNoteInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
              placeholder="Ajouter une note (visible uniquement par l'admin)..."
              rows={2}
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white resize-y"
            />
            <button
              onClick={() => saveNotes(order.id)}
              disabled={updating === order.id}
              className="mt-1.5 text-xs bg-slate-700 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              Enregistrer la note
            </button>
          </div>

          {/* Quick actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => openInvoice(order.id)}
              className="inline-flex items-center gap-1.5 text-xs bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Facture (PDF)
            </button>
            {(() => {
              const wa = customerWhatsAppLink(order);
              return wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.738-.979zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                  WhatsApp client
                </a>
              ) : null;
            })()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">Commandes</h1>
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

      {/* Search + date range */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-500 mb-1">Recherche (nom, email, téléphone, n°)</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une commande..."
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Du</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Au</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
        </div>
        {(search || dateFrom || dateTo) && (
          <button
            onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); }}
            className="text-xs font-bold text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-2 bg-white"
          >
            Réinitialiser
          </button>
        )}
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
        <>
          {/* Desktop table */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
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
                    <Fragment key={order.id}>
                      <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setExpanded(isExp ? null : order.id)}>
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
                        <tr>
                          <td colSpan={6} className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                            {renderDetail(order)}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map(order => {
              const s = STATUS_MAP[order.status];
              const isExp = expanded === order.id;
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpanded(isExp ? null : order.id)}
                    className="w-full text-left p-4 flex items-start gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-black text-gray-900 text-sm">#{order.id.slice(-8).toUpperCase()}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-800 text-sm truncate">{order.customerName}</p>
                      <p className="text-xs text-gray-400 truncate">{order.customerEmail}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-black text-orange-600 text-sm">{order.total.toFixed(2)}€</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                    <svg className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${isExp ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="px-4 pb-4">
                    <select
                      value={order.status}
                      disabled={updating === order.id}
                      onChange={e => updateStatus(order.id, e.target.value as Order["status"])}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white disabled:opacity-50 font-semibold text-gray-700"
                    >
                      {(Object.keys(STATUS_MAP) as Order["status"][]).map(st => (
                        <option key={st} value={st}>{STATUS_MAP[st].label}</option>
                      ))}
                    </select>
                  </div>
                  {isExp && (
                    <div className="bg-gray-50 px-4 py-4 border-t border-gray-100">
                      {renderDetail(order)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
