"use client";

import { useState } from "react";
import { useCart } from "@/lib/cartContext";

type CartProduct = {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  image: string;
  slug: string;
};

export default function MobileStickyCart({ product }: { product: CartProduct }) {
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  const savings = product.originalPrice - product.price;

  const handleAdd = () => {
    addToCart({ ...product, image: decodeURIComponent(product.image) }, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-12px_36px_rgba(15,23,42,0.12)]">
      {/* Top info row */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-1">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-gray-400 truncate font-medium">{product.name}</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-black text-orange-500 leading-tight">
              {product.price.toLocaleString()}€
            </p>
            {discount > 0 && (
              <>
                <p className="text-xs text-gray-400 line-through">
                  {product.originalPrice.toLocaleString()}€
                </p>
                <span className="text-[10px] font-black text-green-700 bg-green-100 px-1.5 py-0.5 rounded-md">
                  −{savings.toFixed(0)}€
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 shrink-0">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Livraison gratuite
        </div>
      </div>
      {/* Button row */}
      <div className="px-4 pb-4">
        <button
          onClick={handleAdd}
          className={`w-full py-3.5 rounded-lg font-black text-sm transition-all ${
            added
              ? "bg-emerald-600 text-white"
              : "bg-slate-950 hover:bg-orange-600 text-white shadow-[0_10px_22px_rgba(15,23,42,0.12)]"
          }`}
        >
          {added ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              Ajouté au panier !
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Ajouter au panier
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
