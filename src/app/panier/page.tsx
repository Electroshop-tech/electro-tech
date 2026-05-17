"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type CartItem = {
  id: number;
  name: string;
  brand: string;
  sku: string;
  price: number;
  originalPrice: number;
  image: string;
  qty: number;
  deliveryMin: string;
  deliveryMax: string;
};

const initialCart: CartItem[] = [
  {
    id: 1,
    name: "Hikvision DS-2CD2143G2-I 4MP AcuSense",
    brand: "Hikvision",
    sku: "DS-2CD2143G2-I",
    price: 890,
    originalPrice: 1100,
    image: "/images/placeholder-camera.svg",
    qty: 1,
    deliveryMin: "19 mai",
    deliveryMax: "21 mai",
  },
  {
    id: 2,
    name: "Xiaomi Mi Box S 4K Ultra HD Android TV",
    brand: "Xiaomi",
    sku: "MDZ-22-AB",
    price: 299,
    originalPrice: 399,
    image: "/images/placeholder-mediabox.svg",
    qty: 1,
    deliveryMin: "19 mai",
    deliveryMax: "21 mai",
  },
  {
    id: 3,
    name: "Chargeur GaN 65W 3 Ports USB-C",
    brand: "Baseus",
    sku: "BSS-GAN65W",
    price: 199,
    originalPrice: 299,
    image: "/images/placeholder-accessoire.svg",
    qty: 1,
    deliveryMin: "20 mai",
    deliveryMax: "22 mai",
  },
];

const FREE_SHIPPING_AT = 2000;

type Shipping = "domicile" | "retrait" | "autre";

