"use client";

import { useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

const sortLabels: Record<string, string> = {
  default:     "Par défaut",
  "price-asc": "Prix croissant",
  "price-desc":"Prix décroissant",
  discount:    "Meilleures remises",
};

export default function CategoryProductGrid({
  products,
  categoryName,
  categoryGradient,
  categoryImg,
}: {
  products: Product[];
  categoryName: string;
  categoryGradient: string;
  categoryImg?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [sort, setSort] = useState("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [pendingMin, setPendingMin] = useState("");
  const [pendingMax, setPendingMax] = useState("");

  const applyPriceFilter = () => {
    setMinPrice(pendingMin);
    setMaxPrice(pendingMax);
  };

  const resetFilters = () => {
    setSort("default");
    setMinPrice(""); setMaxPrice("");
    setPendingMin(""); setPendingMax("");
    setInStockOnly(false);
  };

  const filtered = useMemo(() => {
    let list = [...products];
    if (inStockOnly) list = list.filter((p) => p.inStock !== false);
    if (minPrice) list = list.filter((p) => p.currentPrice >= parseFloat(minPrice));
    if (maxPrice) list = list.filter((p) => p.currentPrice <= parseFloat(maxPrice));

    if (sort === "price-asc") list.sort((a, b) => a.currentPrice - b.currentPrice);
    else if (sort === "price-desc") list.sort((a, b) => b.currentPrice - a.currentPrice);
    else if (sort === "discount") {
      list.sort((a, b) => {
        const da = (a.originalPrice - a.currentPrice) / a.originalPrice;
        const db = (b.originalPrice - b.currentPrice) / b.originalPrice;
        return db - da;
      });
    }
    return list;
  }, [products, sort, minPrice, maxPrice, inStockOnly]);

  const hasActiveFilters = inStockOnly || minPrice || maxPrice;

  return (
    <div className="flex gap-6">
      {/* ── Sidebar ── */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24 space-y-3">

          {/* Categories card — navigate to category pages */}
          <div className="bg-white rounded-lg border border-slate-200/80 overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="px-4 pt-4 pb-2 border-b border-gray-50">
              <h3 className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Sous-filtres</h3>
            </div>
            <div className="p-4 space-y-5">

              {/* Price range */}
              <div>
                <p className="text-xs font-bold text-gray-500 mb-2.5">Fourchette de prix</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={pendingMin}
                      onChange={(e) => setPendingMin(e.target.value)}
                      placeholder="0"
                      min={0}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">MAD</span>
                  </div>
                  <div className="w-4 h-px bg-gray-300 flex-shrink-0" />
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={pendingMax}
                      onChange={(e) => setPendingMax(e.target.value)}
                      placeholder="Max"
                      min={0}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">MAD</span>
                  </div>
                </div>
                <button
                  onClick={applyPriceFilter}
                  className="mt-3 w-full text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 py-2.5 rounded-xl transition-all shadow-md shadow-orange-100"
                >
                  Appliquer le filtre
                </button>
              </div>

              {/* Stock toggle */}
              <div className="pt-4 border-t border-gray-50">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">En stock</p>
                    <p className="text-[11px] text-gray-400">Uniquement les disponibles</p>
                  </div>
                  <div className="relative flex-shrink-0" onClick={() => setInStockOnly((v) => !v)}>
                    <div className={`w-9 h-5 rounded-full transition-colors ${inStockOnly ? "bg-orange-500" : "bg-gray-200"}`} />
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${inStockOnly ? "translate-x-4" : ""}`} />
                  </div>
                </label>
              </div>

              {/* Reset */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="w-full text-xs font-bold text-orange-500 hover:underline pt-2"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>

        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <p className="text-sm text-gray-500">
            <span className="font-bold text-gray-900">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "résultat" : "résultats"} dans{" "}
            <span className="font-semibold text-orange-600">{categoryName}</span>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="ml-2 text-xs text-orange-500 hover:underline">
                (effacer filtres)
              </button>
            )}
          </p>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">Trier :</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="flex-1 sm:flex-none border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 outline-none bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 cursor-pointer"
            >
              {Object.entries(sortLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
            {filtered.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className={`w-20 h-20 bg-gradient-to-br ${categoryGradient} rounded-3xl flex items-center justify-center mb-5 opacity-60`}>
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-black text-gray-800 mb-2">
              {hasActiveFilters ? "Aucun produit pour ces filtres" : "Bientôt disponible"}
            </h2>
            <p className="text-sm text-gray-500 max-w-xs mb-6">
              {hasActiveFilters
                ? "Essayez d'élargir votre fourchette de prix ou désactiver les filtres."
                : `Nos produits ${categoryName} arrivent très prochainement.`}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={resetFilters}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-colors"
              >
                Effacer les filtres
              </button>
            ) : (
              <button
                onClick={() => router.push("/produits")}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-colors"
              >
                Voir tous les produits
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
