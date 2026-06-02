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
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-orange-500 transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">Mes Favoris</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Mes Favoris</h1>
              <p className="text-sm text-gray-400">
                {favoriteProducts.length === 0
                  ? "Aucun produit sauvegardé"
                  : `${favoriteProducts.length} produit${favoriteProducts.length > 1 ? "s" : ""} sauvegardé${favoriteProducts.length > 1 ? "s" : ""}`}
              </p>
            </div>
            {favoriteProducts.length > 0 && (
              <button
                onClick={() => favoriteProducts.forEach((p) => toggle(p.slug))}
                className="ml-auto text-xs text-gray-400 hover:text-red-500 font-semibold transition-colors flex items-center gap-1.5"
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {favoriteProducts.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <div className="w-24 h-24 bg-white rounded-3xl border border-slate-200 flex items-center justify-center shadow-sm">
              <svg className="w-12 h-12 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 mb-1">Aucun favori pour l&apos;instant</p>
              <p className="text-sm text-gray-400 max-w-xs">
                Cliquez sur le ♡ sur n&apos;importe quel produit pour l&apos;ajouter à vos favoris.
              </p>
            </div>
            <Link
              href="/produits"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h7" />
              </svg>
              Découvrir nos produits
            </Link>
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
