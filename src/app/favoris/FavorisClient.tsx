"use client";

import Link from "next/link";
import { useWishlist } from "@/lib/wishlistContext";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export default function FavorisClient({ products }: { products: Product[] }) {
  const { wishlist, toggle } = useWishlist();

  const favoriteProducts = products.filter((p) => wishlist.includes(p.slug));

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-orange-500 transition-colors">Accueil</Link>
            <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-slate-700 font-semibold">Mes Favoris</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl flex items-center justify-center shadow-sm border border-red-100">
              <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-tight">Mes Favoris</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {favoriteProducts.length === 0
                  ? "Aucun produit sauvegardé"
                  : `${favoriteProducts.length} produit${favoriteProducts.length > 1 ? "s" : ""} sauvegardé${favoriteProducts.length > 1 ? "s" : ""}`}
              </p>
            </div>
            {favoriteProducts.length > 0 && (
              <button
                onClick={() => favoriteProducts.forEach((p) => toggle(p.slug))}
                className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 font-semibold transition-colors border border-slate-200 hover:border-red-200 hover:bg-red-50 px-3 py-2 rounded-lg"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Tout supprimer
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {favoriteProducts.length === 0 ? (
          /* Premium empty state */
          <div className="flex flex-col items-center justify-center py-20 gap-8 text-center">
            {/* Animated icon */}
            <div className="relative">
              <div className="w-28 h-28 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_40px_rgba(15,23,42,0.08)] flex items-center justify-center">
                <svg className="w-14 h-14 text-slate-100" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              {/* Floating sparkles */}
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-400 text-xs font-black shadow-sm">+</span>
              <span className="absolute -bottom-1 -left-2 w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center text-pink-400 text-[10px] font-black shadow-sm">♡</span>
            </div>

            {/* Text */}
            <div className="max-w-sm">
              <p className="text-2xl font-black text-slate-900 mb-2 leading-tight">Votre liste est vide</p>
              <p className="text-sm text-slate-400 leading-relaxed">
                Explorez nos produits et cliquez sur{" "}
                <span className="inline-flex items-center gap-0.5 font-semibold text-slate-600">
                  <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </span>{" "}
                pour sauvegarder vos coups de cœur et les retrouver ici.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/produits"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white font-bold px-7 py-3.5 rounded-2xl text-sm shadow-[0_8px_24px_rgba(249,115,22,0.35)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.45)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h7" />
                </svg>
                Découvrir nos produits
              </Link>
              <Link
                href="/nouveautes"
                className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-orange-200 hover:bg-orange-50 text-slate-700 hover:text-orange-600 font-bold px-7 py-3.5 rounded-2xl text-sm transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                </svg>
                Nouveautés
              </Link>
            </div>

            {/* Hint pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {["Box Android TV", "Caméras IP", "Accessoires", "Promotions"].map((label) => (
                <span key={label} className="text-[11px] font-semibold text-slate-400 bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-sm">
                  {label}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {favoriteProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
