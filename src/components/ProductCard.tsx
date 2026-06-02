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

  const visibleReviews =
    product.productReviews?.filter((r) => r.approved !== false) ?? [];
  const avgRating =
    visibleReviews.length > 0
      ? Math.round(visibleReviews.reduce((s, r) => s + r.rating, 0) / visibleReviews.length * 10) / 10
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
    <div className="h-full bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_4px_24px_rgba(15,23,42,0.07)] hover:shadow-[0_24px_60px_rgba(249,115,22,0.16),0_8px_28px_rgba(15,23,42,0.10)] hover:-translate-y-2 hover:border-orange-200 transition-all duration-350 ease-out flex flex-col group relative">

      {/* Outer glow on hover */}
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-orange-400/0 via-amber-300/0 to-orange-500/0 group-hover:from-orange-400/10 group-hover:via-amber-300/5 group-hover:to-orange-500/10 transition-all duration-350 pointer-events-none z-0" />

      {/* ── IMAGE ── */}
      <div
        className="relative aspect-square overflow-hidden"
        style={{ background: "linear-gradient(145deg,#f8faff 0%,#eef1fb 60%,#e4e9f6 100%)" }}
      >
        {/* soft vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(15,23,42,0.04)_100%)] z-[1] pointer-events-none" />

        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-5 sm:p-7 group-hover:scale-[1.06] transition-transform duration-500 ease-out z-0 drop-shadow-lg"
          style={{ mixBlendMode: "multiply" }}
          sizes="(max-width: 640px) 55vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Full-card link overlay */}
        <Link href={`/produits/${product.slug}`} className="absolute inset-0 z-[2]" aria-label={product.name} />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discount > 0 && (
            <span className="bg-gradient-to-br from-orange-500 to-rose-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-[0_4px_12px_rgba(249,115,22,0.50)] ring-1 ring-white/30 tracking-wide">
              -{discount}%
            </span>
          )}
          {product.badge === "Nouveau" && (
            <span className="bg-gradient-to-br from-blue-500 to-violet-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-[0_4px_12px_rgba(99,102,241,0.50)] ring-1 ring-white/30">
              NOUVEAU
            </span>
          )}
          {product.isRefurbished && (
            <span className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-[0_4px_12px_rgba(16,185,129,0.50)] ring-1 ring-white/30">
              OCCASION
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product.slug); }}
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
            wishlist
              ? "bg-red-500 text-white shadow-[0_4px_16px_rgba(239,68,68,0.45)]"
              : "bg-white/85 backdrop-blur-sm text-slate-300 opacity-100 sm:opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-white hover:shadow-md"
          }`}
          aria-label={wishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <svg className="w-4 h-4" fill={wishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Hover action bar */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center gap-5 py-3">
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
            aria-label={`Comparer ${product.name}`}
            className="flex flex-col items-center gap-0.5 text-white/60 hover:text-orange-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
            <span className="text-[10px] font-semibold">Comparer</span>
          </button>
          <div className="w-px h-8 bg-white/10" />
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/produits/${product.slug}`); }}
            aria-label={`Voir les détails de ${product.name}`}
            className="flex flex-col items-center gap-0.5 text-white/60 hover:text-orange-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-[10px] font-semibold">Apercu</span>
          </button>
          <div className="w-px h-8 bg-white/10" />
          <a
            href={`https://wa.me/212716408919?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20${encodeURIComponent(product.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Contacter via WhatsApp`}
            className="flex flex-col items-center gap-0.5 text-white/60 hover:text-[#25D366] transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="text-[10px] font-semibold">WhatsApp</span>
          </a>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="px-4 pt-4 pb-3 flex flex-col gap-3 flex-1 relative z-[1]">

        {/* Brand + Rating row */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand chip */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-1 h-3.5 rounded-full bg-gradient-to-b from-orange-400 to-amber-500 shrink-0" />
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.14em] truncate">{product.brand}</span>
          </div>
          {/* Rating pill */}
          {avgRating !== null ? (
            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 px-2.5 py-1 rounded-full shrink-0 shadow-sm">
              <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[11px] font-black text-amber-700">{avgRating.toFixed(1)}</span>
              {visibleReviews.length > 0 && (
                <span className="text-[10px] font-semibold text-amber-500/80">/ {visibleReviews.length}</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100 shrink-0">
              {[1,2,3,4,5].map((i) => (
                <svg key={i} className="w-2.5 h-2.5 text-slate-200" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          )}
        </div>

        {/* Product name */}
        <Link href={`/produits/${product.slug}`}>
          <h3 className="text-[14.5px] sm:text-[15px] font-bold text-slate-900 line-clamp-2 hover:text-orange-600 transition-colors leading-snug min-h-[2.6rem]">
            {product.name}
          </h3>
        </Link>

        {/* Price block */}
        <div className="mt-auto pt-1">
          <div className="flex items-end justify-between gap-2 mb-2.5">
            <div>
              {product.originalPrice !== product.currentPrice && (
                <p className="text-xs text-slate-400 line-through leading-none mb-1">
                  {product.originalPrice.toLocaleString()} &euro;
                </p>
              )}
              <p className="text-2xl font-black leading-none text-orange-500 tracking-tight">
                {product.currentPrice.toLocaleString()}
                <span className="text-sm font-bold text-orange-400 ml-1">&euro;</span>
              </p>
            </div>
            {discount > 0 && (
              <div className="shrink-0 text-center bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl px-2.5 py-2 shadow-[0_4px_14px_rgba(16,185,129,0.35)]">
                <div className="text-[11px] font-black leading-none">-{discount}%</div>
                <div className="text-[9px] font-semibold opacity-90 mt-0.5">
                  -{(product.originalPrice - product.currentPrice).toLocaleString()} &euro;
                </div>
              </div>
            )}
          </div>

          {/* Stock + Delivery */}
          <div className="flex items-center gap-2 py-2 border-t border-slate-100">
            {product.inStock !== false ? (
              typeof product.stockQuantity === "number" && product.stockQuantity > 0 && product.stockQuantity <= 5 ? (
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                  </span>
                  <span className="text-[11px] font-semibold text-orange-500">Plus que {product.stockQuantity} en stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600">En stock</span>
                </div>
              )
            ) : (
              <span className="text-[11px] font-semibold text-slate-400">Sur commande</span>
            )}
            <div className="ml-auto flex items-center gap-1 text-slate-400">
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span className="text-[11px] font-semibold">Livraison gratuite</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BUTTON ── */}
      <div className="px-4 pb-4">
        <button
          onClick={handleAdd}
          className={`w-full py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 ${
            added
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_8px_24px_rgba(16,185,129,0.40)] scale-[0.98]"
              : "bg-gradient-to-r from-orange-500 via-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white shadow-[0_8px_24px_rgba(249,115,22,0.35)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.45)] hover:-translate-y-0.5 active:scale-[0.97]"
          }`}
        >
          {added ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Ajouté au panier !
            </>
          ) : (
            <>
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Ajouter au panier
            </>
          )}
        </button>
      </div>

    </div>
  );
}