export default function PanierPage() {
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState(false);
  const [shipping, setShipping] = useState<Shipping>("domicile");

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const removeItem = (id: number) => setCart((prev) => prev.filter((i) => i.id !== id));

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const promoDiscount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const shippingCost = subtotal >= FREE_SHIPPING_AT ? 0 : shipping === "retrait" ? 0 : shipping === "autre" ? 59 : 40;
  const total = subtotal - promoDiscount + shippingCost;

  const progressPct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_AT) * 100));
  const remaining = Math.max(0, FREE_SHIPPING_AT - subtotal);

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === "ELECTRO10") {
      setPromoApplied(true);
      setPromoError(false);
    } else {
      setPromoError(true);
      setPromoApplied(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-center gap-3 text-sm font-bold tracking-widest uppercase">
          <span className="text-slate-900 border-b-2 border-orange-500 pb-0.5">Panier</span>
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-400">Commander</span>
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-400">Commande terminee</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {cart.length === 0 ? (
          <div className="bg-white rounded-xl p-16 flex flex-col items-center gap-5 text-center shadow-sm">
            <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-xl font-black text-slate-900">Votre panier est vide</p>
            <Link href="/produits" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-lg transition-colors">
              Voir les produits
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 items-start">

            {/* LEFT */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">

              {/* Free shipping progress */}
              <div className="px-6 pt-5 pb-4 border-b border-gray-100">
                {subtotal >= FREE_SHIPPING_AT ? (
                  <p className="text-sm font-semibold text-green-600">
                    Vous beneficiez de la <span className="font-black">livraison gratuite</span> !
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 mb-2">
                    Ajoutez <span className="font-black text-orange-500">{remaining.toLocaleString("fr-FR")}€</span> au panier et beneficiez de la livraison gratuite !
                  </p>
                )}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-orange-500 transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-12 px-6 py-3 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span className="col-span-1" />
                <span className="col-span-5">Produit</span>
                <span className="col-span-2 text-center">Prix</span>
                <span className="col-span-2 text-center">Quantite</span>
                <span className="col-span-2 text-right">Sous-total</span>
              </div>

              {/* Items */}
              {cart.map((item, idx) => (
                <div key={item.id} className={`grid grid-cols-12 gap-2 items-center px-6 py-4 ${idx < cart.length - 1 ? "border-b border-gray-50" : ""}`}>
                  {/* Remove */}
                  <div className="col-span-1 flex items-center justify-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                      aria-label="Supprimer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Product */}
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.name} width={64} height={64} className="object-contain p-1.5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">{item.name}</p>
                      <p className="text-xs text-orange-500 font-semibold mt-0.5 italic">
                        Livraison estimee : {item.deliveryMin} - {item.deliveryMax}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-center">
                    <p className="text-sm font-bold text-slate-900">{item.price.toLocaleString("fr-FR")}€</p>
                    {item.originalPrice > item.price && (
                      <p className="text-xs text-gray-300 line-through">{item.originalPrice.toLocaleString("fr-FR")},00</p>
                    )}
                  </div>

                  {/* Qty */}
                  <div className="col-span-2 flex items-center justify-center">
                    <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-base font-semibold transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 h-8 flex items-center justify-center text-sm font-bold text-slate-900 border-x border-gray-200">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-base font-semibold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="col-span-2 text-right">
                    <p className="text-sm font-black text-orange-500">{(item.price * item.qty).toLocaleString("fr-FR")}€</p>
                  </div>
                </div>
              ))}

              {/* Promo code */}
              <div className="px-6 py-5 border-t border-gray-100 flex items-center gap-3">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => { setPromoCode(e.target.value); setPromoError(false); }}
                  placeholder="Code promo"
                  className="w-48 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 placeholder-gray-300"
                />
                <button
                  onClick={applyPromo}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
                >
                  Appliquer Le Code Promo
                </button>
                {promoApplied && (
                  <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    -10% applique
                  </span>
                )}
                {promoError && (
                  <span className="text-xs text-red-500 font-bold">Code invalide</span>
                )}
              </div>
            </div>

            {/* RIGHT — Summary */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 pt-6 pb-2 border-b border-gray-100">
                <h2 className="text-xl font-black text-slate-900">Recapitulatif</h2>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-semibold">Sous-total</span>
                  <span className="font-bold text-slate-900">{subtotal.toLocaleString("fr-FR")}€</span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-semibold">Reduction (10%)</span>
                    <span className="font-bold text-green-600">-{promoDiscount.toLocaleString("fr-FR")}€</span>
                  </div>
                )}

                {/* Shipping options */}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Expedition</p>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center justify-between gap-2 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shipping === "domicile"}
                          onChange={() => setShipping("domicile")}
                          className="accent-blue-600 w-4 h-4"
                        />
                        <span className="text-gray-700">Livraison a domicile</span>
                      </div>
                      <span className="font-bold text-orange-500 whitespace-nowrap">
                        {subtotal >= FREE_SHIPPING_AT ? "Gratuite" : "40€"}
                      </span>
                    </label>
                    <label className="flex items-center justify-between gap-2 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shipping === "retrait"}
                          onChange={() => setShipping("retrait")}
                          className="accent-blue-600 w-4 h-4"
                        />
                        <span className="text-gray-700">Retrait en magasin</span>
                      </div>
                      <span className="font-bold text-green-600">Gratuit</span>
                    </label>
                    <label className="flex items-center justify-between gap-2 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shipping === "autre"}
                          onChange={() => setShipping("autre")}
                          className="accent-blue-600 w-4 h-4"
                        />
                        <span className="text-gray-700">Autre ville</span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {subtotal >= FREE_SHIPPING_AT ? "Gratuite" : "59€"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="text-base font-black text-slate-900">Total</span>
                  <span className="text-2xl font-black text-orange-500">{total.toLocaleString("fr-FR")}€</span>
                </div>

                {/* Checkout */}
                <Link
                  href="/commander"
                  className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-3.5 rounded-lg text-center transition-all text-sm tracking-wide"
                >
                  Valider La Commande
                </Link>

                <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Paiement 100% securise
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}