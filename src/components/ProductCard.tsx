"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const [wishlist, setWishlist] = useState(false);

  const discount = Math.round(
    ((product.originalPrice - product.currentPrice) / product.originalPrice) * 100
  );

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300 flex flex-col group">

      {/* Image */}
      <Link
        href={`/produits/${product.slug}`}
        className="relative block aspect-square overflow-hidden rounded-t-2xl"
        style={{ background: "linear-gradient(145deg,#fff6ee 0%,#ffffff 70%)" }}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-5 group-hover:scale-105 transition-transform duration-500"
          style={{ mixBlendMode: "multiply" }}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow">
              -{discount}%
            </span>
          )}
          {product.badge === "Nouveau" && (
            <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow">
              NOUVEAU
            </span>
          )}
          {product.isRefurbished && (
            <span className="bg-green-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow">
              OCCASION
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); setWishlist((w) => !w); }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
            wishlist
              ? "bg-red-50 text-red-500"
              : "bg-white/90 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-400"
          }`}
        >
          <svg className="w-4 h-4" fill={wishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link href={`/produits/${product.slug}`}>
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-orange-500 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto pt-2 space-y-2">
          {/* Prices */}
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xs text-gray-400 line-through leading-none mb-0.5">
                {product.originalPrice.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
              </p>
              <p className="text-xl font-black text-orange-500 leading-tight">
                {product.currentPrice.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
              </p>
            </div>
            {discount > 0 && (
              <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg shrink-0">
                −{(product.originalPrice - product.currentPrice).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
              </span>
            )}
          </div>

          {/* Free delivery */}
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[10px] font-bold text-green-600">Livraison gratuite</span>
          </div>
        </div>
      </div>

      {/* Add to cart */}
      <div className="px-4 pb-4">
        <button
          onClick={handleAdd}
          className={`w-full py-2.5 text-sm font-bold rounded-xl transition-all ${
            added
              ? "bg-green-500 text-white"
              : "bg-orange-500 hover:bg-orange-600 text-white hover:-translate-y-0.5 shadow-md shadow-orange-100"
          }`}
        >
          {added ? "✓ Ajouté !" : "Ajouter au panier"}
        </button>
      </div>

    </div>
  );
}
