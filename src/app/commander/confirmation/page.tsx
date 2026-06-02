"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  qty: number;
  brand?: string;
}

interface OrderData {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  promoLabel: string | null;
  total: number;
  customer: { firstName: string; lastName: string; city: string; phone: string };
  payment: string;
  date: string;
}

const today = new Date();
const fmt = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

const STEPS = [
  { key: "confirmed", label: "Commande reçue", sub: "Votre commande a été enregistrée avec succès", done: true, date: fmt(0) },
  { key: "processing", label: "En préparation", sub: "Notre équipe prépare votre colis", done: true, date: fmt(0) },
  { key: "shipped", label: "Expédiée", sub: "En route vers vous · Délai estimé 24–48h", done: false, date: `Prévu ${fmt(1)}` },
  { key: "delivered", label: "Livrée", sub: "Livraison à domicile · Paiement à la réception", done: false, date: `Prévu ${fmt(2)}` },
];

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get("id");

    // Try loading from DB first
    if (orderId) {
      fetch(`/api/orders/${encodeURIComponent(orderId)}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) {
            setOrder({
              id: data.id,
              items: data.items.map((i: { name: string; image: string; price: number; qty: number; brand?: string }, idx: number) => ({ id: idx, ...i })),
              subtotal: data.subtotal,
              discount: data.promoDiscount ?? 0,
              promoLabel: data.promoCode ?? null,
              total: data.total,
              customer: { firstName: data.customerFirstName, lastName: data.customerLastName, city: data.city ?? "", phone: data.phone ?? "" },
              payment: data.paymentMethod === "cash_on_delivery" ? "cod" : "cmi",
              date: data.createdAt ?? new Date().toISOString(),
            });
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      // Fallback to localStorage for backward compatibility
      const raw = localStorage.getItem("last-order-data");
      if (raw) {
        try { setOrder(JSON.parse(raw)); } catch { /* ignore */ }
      }
      setLoading(false);
    }
  }, [searchParams]);

  const orderId = order?.id ?? "";

  const copy = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Steps bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-start">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-md shadow-green-200">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Panier</span>
            </div>
            <div className="flex-1 h-0.5 bg-green-300 mt-4 mx-2" />
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-md shadow-green-200">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Commander</span>
            </div>
            <div className="flex-1 h-0.5 bg-green-300 mt-4 mx-2" />
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-md shadow-green-200">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-[10px] font-black text-green-500 uppercase tracking-wider">Terminé</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">

        {/* Success header card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-6 py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-white">
              Merci{order ? `, ${order.customer.firstName}` : ""}&nbsp;! 🎉
            </h1>
            <p className="text-sm text-white/80 mt-1">Votre commande a été confirmée avec succès</p>
          </div>

          {/* Order number */}
          <div className="px-6 py-5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Numéro de suivi</p>
            <div className="flex items-center gap-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl px-4 py-3">
              <span className="flex-1 text-xl font-black text-slate-900 tracking-widest">{orderId || "…"}</span>
              <button
                onClick={copy}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  copied ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                }`}
              >
                {copied ? (
                  <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Copié !</>
                ) : (
                  <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copier</>
                )}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Conservez ce numéro pour suivre votre commande</p>
          </div>
        </div>

        {/* Order summary (shown only when data available) */}
        {order && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <p className="text-sm font-black text-slate-900">Récapitulatif de commande</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <Image src={item.image} alt={item.name} width={44} height={44} sizes="44px" className="w-11 h-11 object-contain rounded-lg bg-gray-50 border border-gray-100" />
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{item.qty}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-tight line-clamp-2">{item.name}</p>
                    {item.brand && <p className="text-[10px] text-gray-400">{item.brand}</p>}
                  </div>
                  <p className="text-sm font-black text-slate-900 shrink-0">{(item.price * item.qty).toLocaleString()}€</p>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Sous-total</span>
                  <span className="font-semibold text-slate-700">{order.subtotal.toLocaleString()}€</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-600 font-semibold">{order.promoLabel ?? "Code promo"}</span>
                    <span className="font-bold text-green-600">-{order.discount.toLocaleString()}€</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Livraison</span>
                  <span className="font-bold text-green-600">Gratuite</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="font-black text-slate-900">Total</span>
                  <span className="text-base font-black text-orange-500">{order.total.toLocaleString()}€</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 space-y-1 text-xs text-gray-600 mt-2">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span>{order.customer.firstName} {order.customer.lastName} · {order.customer.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span>{order.customer.phone} · {order.payment === "cod" ? "Paiement à la livraison" : "Carte bancaire"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order timeline */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-black text-slate-900">Statut de la commande</p>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black bg-orange-500 text-white px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                En cours
              </span>
            </div>
            <p className="text-[11px] text-gray-400">2 étapes sur 4 complétées</p>

            {/* Single gradient progress bar */}
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-green-400 via-green-400 to-orange-400" />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[9px] text-green-500 font-bold">Commande reçue</span>
              <span className="text-[9px] text-gray-300 font-bold">Livrée</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-50 mx-5" />

          {/* Steps */}
          <div className="px-5 py-4 space-y-0">
            {STEPS.map((step, i) => (
              <div key={step.key} className="flex gap-3">
                {/* Left column: icon + connector */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    step.done
                      ? i === 1
                        ? "bg-orange-500 shadow-md shadow-orange-200"
                        : "bg-green-500 shadow-md shadow-green-200"
                      : "bg-gray-50 border border-dashed border-gray-200"
                  }`}>
                    {i === 0 && <svg className={`w-4 h-4 ${step.done ? "text-white" : "text-gray-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                    {i === 1 && <svg className={`w-4 h-4 ${step.done ? "text-white" : "text-gray-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                    {i === 2 && <svg className={`w-4 h-4 ${step.done ? "text-white" : "text-gray-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>}
                    {i === 3 && <svg className={`w-4 h-4 ${step.done ? "text-white" : "text-gray-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-px flex-1 my-1.5 ${
                      i === 0 ? "bg-green-200" : i === 1 ? "border-r border-dashed border-orange-200" : "border-r border-dashed border-gray-200"
                    }`} style={{ minHeight: "20px" }} />
                  )}
                </div>

                {/* Right column: content */}
                <div className={`flex-1 pb-4 ${i === STEPS.length - 1 ? "pb-1" : ""}`}>
                  <div className={`rounded-xl px-3 py-2.5 ${i === 1 ? "bg-orange-50 border border-orange-100" : ""}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[13px] font-black leading-none ${step.done ? "text-slate-900" : "text-gray-300"}`}>{step.label}</p>
                      <span className={`text-[10px] font-bold shrink-0 px-2 py-0.5 rounded-lg ${
                        step.done
                          ? i === 1 ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}>{step.date}</span>
                    </div>
                    <p className={`text-[11px] mt-1 ${step.done ? "text-gray-500" : "text-gray-300"}`}>{step.sub}</p>
                    {i === 1 && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shrink-0" />
                        <span className="text-[10px] font-black text-orange-600">Étape actuelle</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Estimated delivery footer */}
          <div className="mx-4 mb-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-semibold">Livraison estimée</p>
              <p className="text-sm font-black text-slate-900">{STEPS[3].date?.replace("Prévu ", "")}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] text-gray-400">Délai</p>
              <p className="text-xs font-black text-orange-600">24–48h</p>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50 overflow-hidden">
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">Confirmation téléphonique</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Notre équipe vous appelle sous 24h pour confirmer</p>
            </div>
            <span className="ml-auto text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-lg shrink-0">Sous 24h</span>
          </div>
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">Livraison à domicile gratuite</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Partout au Maroc · Paiement à la réception</p>
            </div>
            <span className="ml-auto text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg shrink-0">24–48h</span>
          </div>
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">Garantie satisfaction</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Retours acceptés sous 7 jours si défaut</p>
            </div>
            <span className="ml-auto text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-lg shrink-0">7 jours</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 pb-6">
          <Link
            href={`/suivi-commande?id=${orderId}`}
            className="flex items-center justify-center gap-2 w-full bg-orange-500 text-white font-black py-4 rounded-2xl text-sm shadow-lg shadow-orange-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Suivre ma commande
          </Link>
          <Link
            href="/produits"
            className="flex items-center justify-center gap-2 w-full border-2 border-gray-100 bg-white text-slate-600 font-bold py-3.5 rounded-2xl text-sm"
          >
            Continuer mes achats
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center"><div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
