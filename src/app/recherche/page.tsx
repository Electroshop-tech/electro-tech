"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sort, setSort] = useState("pertinence");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 99999]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const q = searchParams.get("q") ?? "";
  const cat = searchParams.get("cat") ?? "";

  const doSearch = useCallback(async (query: string, category: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&cat=${encodeURIComponent(category)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  useEffect(() => {
    if (q) doSearch(q, cat);
  }, [q, cat, doSearch]);

  // Apply filters & sort
  useEffect(() => {
    let items = [...results];
    if (inStockOnly) items = items.filter(p => p.inStock !== false);
    items = items.filter(p => p.currentPrice >= priceRange[0] && p.currentPrice <= priceRange[1]);
    switch (sort) {
      case "prix-asc": items.sort((a, b) => a.currentPrice - b.currentPrice); break;
      case "prix-desc": items.sort((a, b) => b.currentPrice - a.currentPrice); break;
      case "nom": items.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    setFiltered(items);
  }, [results, sort, priceRange, inStockOnly]);

  const handleNewSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newQ = (fd.get("q") as string)?.trim();
    if (newQ) router.push(`/recherche?q=${encodeURIComponent(newQ)}`);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-16">
          <nav className="flex items-center gap-2 text-xs text-white/40 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white/70">Recherche</span>
          </nav>
          <div className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-black px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Recherche
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-3">
            {q ? <>Résultats pour<br /><span className="text-orange-400">« {q} »</span></> : <>Trouvez le<br /><span className="text-orange-400">produit idéal</span></>}
          </h1>
          {q && searched && (
            <p className="text-slate-400 text-sm mb-6">
              <span className="text-white font-black">{results.length}</span> résultat{results.length !== 1 ? "s" : ""} trouvé{results.length !== 1 ? "s" : ""}
            </p>
          )}
          {/* Search bar embedded in hero */}
          <form onSubmit={handleNewSearch} className="flex gap-2 max-w-2xl mt-6">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                name="q"
                defaultValue={q}
                placeholder="Rechercher des produits, marques…"
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 transition-all"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-black px-6 rounded-2xl text-sm transition-all shadow-lg shadow-orange-500/30 shrink-0"
            >
              Rechercher
            </button>
          </form>
        </div>
        <div className="relative h-10 overflow-hidden">
          <svg viewBox="0 0 1440 40" className="absolute bottom-0 w-full" fill="#f5f7fb" preserveAspectRatio="none">
            <path d="M0,40 C360,0 1080,40 1440,0 L1440,40 Z" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter bar */}
        {searched && results.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-6 bg-white border border-slate-200 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">Trier :</label>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-700 outline-none focus:border-orange-400"
              >
                <option value="pertinence">Pertinence</option>
                <option value="prix-asc">Prix croissant</option>
                <option value="prix-desc">Prix décroissant</option>
                <option value="nom">Nom A-Z</option>
              </select>
            </div>
            <div className="w-px h-6 bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">Prix max :</label>
              <input
                type="number"
                min={0}
                placeholder="MAD"
                className="w-24 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-700 outline-none focus:border-orange-400"
                onChange={e => {
                  const v = Number(e.target.value);
                  setPriceRange([0, v > 0 ? v : 99999]);
                }}
              />
            </div>
            <div className="w-px h-6 bg-slate-200 hidden sm:block" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
              />
              <span className="text-xs font-bold text-slate-600">En stock uniquement</span>
            </label>
            <div className="ml-auto text-xs text-slate-400 font-semibold">
              {filtered.length}/{results.length} résultat{results.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && searched && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}

        {!loading && searched && filtered.length === 0 && q && (
          <div className="flex flex-col items-center py-24 text-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-black text-gray-800">Aucun résultat trouvé</h2>
            <p className="text-sm text-gray-500 max-w-xs">
              Essayez avec d&apos;autres mots-clés ou parcourez nos catégories.
            </p>
            <Link href="/produits" className="mt-2 bg-orange-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-colors">
              Voir tous les produits
            </Link>
          </div>
        )}

        {!loading && !searched && !q && (
          <div className="flex flex-col items-center py-24 text-center gap-3">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Entrez un mot-clé pour commencer la recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecherchePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
