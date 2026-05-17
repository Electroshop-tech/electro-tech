"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const DEMO_ORDERS: Record<string, {
  status: "processing" | "shipped" | "delivered";
  date: string;
  product: string;
  city: string;
}> = {};

type TrackingStep = {
  key: string;
  label: string;
  sub: string;
  date?: string;
  done: boolean;
  active: boolean;
};

function getSteps(status: "processing" | "shipped" | "delivered", date: string): TrackingStep[] {
  const d = new Date(date);
  const fmt = (offset: number) => {
    const dt = new Date(d);
    dt.setDate(dt.getDate() + offset);
    return dt.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };
  return [
    {
      key: "confirmed",
      label: "Commande reçue",
      sub: "Votre commande a été enregistrée",
      date: fmt(0),
      done: true,
      active: false,
    },
    {
      key: "processing",
      label: "En préparation",
      sub: "Notre équipe prépare votre colis",
      date: status !== "confirmed" ? fmt(0) : undefined,
      done: ["processing", "shipped", "delivered"].includes(status),
      active: status === "processing",
    },
    {
      key: "shipped",
      label: "Expédiée",
      sub: "Colis remis au transporteur",
      date: ["shipped", "delivered"].includes(status) ? fmt(1) : undefined,
      done: ["shipped", "delivered"].includes(status),
      active: status === "shipped",
    },
    {
      key: "delivered",
      label: "Livrée",
      sub: "Livraison à domicile · Paiement à la réception",
      date: status === "delivered" ? fmt(2) : undefined,
      done: status === "delivered",
      active: status === "delivered",
    },
  ];
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const [inputId, setInputId] = useState("");
  const [trackedId, setTrackedId] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [orderData, setOrderData] = useState<{ status: "processing" | "shipped" | "delivered"; date: string; product: string; city: string } | null>(null);

  useEffect(() => {
    const urlId = searchParams.get("id");
    if (urlId) {
      setInputId(urlId);
      lookup(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lookup = (id: string) => {
    const clean = id.trim().toUpperCase();
    setNotFound(false);
    setOrderData(null);

    // Check demo orders or localStorage last order
    const lastId = typeof window !== "undefined" ? localStorage.getItem("last-order-id") : null;

    if (DEMO_ORDERS[clean]) {
      setTrackedId(clean);
      setOrderData(DEMO_ORDERS[clean]);
    } else if (lastId && clean === lastId.toUpperCase()) {
      setTrackedId(clean);
      setOrderData({
        status: "processing",
        date: new Date().toISOString(),
        product: "Votre commande récente",
        city: "Maroc",
      });
    } else if (/^ET-\d{6}$/.test(clean)) {
      // Any valid format → show demo data
      setTrackedId(clean);
      setOrderData({
        status: "processing",
        date: new Date().toISOString(),
        product: "Commande ElectroShop",
        city: "Maroc",
      });
    } else {
      setNotFound(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookup(inputId);
  };

  const steps = orderData ? getSteps(orderData.status, orderData.date) : [];
  const currentStep = steps.find((s) => s.active) ?? steps.filter((s) => s.done).at(-1);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900">Suivi de commande</h1>
              <p className="text-[11px] text-gray-400">Entrez votre numéro pour suivre votre livraison</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Search form */}
        <div className="bg-white rounded-2xl shadow-sm px-5 py-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Numéro de suivi</p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-orange-400 select-none">ET-</span>
              <input
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                placeholder="ex: ET-482935"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm font-bold text-slate-800 placeholder-gray-300 outline-none focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors uppercase"
                maxLength={9}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <button
              type="submit"
              disabled={inputId.trim().length < 3}
              className="bg-orange-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black px-5 rounded-xl text-sm transition-colors"
            >
              Suivre
            </button>
          </form>
          {notFound && (
            <div className="flex items-center gap-2 mt-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-red-600 font-semibold">Commande introuvable. Vérifiez le numéro (format: ET-XXXXXX)</p>
            </div>
          )}
        </div>

        {/* Result */}
        {orderData && (
          <>
            {/* Status banner */}
            <div className={`rounded-2xl px-5 py-4 flex items-center gap-4 ${
              orderData.status === "delivered"
                ? "bg-green-500"
                : "bg-gradient-to-r from-orange-500 to-amber-500"
            }`}>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                {orderData.status === "delivered" ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/70 font-semibold">{trackedId}</p>
                <p className="text-base font-black text-white leading-tight">
                  {currentStep?.label ?? "En cours"}
                </p>
                <p className="text-[11px] text-white/80 mt-0.5">{currentStep?.sub}</p>
              </div>
              {orderData.status !== "delivered" && (
                <div className="flex flex-col items-center shrink-0">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-sm px-5 py-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Historique</p>
              <div className="space-y-0">
                {steps.map((step, i) => (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                        step.done
                          ? step.active
                            ? "bg-orange-500 shadow-sm shadow-orange-200"
                            : "bg-green-500 shadow-sm shadow-green-200"
                          : "bg-gray-100 border-2 border-gray-200"
                      }`}>
                        {step.done ? (
                          step.active ? (
                            <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                          ) : (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          )
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                        )}
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`w-0.5 flex-1 my-1 ${step.done ? "bg-green-200" : "bg-gray-100"}`} style={{ minHeight: "32px" }} />
                      )}
                    </div>
                    <div className={`pb-5 flex-1 ${i === steps.length - 1 ? "pb-0" : ""}`}>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-black leading-none ${step.done ? "text-slate-900" : "text-gray-300"}`}>
                          {step.label}
                        </p>
                        {step.date && (
                          <span className="text-[10px] text-gray-400 font-semibold">{step.date}</span>
                        )}
                      </div>
                      <p className={`text-[11px] mt-0.5 ${step.done ? "text-gray-400" : "text-gray-300"}`}>{step.sub}</p>
                      {step.active && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                          Étape actuelle
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery info */}
            <div className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Besoin d&apos;aide ?</p>
                <p className="text-[11px] text-gray-400">Notre équipe est disponible 7j/7 pour vous assister</p>
              </div>
              <Link href="/contact" className="ml-auto shrink-0 bg-orange-500 text-white text-xs font-black px-3 py-2 rounded-xl">
                Contacter
              </Link>
            </div>
          </>
        )}

        {/* Empty state */}
        {!orderData && !notFound && (
          <div className="bg-white rounded-2xl shadow-sm px-5 py-10 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm font-black text-slate-900">Entrez votre numéro de suivi</p>
            <p className="text-[11px] text-gray-400 max-w-[220px]">Vous trouverez votre numéro sur la page de confirmation de commande</p>
            <Link href="/commander/confirmation" className="text-xs text-orange-500 font-bold mt-1">
              Voir ma dernière commande →
            </Link>
          </div>
        )}

        <Link href="/produits" className="flex items-center justify-center gap-2 text-xs text-gray-400 font-semibold py-2 pb-6">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à la boutique
        </Link>

      </div>
    </div>
  );
}

export default function SuiviCommandePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" /></div>}>
      <TrackingContent />
    </Suspense>
  );
}
