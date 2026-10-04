"use client";

import { useState, type MouseEvent } from "react";
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

  const handleAdd = (event: MouseEvent<HTMLButtonElement>) => {
    addToCart({ ...product, image: decodeURIComponent(product.image) }, 1, event.currentTarget);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_24px_rgba(15,23,42,0.04)] px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] flex items-center gap-5">
      <div className="min-w-0 shrink-0">
        <p className="text-[10px] text-slate-400 mb-0.5">Votre prix</p>
        <p className="text-2xl font-semibold tracking-tight text-slate-800">{product.price.toLocaleString("fr-FR")} <span className="text-base">€</span></p>
      </div>
      <div className="flex-1 min-w-0">
        <button
          onClick={handleAdd}
          className={`w-full py-3.5 px-2 rounded-xl font-semibold text-sm transition-all ${
            added
              ? "bg-emerald-600 text-white"
              : "bg-[#ff7a28] hover:bg-[#ed6819] text-white"
          }`}
        >
          {added ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              Merci ! Ajouté
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
