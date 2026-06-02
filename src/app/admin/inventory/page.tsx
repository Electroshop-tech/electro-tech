"use client";

import { useEffect, useState, useCallback } from "react";

interface Product {
  id: number;
  name: string;
  image: string;
  category: string;
  brand: string;
  currentPrice: number;
  inStock?: boolean;
  stockQuantity?: number;
}

type FilterKey = "all" | "low" | "out";
const LOW_THRESHOLD = 5;

interface StockNotifRow {
  productId: number;
  productName: string;
  productSlug: string;
  inStock: boolean;
  count: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [edits, setEdits] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [notifRows, setNotifRows] = useState<StockNotifRow[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stock-notifications");
      const data = await res.json();
      setNotifRows(Array.isArray(data.rows) ? data.rows : []);
    } catch {
      console.error("Failed to fetch stock notifications");
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchNotifs();
  }, [fetchProducts, fetchNotifs]);

  const save = useCallback(async (p: Product, qty: number, inStock: boolean) => {
    setSaving(p.id);
    try {
      await fetch(`/api/admin/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQuantity: qty, inStock }),
      });
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, stockQuantity: qty, inStock } : x)));
      setEdits((prev) => { const n = { ...prev }; delete n[p.id]; return n; });
      setSavedId(p.id);
      setTimeout(() => setSavedId((s) => (s === p.id ? null : s)), 1500);
      fetchNotifs();
    } catch {
      alert("Erreur lors de l'enregistrement");
    } finally {
      setSaving(null);
    }
  }, [fetchNotifs]);

  const adjust = (p: Product, delta: number) => {
    const current = edits[p.id] ?? p.stockQuantity ?? 0;
    const next = Math.max(0, current + delta);
    setEdits((prev) => ({ ...prev, [p.id]: next }));
  };

  const stockOf = (p: Product) => p.stockQuantity ?? 0;

  const filtered = products
    .filter((p) => {
      const q = search.toLowerCase();
      if (q && !p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false;
      if (filter === "out") return stockOf(p) === 0 || p.inStock === false;
      if (filter === "low") return stockOf(p) > 0 && stockOf(p) <= LOW_THRESHOLD;
      return true;
    })
    .sort((a, b) => stockOf(a) - stockOf(b));

  const counts = {
    all: products.length,
    low: products.filter((p) => stockOf(p) > 0 && stockOf(p) <= LOW_THRESHOLD).length,
    out: products.filter((p) => stockOf(p) === 0 || p.inStock === false).length,
  };
  const totalUnits = products.reduce((s, p) => s + stockOf(p), 0);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">Gestion des stocks</h1>
          <p className="text-sm text-gray-500 mt-0.5">Suivez et ajustez les quantités de chaque produit.</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <p className="text-xs text-gray-500 font-semibold">Produits</p>
          <p className="text-2xl font-black text-gray-900 mt-0.5">{counts.all}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <p className="text-xs text-gray-500 font-semibold">Unités en stock</p>
          <p className="text-2xl font-black text-emerald-600 mt-0.5">{totalUnits}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <p className="text-xs text-gray-500 font-semibold">Stock faible</p>
          <p className="text-2xl font-black text-amber-500 mt-0.5">{counts.low}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <p className="text-xs text-gray-500 font-semibold">En rupture</p>
          <p className="text-2xl font-black text-red-500 mt-0.5">{counts.out}</p>
        </div>
      </div>

      {/* Pending back-in-stock requests */}
      {notifRows.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <h2 className="font-black text-slate-900 text-sm">Demandes de retour en stock</h2>
          </div>
          <p className="text-xs text-slate-600 mb-3">Les clients ci-dessous seront prévenus automatiquement par e-mail dès que vous remettez le produit en stock.</p>
          <div className="space-y-2">
            {notifRows.map((r) => (
              <div key={r.productId} className="flex items-center justify-between gap-3 bg-white rounded-xl px-3 py-2 border border-orange-100">
                <span className="text-sm font-semibold text-slate-800 truncate">{r.productName}</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {r.count} en attente
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {([
            { key: "all", label: "Tous", count: counts.all },
            { key: "low", label: "Stock faible", count: counts.low },
            { key: "out", label: "Rupture", count: counts.out },
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
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit..."
          className="text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white sm:w-64"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-500 font-semibold">Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((p) => {
            const qty = edits[p.id] ?? p.stockQuantity ?? 0;
            const dirty = edits[p.id] !== undefined && edits[p.id] !== (p.stockQuantity ?? 0);
            const stock = stockOf(p);
            const level = stock === 0 ? "out" : stock <= LOW_THRESHOLD ? "low" : "ok";
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400">{p.brand}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      level === "out" ? "text-red-600 bg-red-50 border-red-200"
                        : level === "low" ? "text-amber-600 bg-amber-50 border-amber-200"
                        : "text-emerald-600 bg-emerald-50 border-emerald-200"
                    }`}>
                      {level === "out" ? "Rupture" : level === "low" ? `Stock faible (${stock})` : `${stock} en stock`}
                    </span>
                  </div>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => adjust(p, -1)} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-black flex items-center justify-center">−</button>
                  <input
                    type="number"
                    min={0}
                    value={qty}
                    onChange={(e) => setEdits((prev) => ({ ...prev, [p.id]: Math.max(0, Number(e.target.value)) }))}
                    className="w-16 text-center text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <button onClick={() => adjust(p, 1)} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-black flex items-center justify-center">+</button>
                </div>

                <button
                  onClick={() => save(p, qty, qty > 0)}
                  disabled={saving === p.id || (!dirty && savedId !== p.id)}
                  className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors shrink-0 disabled:opacity-40 ${
                    savedId === p.id ? "bg-green-500 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                >
                  {saving === p.id ? "..." : savedId === p.id ? "✓ Enregistré" : "Enregistrer"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
