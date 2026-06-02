import { getProductCards } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nouveautés — ElectroShop-Tech",
  description: "Découvrez les derniers produits arrivés sur ElectroShop-Tech : box Android TV, caméras de surveillance et accessoires high-tech.",
};

export default async function NouveautesPage() {
  const allProducts = await getProductCards();
  // Show newest first (highest ID = most recently added)
  const products = [...allProducts].sort((a, b) => b.id - a.id);
  const recent = products.slice(0, 20);

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 pt-10 sm:pt-20 pb-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div className="pb-10 sm:pb-20">
              <nav className="flex items-center gap-2 text-xs text-white/40 mb-6">
                <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
                <span>/</span>
                <span className="text-white/70">Nouveautés</span>
              </nav>
              <div className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-black px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                Arrivages récents
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5">
                Nouveaux<br />
                <span className="text-orange-400">Arrivages</span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed max-w-md mb-8">
                {recent.length} produit{recent.length > 1 ? "s" : ""} récemment ajouté{recent.length > 1 ? "s" : ""} — découvrez nos dernières nouveautés en avant-première.
              </p>
              <Link
                href="/produits"
                className="inline-flex items-center gap-2 border border-slate-700 hover:border-orange-400 text-slate-400 hover:text-orange-400 font-bold px-6 py-3 rounded-xl transition-all text-sm"
              >
                Voir tout le catalogue
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="hidden lg:flex flex-col gap-4 pb-16">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                  <p className="text-3xl font-black text-orange-400">{recent.length}</p>
                  <p className="text-slate-400 text-xs mt-1">Nouveaux produits</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                  <p className="text-3xl font-black text-orange-400">24h</p>
                  <p className="text-slate-400 text-xs mt-1">Livraison rapide</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">100% authentiques</p>
                  <p className="text-slate-400 text-xs">Garantie 1 an sur tous les produits</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative h-16 overflow-hidden">
          <svg viewBox="0 0 1440 64" className="absolute bottom-0 w-full" fill="#f5f7fb" preserveAspectRatio="none">
            <path d="M0,64 C360,0 1080,64 1440,0 L1440,64 Z" />
          </svg>
        </div>
      </section>

      {/* Products grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {recent.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg font-bold">Aucun produit disponible pour le moment.</p>
            <Link href="/produits" className="mt-4 inline-block text-orange-500 hover:underline text-sm font-semibold">
              Voir tous les produits
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {recent.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>

            {allProducts.length > 20 && (
              <div className="text-center mt-10">
                <Link
                  href="/produits"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-black px-8 py-3.5 rounded-xl text-sm transition-colors"
                >
                  Voir tout le catalogue ({allProducts.length} produits)
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
