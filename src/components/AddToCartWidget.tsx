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

export default function AddToCartWidget({ product }: { product: CartProduct }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart({ ...product, image: decodeURIComponent(product.image) }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Quantity */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-500">Qté :</span>
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-9 h-9 text-gray-600 hover:bg-gray-100 flex items-center justify-center font-bold transition-colors"
          >
            −
          </button>
          <span className="w-10 text-center font-black text-gray-900 text-sm">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="w-9 h-9 text-gray-600 hover:bg-gray-100 flex items-center justify-center font-bold transition-colors"
          >
            +
          </button>
        </div>
        <span className="ml-auto text-sm font-black text-gray-800">
          {(product.price * qty).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
        </span>
      </div>

      {/* Add to cart + wishlist */}
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          className={`flex-1 py-3.5 rounded-xl font-black text-sm tracking-wide transition-all ${
            added
              ? "bg-green-600 text-white"
              : "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-200 hover:-translate-y-0.5"
          }`}
        >
          {added ? "✓ Ajouté au panier !" : "Ajouter au panier"}
        </button>
        <button
          onClick={() => setWishlist((w) => !w)}
          title={wishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
          className={`w-12 rounded-xl border-2 flex items-center justify-center transition-all ${
            wishlist
              ? "border-red-300 bg-red-50 text-red-500"
              : "border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400"
          }`}
        >
          <svg className="w-5 h-5" fill={wishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
