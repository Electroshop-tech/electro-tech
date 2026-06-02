"use client";

import { useEffect, useState, useCallback } from "react";

interface ReturnItem {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  reason: string;
  comment: string | null;
  status: string;
  refundAmount: number;
  adminNote: string | null;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; dot: string }> = {
  pending: { label: "En attente", color: "text-amber-600 bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  approved: { label: "Approuvé", color: "text-blue-600 bg-blue-50 border-blue-200", dot: "bg-blue-500" },
  rejected: { label: "Refusé", color: "text-red-600 bg-red-50 border-red-200", dot: "bg-red-500" },
  refunded: { label: "Remboursé", color: "text-emerald-600 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
};

type FilterKey = "all" | "pending" | "approved" | "rejected" | "refunded";

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [refundInputs, setRefundInputs] = useState<Record<string, string>>({});
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  const fetchReturns = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/returns");
      const data = await res.json();
      setReturns(Array.isArray(data) ? data : []);
    } catch {
      console.error("Failed to fetch returns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  const patch = useCallback(async (r: ReturnItem, body: Record<string, unknown>) => {
    setBusy(r.id);
    try {
      const res = await fetch("/api/admin/returns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id, ...body }),
      });
      const updated = await res.json();
      setReturns((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
    } catch {
      alert("Erreur lors de la mise à jour");
    } finally {
      setBusy(null);
    }
  }, []);

  const remove = useCallback(async (r: ReturnItem) => {
    if (!confirm("Supprimer cette demande de retour ?")) return;
    setBusy(r.id);
    try {
      await fetch("/api/admin/returns", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id }),
      });
      setReturns((prev) => prev.filter((x) => x.id !== r.id));
    } catch {
      alert("Erreur lors de la suppression");
    } finally {
      setBusy(null);
    }
  }, []);

  const filtered = returns.filter((r) => filter === "all" || r.status === filter);
  const counts = {
    all: returns.length,
    pending: returns.filter((r) => r.status === "pending").length,
    approved: returns.filter((r) => r.status === "approved").length,
    rejected: returns.filter((r) => r.status === "rejected").length,
    refunded: returns.filter((r) => r.status === "refunded").length,
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">Retours &amp; remboursements</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérez les demandes de retour des clients.</p>
        </div>
        {counts.pending > 0 && (
          <span className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-600 font-bold text-sm px-3 py-1.5 rounded-xl self-start">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {counts.pending} en attente
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {([
          { key: "all", label: "Tous", count: counts.all },
          { key: "pending", label: "En attente", count: counts.pending },
          { key: "approved", label: "Approuvés", count: counts.approved },
          { key: "refunded", label: "Remboursés", count: counts.refunded },
          { key: "rejected", label: "Refusés", count: counts.rejected },
        ] as { key: FilterKey; label: string; count: number }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`text-sm font-bold px-3.5 py-2 rounded-xl border transition-colors ${
              filter === t.key ? "bg-slate-950 text-white border-slate-950" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {t.label} <span className={filter === t.key ? "text-orange-400" : "text-gray-400"}>({t.count})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">↩️</div>
          <p className="text-gray-500 font-semibold">Aucune demande de retour</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const s = STATUS_MAP[r.status] ?? STATUS_MAP.pending;
            return (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-gray-900 text-sm">Commande #{r.orderId.slice(-8).toUpperCase()}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mt-1">{r.customerName}</p>
                    <p className="text-xs text-gray-400">{r.customerEmail}{r.customerPhone ? ` · ${r.customerPhone}` : ""}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>

                <div className="mt-3 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Motif</p>
                  <p className="text-sm text-gray-700">{r.reason}</p>
                  {r.comment && <p className="text-sm text-gray-500 mt-1.5 italic">“{r.comment}”</p>}
                </div>

                {/* Refund + note */}
                <div className="mt-3 grid sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Montant remboursé (€)</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={refundInputs[r.id] ?? (r.refundAmount || "")}
                        onChange={(e) => setRefundInputs((p) => ({ ...p, [r.id]: e.target.value }))}
                        placeholder="0.00"
                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                      <button
                        onClick={() => patch(r, { refundAmount: Number(refundInputs[r.id] ?? r.refundAmount) })}
                        disabled={busy === r.id}
                        className="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Sauver
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Note interne</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={noteInputs[r.id] ?? r.adminNote ?? ""}
                        onChange={(e) => setNoteInputs((p) => ({ ...p, [r.id]: e.target.value }))}
                        placeholder="Note..."
                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                      <button
                        onClick={() => patch(r, { adminNote: noteInputs[r.id] ?? r.adminNote ?? "" })}
                        disabled={busy === r.id}
                        className="text-xs bg-slate-700 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Sauver
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status actions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.status !== "approved" && (
                    <button onClick={() => patch(r, { status: "approved" })} disabled={busy === r.id} className="text-xs bg-blue-500 hover:bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Approuver</button>
                  )}
                  {r.status !== "refunded" && (
                    <button onClick={() => patch(r, { status: "refunded" })} disabled={busy === r.id} className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Marquer remboursé</button>
                  )}
                  {r.status !== "rejected" && (
                    <button onClick={() => patch(r, { status: "rejected" })} disabled={busy === r.id} className="text-xs bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Refuser</button>
                  )}
                  <button onClick={() => remove(r)} disabled={busy === r.id} className="text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ml-auto">Supprimer</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
