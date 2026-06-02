"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cartContext";

export default function PanierPage() {
  const { items: cart, removeFromCart: removeItem, updateQty, cartTotal: subtotal } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);

  const promoDiscount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = Math.max(0, subtotal - promoDiscount + deliveryFee);
  const cartSavings = cart.reduce((s, i) => s + (i.originalPrice - i.price) * i.qty, 0);

  useEffect(() => {
    if (subtotal <= 0) { setDeliveryFee(0); return; }
    fetch(`/api/delivery-zones?subtotal=${subtotal}`)
      .then(r => r.json())
      .then(d => setDeliveryFee(Math.max(0, Number(d?.fee) || 0)))
      .catch(() => setDeliveryFee(0));
  }, [subtotal]);

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
    <main className="min-h-screen bg-[#f5f7fb]">
      {/* Steps */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-start">
            {/* Step 1 – active */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shadow-md shadow-orange-200">
                <span className="text-white text-xs font-black">1</span>
              </div>
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-wider">Panier</span>
            </div>
            {/* Connector */}
            <div className="flex-1 h-0.5 bg-orange-200 mt-4 mx-2" />
            {/* Step 2 */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs font-black">2</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Commander</span>
            </div>
            {/* Connector */}
            <div className="flex-1 h-0.5 bg-gray-200 mt-4 mx-2" />
            {/* Step 3 */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs font-black">3</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Terminé</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {cart.length === 0 ? (
          <div className="bg-white rounded-lg p-16 flex flex-col items-center gap-5 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] border border-slate-200">
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
            <div className="lg:col-span-2 bg-white rounded-lg shadow-[0_1px_2px_rgba(15,23,42,0.04)] border border-slate-200 overflow-hidden">

              {/* Free shipping banner */}
              {deliveryFee <= 0 && (
              <div className="relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 px-5 py-3.5 flex items-center gap-3">
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-emerald-500" />
                {/* Check circle */}
                <div className="shrink-0 w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shadow-sm shadow-green-200">
                  <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-green-800 leading-none">Livraison offerte sur votre commande</p>
                  <p className="text-[11px] text-green-600 mt-0.5">Expédition sous 24h · Suivi inclus · Partout au Maroc</p>
                </div>
                {/* Saving badge */}
                <div className="shrink-0 flex flex-col items-center bg-green-500 rounded-xl px-3 py-1.5 shadow-sm">
                  <span className="text-[9px] text-white/80 font-bold uppercase tracking-wide leading-none">Économie</span>
                  <span className="text-sm text-white font-black leading-tight">{cartSavings > 0 ? `${cartSavings}€` : '0€'}</span>
                </div>
              </div>
              )}

              {/* Table header - desktop only */}
              <div className="hidden md:grid grid-cols-12 px-6 py-3 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span className="col-span-1" />
                <span className="col-span-5">Produit</span>
                <span className="col-span-2 text-center">Prix</span>
                <span className="col-span-2 text-center">Quantite</span>
                <span className="col-span-2 text-right">Sous-total</span>
              </div>

              {/* Items */}
              {cart.map((item, idx) => (
                <div key={item.id}>

                  {/* Mobile card layout */}
                  <div className={`md:hidden px-4 py-4 ${idx < cart.length - 1 ? "border-b border-gray-100" : ""}`}>
                    <div className="flex gap-3">
                      {/* Image */}
                      <div className="w-20 h-20 flex-shrink-0 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                        <Image src={decodeURIComponent(item.image)} alt={item.name} width={80} height={80} sizes="80px" className="object-contain p-2 w-full h-full" />
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 flex-1">{item.name}</p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="shrink-0 w-7 h-7 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center active:bg-red-100 active:text-red-500 transition-colors"
                            aria-label="Supprimer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <svg className="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM3.56 5H18.44l-1.5 7H5.06L3.56 5z" />
                          </svg>
                          <p className="text-[11px] text-orange-500 font-medium">Livraison gratuite 24–48h</p>
                        </div>
                      </div>
                    </div>
                    {/* Bottom row: qty + price */}
                    <div className="flex items-center justify-between mt-3 pl-0">
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-9 h-9 flex items-center justify-center text-gray-500 active:bg-gray-100 font-bold text-lg"
                        >−</button>
                        <span className="w-9 h-9 flex items-center justify-center text-sm font-black text-slate-900 border-x border-gray-200">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-9 h-9 flex items-center justify-center text-gray-500 active:bg-gray-100 font-bold text-lg"
                        >+</button>
                      </div>
                      <div className="text-right">
                        {item.originalPrice > item.price && (
                          <p className="text-[10px] text-gray-300 line-through leading-none">{(item.originalPrice * item.qty).toLocaleString()}€</p>
                        )}
                        <p className="text-lg font-black text-orange-500 leading-tight">{(item.price * item.qty).toLocaleString()}€</p>
                      </div>
                    </div>
                  </div>

                  {/* Desktop table row */}
                  <div className={`hidden md:grid grid-cols-12 gap-2 items-center px-6 py-4 ${idx < cart.length - 1 ? "border-b border-gray-50" : ""}`}>
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
                      <Image src={decodeURIComponent(item.image)} alt={item.name} width={64} height={64} sizes="64px" className="object-contain p-1.5 w-full h-full" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">{item.name}</p>
                      <p className="text-xs text-orange-500 font-semibold mt-0.5 italic">
                        Livraison gratuite 24–48h
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-center">
                    <p className="text-sm font-bold text-slate-900">{item.price.toLocaleString()}€</p>
                    {item.originalPrice > item.price && (
                      <p className="text-xs text-gray-300 line-through">{item.originalPrice.toLocaleString()}€</p>
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
                    <p className="text-sm font-black text-orange-500">{(item.price * item.qty).toLocaleString()}€</p>
                  </div>
                  </div>

                </div>
              ))}

              {/* Promo code */}
              <div className="px-4 sm:px-6 py-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
                    </svg>
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => { setPromoCode(e.target.value); setPromoError(false); }}
                      placeholder="Code promo"
                      className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-xl focus:outline-none placeholder-gray-300 ${promoError ? 'border-red-300 bg-red-50' : promoApplied ? 'border-green-300 bg-green-50' : 'border-gray-200 focus:border-orange-400'}`}
                    />
                  </div>
                  <button
                    onClick={applyPromo}
                    className="shrink-0 bg-slate-900 active:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
                  >
                    Appliquer
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-xs text-green-600 font-bold flex items-center gap-1 mt-2">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Code ELECTRO10 appliqué — −10% !
                  </p>
                )}
                {promoError && (
                  <p className="text-xs text-red-500 font-bold mt-2">Code invalide. Essayez ELECTRO10</p>
                )}
              </div>
            </div>

            {/* RIGHT — Summary */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-[0_18px_44px_rgba(15,23,42,0.08)] border border-slate-200 overflow-hidden">
              <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h2 className="text-lg font-black text-slate-900">Récapitulatif</h2>
              </div>

              <div className="px-5 py-5 space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Sous-total ({cart.reduce((s, i) => s + i.qty, 0)} article{cart.reduce((s, i) => s + i.qty, 0) > 1 ? 's' : ''})</span>
                  <span className="font-bold text-slate-900">{subtotal.toLocaleString()}€</span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Réduction (10%)
                    </span>
                    <span className="font-bold text-green-600">−{promoDiscount.toLocaleString()}€</span>
                  </div>
                )}

                {/* Delivery - single option */}
                <div className={`flex items-center justify-between border rounded-xl px-3 py-2.5 ${deliveryFee > 0 ? "bg-gray-50 border-gray-100" : "bg-green-50 border-green-100"}`}>
                  <div className="flex items-center gap-2">
                    <svg className={`w-4 h-4 shrink-0 ${deliveryFee > 0 ? "text-gray-400" : "text-green-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                    <div>
                      <p className={`text-sm font-bold ${deliveryFee > 0 ? "text-slate-700" : "text-green-800"}`}>Livraison à domicile</p>
                      <p className={`text-[10px] ${deliveryFee > 0 ? "text-gray-400" : "text-green-600"}`}>Partout au Maroc · 24–48h</p>
                    </div>
                  </div>
                  <span className={`text-sm font-black ${deliveryFee > 0 ? "text-slate-900" : "text-green-600"}`}>
                    {deliveryFee > 0 ? `${deliveryFee.toLocaleString()}€` : "Gratuite"}
                  </span>
                </div>

                {/* Divider + Total */}
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="text-base font-black text-slate-900">Total</span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-orange-500 leading-none">{total.toLocaleString()}€</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{deliveryFee > 0 ? "TTC · Livraison incluse" : "TTC · Livraison gratuite"}</p>
                  </div>
                </div>

                {/* Checkout */}
                <Link
                  href="/commander"
                  className="flex items-center justify-center gap-2 w-full bg-slate-950 active:bg-orange-600 text-white font-black py-4 rounded-lg text-center transition-all text-sm tracking-wide shadow-[0_10px_22px_rgba(15,23,42,0.12)]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  Valider la commande
                </Link>

                <div className="flex items-center justify-center gap-3">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Paiement sécurisé
                  </p>
                  <span className="text-gray-200">·</span>
                  <p className="text-xs text-gray-400">Retours 14 jours</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
