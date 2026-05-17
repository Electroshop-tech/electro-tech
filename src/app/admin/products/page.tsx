"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "admin1234";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStock, setFilterStock] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/products", { headers: { "x-admin-key": ADMIN_KEY } })
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    setDeleting(id);
    await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { "x-admin-key": ADMIN_KEY },
    });
    setDeleting(null);
    load();
  };

  const toggleStock = async (p: Product) => {
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PUT",
      headers: { "x-admin-key": ADMIN_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, inStock: !p.inStock }),
    });
    load();
  };

  const categories = [...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || p.category === filterCat;
    const matchStock =
      filterStock === ""
        ? true
        : filterStock === "true"
        ? p.inStock
        : !p.inStock;
    return matchSearch && matchCat && matchStock;
  });

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-slate-900 font-black text-lg">Produits</h2>
          <p className="text-slate-500 text-sm">{products.length} produit{products.length !== 1 ? "s" : ""} au total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau produit
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Rechercher par nom ou SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
        />
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white"
        >
          <option value="">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={filterStock}
          onChange={(e) => setFilterStock(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white"
        >
          <option value="">Tous les stocks</option>
          <option value="true">En stock</option>
          <option value="false">Hors stock</option>
        </select>
        {(search || filterCat || filterStock) && (
          <button
            onClick={() => { setSearch(""); setFilterCat(""); setFilterStock(""); }}
            className="text-slate-500 hover:text-slate-700 text-sm px-2"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">Aucun produit trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Produit</th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Catégorie</th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Prix</th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Stock</th>
                  <th className="px-4 py-3 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                          {p.image && (
                            <Image src={p.image} alt={p.name} fill className="object-cover" sizes="48px" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">{p.name}</div>
                          <div className="text-slate-400 text-xs mt-0.5">{p.sku ?? p.slug}</div>
                          {p.badge && (
                            <span className="inline-block bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-0.5">
                              {p.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded-lg">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-black text-slate-900">{p.currentPrice}€</div>
                      {p.originalPrice !== p.currentPrice && (
                        <div className="text-slate-400 text-xs line-through">{p.originalPrice}€</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleStock(p)}
                        className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors ${
                          p.inStock
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.inStock ? "bg-emerald-500" : "bg-red-500"}`} />
                        {p.inStock ? "En stock" : "Hors stock"}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/produits/${p.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg hover:bg-gray-100 text-slate-400 hover:text-slate-600 transition-colors"
                          title="Voir sur le site"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={deleting === p.id}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Supprimer"
                        >
                          {deleting === p.id ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
