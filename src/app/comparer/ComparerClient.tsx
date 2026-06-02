"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cartContext";
import type { Product } from "@/lib/types";

const MAX = 3;

const SPEC_ROWS = [
  { label: "Prix", key: "price" },
  { label: "Prix original", key: "originalPrice" },
  { label: "Remise", key: "discount" },
  { label: "Marque", key: "brand" },
  { label: "Catégorie", key: "category" },
  { label: "État", key: "condition" },
  { label: "Garantie", key: "guarantee" },
  { label: "En stock", key: "inStock" },
];

export default function ComparerClient({ products }: { products: Product[] }) {
  const { addToCart } = useCart();
  const [slugs, setSlugs] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("compare-list");
    if (saved) {
      try { setSlugs(JSON.parse(saved)); } catch { /* */ }
    }
  }, []);

  const saveSlugs = (next: string[]) => {
    setSlugs(next);
    localStorage.setItem("compare-list", JSON.stringify(next));
  };

  const addProduct = (slug: string) => {
    if (slugs.includes(slug) || slugs.length >= MAX) return;
    saveSlugs([...slugs, slug]);
    setSearch("");
    setDropdownOpen(false);
  };

  const removeProduct = (slug: string) => saveSlugs(slugs.filter((s) => s !== slug));
  const clearAll = () => saveSlugs([]);

  const compared = slugs.map((s) => products.find((p) => p.slug === s)).filter(Boolean) as Product[];

  const filtered = search.trim()
    ? products
        .filter(
          (p) =>
            !slugs.includes(p.slug) &&
            (p.name.toLowerCase().includes(search.toLowerCase()) ||
              p.brand?.toLowerCase().includes(search.toLowerCase()))
        )
        .slice(0, 8)
    : [];

  const getCellValue = (product: Product, key: string): React.ReactNode => {
    switch (key) {
      case "price":
        return <span className="text-lg font-black text-orange-500">{product.currentPrice.toLocaleString()}€</span>;
      case "originalPrice":
        return product.originalPrice > product.currentPrice ? (
          <span className="text-sm text-gray-400 line-through">{product.originalPrice.toLocaleString()}€</span>
        ) : <span className="text-gray-400 text-sm">—</span>;
      case "discount": {
        const pct = Math.round((1 - product.currentPrice / product.originalPrice) * 100);
        return pct > 0 ? (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-xs font-black px-2 py-0.5 rounded-full">-{pct}%</span>
        ) : <span className="text-gray-400 text-sm">—</span>;
      }
      case "brand":
        return <span className="font-semibold text-slate-700">{product.brand ?? "—"}</span>;
      case "category":
        return <Link href={`/categorie/${product.category}`} className="text-blue-500 hover:underline text-sm">{product.category}</Link>;
      case "condition":
        return product.isRefurbished ? (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-xs font-bold px-2 py-0.5 rounded-full">Reconditionné</span>
        ) : (
          <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">Neuf</span>
        );
      case "guarantee":
        return <span className="text-sm text-slate-600">{product.guarantee ?? "1 an"}</span>;
      case "inStock":
        return product.inStock !== false ? (
          <span className="inline-flex items-center gap-1 text-green-600 text-xs font-bold">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            En stock
          </span>
        ) : (
          <span className="text-red-500 text-xs font-bold">Épuisé</span>
        );
      default:
        return "—";
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-orange-500 transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">Comparer</span>
          </nav>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Comparateur de produits</h1>
              <p className="text-sm text-gray-400 mt-0.5">Comparez jusqu&apos;à {MAX} produits côte à côte</p>
            </div>
            {compared.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-red-500 font-semibold transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Tout effacer
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Product slots */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: MAX }).map((_, i) => {
            const product = compared[i];
            return (
              <div
                key={i}
                className={`bg-white rounded-2xl border-2 ${product ? "border-slate-200" : "border-dashed border-gray-200"} p-4 relative`}
              >
                {product ? (
                  <>
                    <button
                      onClick={() => removeProduct(product.slug)}
                      className="absolute top-3 right-3 w-6 h-6 bg-gray-100 hover:bg-red-100 hover:text-red-500 rounded-full flex items-center justify-center transition-colors text-gray-400"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <Link href={`/produits/${product.slug}`}>
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={200}
                        height={128}
                        className="w-full h-32 object-contain mb-3 hover:opacity-80 transition-opacity"
                      />
                    </Link>
                    <p className="text-[11px] text-orange-500 font-bold mb-0.5">{product.brand}</p>
                    <Link href={`/produits/${product.slug}`}>
                      <p className="text-sm font-black text-slate-900 line-clamp-2 hover:text-orange-500 transition-colors mb-2">{product.name}</p>
                    </Link>
                    <p className="text-base font-black text-orange-500 mb-3">{product.currentPrice.toLocaleString()}€</p>
                    <button
                      onClick={() => addToCart({ id: product.id, name: product.name, price: product.currentPrice, originalPrice: product.originalPrice ?? product.currentPrice, image: product.image, brand: product.brand ?? "", slug: product.slug })}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2 rounded-xl transition-colors"
                    >
                      Ajouter au panier
                    </button>
                  </>
                ) : (
                  /* Empty slot */
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-400 font-semibold text-center">Ajouter un produit</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Search to add */}
        {slugs.length < MAX && (
          <div className="relative max-w-lg mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setDropdownOpen(true); }}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder="Rechercher un produit à comparer…"
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>

            {dropdownOpen && filtered.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                {filtered.map((p) => (
                  <button
                    key={p.slug}
                    onClick={() => addProduct(p.slug)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left"
                  >
                    <img src={p.image} alt={p.name} className="w-10 h-10 object-contain rounded-lg bg-gray-50 border border-gray-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-gray-400">{p.brand} · {p.currentPrice.toLocaleString()}€</p>
                    </div>
                    <svg className="w-4 h-4 text-orange-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comparison table */}
        {compared.length >= 2 ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="text-sm font-black text-slate-900">Comparaison détaillée</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-black text-gray-400 uppercase tracking-wider w-36">Caractéristique</th>
                    {compared.map((p) => (
                      <th key={p.slug} className="px-5 py-3 text-center text-xs font-black text-slate-900 max-w-[200px]">
                        <div className="line-clamp-2">{p.name}</div>
                      </th>
                    ))}
                    {compared.length < MAX && <th />}
                  </tr>
                </thead>
                <tbody>
                  {SPEC_ROWS.map((row, i) => (
                    <tr key={row.key} className={i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}>
                      <td className="px-5 py-3.5 text-xs font-bold text-gray-500">{row.label}</td>
                      {compared.map((p) => (
                        <td key={p.slug} className="px-5 py-3.5 text-center">
                          {getCellValue(p, row.key)}
                        </td>
                      ))}
                      {compared.length < MAX && <td />}
                    </tr>
                  ))}
                  {/* Specs rows */}
                  {compared.some((p) => p.specs?.length) && (
                    <>
                      <tr>
                        <td colSpan={compared.length + 1} className="px-5 py-3 bg-slate-800 text-white text-xs font-black uppercase tracking-wider">
                          Spécifications techniques
                        </td>
                      </tr>
                      {Array.from({ length: Math.max(...compared.map((p) => p.specs?.length ?? 0)) }).map((_, si) => (
                        <tr key={si} className={si % 2 === 0 ? "bg-gray-50/50" : "bg-white"}>
                          <td className="px-5 py-3 text-xs font-bold text-gray-500">Spec {si + 1}</td>
                          {compared.map((p) => (
                            <td key={p.slug} className="px-5 py-3 text-center text-xs text-slate-600">
                              {p.specs?.[si] ?? "—"}
                            </td>
                          ))}
                          {compared.length < MAX && <td />}
                        </tr>
                      ))}
                    </>
                  )}
                  {/* Actions row */}
                  <tr className="border-t border-gray-100">
                    <td className="px-5 py-4 text-xs font-bold text-gray-500">Action</td>
                    {compared.map((p) => (
                      <td key={p.slug} className="px-5 py-4 text-center">
                        <button
                          onClick={() => addToCart({ id: p.id, name: p.name, price: p.currentPrice, originalPrice: p.originalPrice ?? p.currentPrice, image: p.image, brand: p.brand ?? "", slug: p.slug })}
                          className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Ajouter
                        </button>
                      </td>
                    ))}
                    {compared.length < MAX && <td />}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : compared.length === 1 ? (
          <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="font-bold text-sm">Ajoutez au moins un autre produit pour comparer.</p>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <p className="font-black text-slate-900 text-base mb-1">Aucun produit sélectionné</p>
            <p className="text-sm mb-5">Recherchez des produits ci-dessus ou parcourez le catalogue.</p>
            <Link
              href="/produits"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              Parcourir le catalogue
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
