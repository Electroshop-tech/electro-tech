"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";

const STORAGE_KEY = "electro-recently-viewed";
const MAX_STORED = 7;

export default function RecentlyViewed({
  products,
  currentSlug,
}: {
  products: Product[];
  currentSlug: string;
}) {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[];
    const updated = [currentSlug, ...stored.filter((s) => s !== currentSlug)].slice(0, MAX_STORED);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const visible = updated
      .filter((s) => s !== currentSlug)
      .slice(0, 4)
      .map((slug) => products.find((p) => p.slug === slug))
      .filter(Boolean) as Product[];

    setRecentProducts(visible);
  }, [currentSlug, products]);

  if (recentProducts.length === 0) return null;

  return (
    <section className="mt-12 mb-4">
      <div className="flex items-center gap-4 mb-5">
        <h2 className="text-xl font-black text-gray-900 whitespace-nowrap">Récemment consultés</h2>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {recentProducts.map((product) => {
          const discount = Math.round(
            ((product.originalPrice - product.currentPrice) / product.originalPrice) * 100
          );
          return (
            <Link
              key={product.slug}
              href={`/produits/${product.slug}`}
              className="bg-white rounded-lg border border-slate-200/80 hover:border-orange-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all p-3 flex flex-col gap-2 group"
            >
              <div className="relative aspect-square rounded-md overflow-hidden bg-slate-50">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  style={{ mixBlendMode: "multiply" }}
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                {discount > 0 && (
                  <span className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                    -{discount}%
                  </span>
                )}
              </div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{product.brand}</p>
              <p className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">{product.name}</p>
              <p className="text-sm font-black text-orange-500 mt-auto">
                {product.currentPrice.toLocaleString()}€
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
