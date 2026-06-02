"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";
import { useWishlist } from "@/lib/wishlistContext";
import { useCart } from "@/lib/cartContext";

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const { toggle: toggleWishlist, isWished } = useWishlist();
  const { addToCart } = useCart();
  const wishlist = isWished(product.slug);

  const discount = Math.round(
    ((product.originalPrice - product.currentPrice) / product.originalPrice) * 100
  );

  const avgRating =
    product.productReviews && product.productReviews.length > 0
      ? Math.round(product.productReviews.reduce((s, r) => s + r.rating, 0) / product.productReviews.length * 10) / 10
      : null;

  const handleAdd = () => {
    addToCart({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.currentPrice,
      originalPrice: product.originalPrice,
      image: product.image,
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="h-full overflow-hidden bg-white rounded-lg border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-slate-300 hover:shadow-[0_18px_44px_rgba(15,23,42,0.10)] hover:-translate-y-1 transition-all duration-300 flex flex-col group">

      {/* Image */}
      <Link
        href={`/produits/${product.slug}`}
        className="relative block aspect-square overflow-hidden border-b border-slate-100"
        style={{ background: "linear-gradient(145deg,#f8fafc 0%,#ffffff 72%)" }}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-3 sm:p-6 group-hover:scale-105 transition-transform duration-500 ease-out"
          style={{ mixBlendMode: "multiply" }}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discount > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
              -{discount}%
            </span>
          )}
          {product.badge === "Nouveau" && (
            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
              NOUVEAU
            </span>
          )}
          {product.isRefurbished && (
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
              OCCASION
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product.slug); }}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center transition-all shadow-sm ${
            wishlist
              ? "bg-red-50 text-red-500"
              : "bg-white/95 text-slate-300 opacity-100 sm:opacity-0 group-hover:opacity-100 hover:text-red-400"
          }`}
          aria-label={wishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <svg className="w-4 h-4" fill={wishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Hover action bar — compare + quick view + WhatsApp */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center gap-4 py-2.5">
          <button
            onClick={(e) => {
              e.preventDefault();
              const saved = JSON.parse(localStorage.getItem("compare-list") ?? "[]") as string[];
              if (!saved.includes(product.slug) && saved.length < 3) {
                localStorage.setItem("compare-list", JSON.stringify([...saved, product.slug]));
                window.location.href = "/comparer";
              } else if (saved.includes(product.slug)) {
                window.location.href = "/comparer";
              }
            }}
            className="flex items-center gap-1.5 text-white/70 hover:text-orange-400 text-[11px] font-semibold transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
            Comparer
          </button>
          <span className="w-px h-3.5 bg-white/20" />
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/produits/${product.slug}`); }}
            className="flex items-center gap-1.5 text-white/70 hover:text-orange-400 text-[11px] font-semibold transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Voir
          </button>
          <span className="w-px h-3.5 bg-white/20" />
          <a
            href={`https://wa.me/212716408919?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20${encodeURIComponent(product.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-white/70 hover:text-[#25D366] text-[11px] font-semibold transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-2.5 flex-1">
        <Link href={`/produits/${product.slug}`}>
          <h3 className="min-h-[2.45rem] text-sm font-bold text-slate-950 line-clamp-2 hover:text-orange-600 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Brand + Rating */}
        <div className="flex items-center justify-between gap-2 min-h-[1.125rem]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide truncate">{product.brand}</span>
          {avgRating !== null && (
            <div className="flex items-center gap-1 shrink-0">
              <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[11px] font-bold text-amber-600">{avgRating.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400">({product.productReviews!.length})</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-1.5 sm:pt-2 space-y-2">
          {/* Prices */}
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xs text-slate-400 line-through leading-none mb-1">
                {product.originalPrice.toLocaleString()}€
              </p>
              <p className="text-base sm:text-xl font-black text-slate-950 leading-tight">
                {product.currentPrice.toLocaleString()}€
              </p>
            </div>
            {discount > 0 && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md shrink-0">
                −{(product.originalPrice - product.currentPrice).toLocaleString()}€
              </span>
            )}
          </div>

          {/* Free delivery + stock */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-100 px-2 py-1">
              <svg className="w-3 h-3 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[10px] font-bold text-emerald-700">Livraison gratuite</span>
            </div>
            {product.inStock !== false && (
              <div className="inline-flex items-center gap-1 px-2 py-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-semibold text-emerald-600">En stock</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add to cart */}
      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        <button
          onClick={handleAdd}
          className={`w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            added
              ? "bg-emerald-600 text-white"
              : "bg-slate-950 hover:bg-orange-600 text-white hover:-translate-y-0.5 shadow-[0_8px_18px_rgba(15,23,42,0.12)]"
          }`}
        >
          {added ? "✓ Ajouté !" : "Ajouter au panier"}
        </button>
      </div>

    </div>
  );
}
