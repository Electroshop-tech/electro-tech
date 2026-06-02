"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

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
      date: fmt(0),
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
  const [emailInput, setEmailInput] = useState("");
  const [searchMode, setSearchMode] = useState<"id" | "email">("id");
  const [trackedId, setTrackedId] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<{ status: "processing" | "shipped" | "delivered"; date: string; product: string; city: string } | null>(null);

  useEffect(() => {
    const urlId = searchParams.get("id");
    if (urlId) {
      setInputId(urlId);
      lookup(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lookup = async (id: string) => {
    const clean = id.trim().toUpperCase();
    setNotFound(false);
    setOrderData(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/track?id=${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data = await res.json();
        const statusMap: Record<string, "processing" | "shipped" | "delivered"> = {
          pending: "processing", confirmed: "processing",
          shipped: "shipped", delivered: "delivered", cancelled: "processing",
        };
        setTrackedId(clean);
        setOrderData({
          status: statusMap[data.status] ?? "processing",
          date: data.createdAt ?? new Date().toISOString(),
          product: data.items?.[0]?.productName ?? "Votre commande",
          city: data.city ?? "Maroc",
        });
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchMode === "email") {
      lookupByEmail(emailInput);
    } else {
      lookup(inputId);
    }
  };

  const lookupByEmail = async (email: string) => {
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    setNotFound(false);
    setOrderData(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/track?email=${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data = await res.json();
        const firstOrder = data.orders?.[0];
        if (firstOrder) {
          const statusMap: Record<string, "processing" | "shipped" | "delivered"> = {
            pending: "processing", confirmed: "processing",
            shipped: "shipped", delivered: "delivered", cancelled: "processing",
          };
          setTrackedId(firstOrder.id.slice(-6).toUpperCase());
          setOrderData({
            status: statusMap[firstOrder.status] ?? "processing",
            date: firstOrder.createdAt ?? new Date().toISOString(),
            product: "Votre commande",
            city: firstOrder.city ?? "Maroc",
          });
        } else {
          setNotFound(true);
        }
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const steps = orderData ? getSteps(orderData.status, orderData.date) : [];
  const currentStep = steps.find((s) => s.active) ?? steps.filter((s) => s.done).at(-1);

  return (
    <div className="min-h-screen bg-[#f5f7fb]">

      {/* Hero with embedded search */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 pt-10 sm:pt-16 pb-16 sm:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-black px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Suivi de livraison
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-4">
                Où est<br /><span className="text-orange-400">ma commande ?</span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-md">
                Entrez votre numéro de suivi pour connaître l&apos;état de votre livraison en temps réel.
              </p>
              <div className="flex flex-wrap gap-5">
                {[
                  { label: "Livraison gratuite", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" },
                  { label: "Suivi SMS inclus", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                  { label: "7j/7 disponible", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-2 text-slate-400 text-xs">
                    <svg className="w-4 h-4 text-orange-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={f.icon} /></svg>
                    {f.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — search card */}
            <div className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">

              {/* Card top strip */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <div>
                  <p className="text-white font-black text-sm leading-tight">Suivre ma commande</p>
                  <p className="text-orange-100 text-xs">Saisissez votre numéro de suivi</p>
                </div>
              </div>

              <div className="p-6">
                {/* Search mode toggle */}
                <div className="flex bg-slate-900 rounded-xl p-1 mb-4">
                  <button type="button" onClick={() => setSearchMode("id")} className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${searchMode === "id" ? "bg-orange-500 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                    Par numéro
                  </button>
                  <button type="button" onClick={() => setSearchMode("email")} className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${searchMode === "email" ? "bg-orange-500 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                    Par email
                  </button>
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="mb-5">
                  {searchMode === "id" ? (
                    <>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
                        Numéro de commande
                      </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-orange-400 select-none">ET-</span>
                      <input
                        value={inputId}
                        onChange={(e) => setInputId(e.target.value)}
                        placeholder="482935"
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-white placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all uppercase tracking-wider"
                        maxLength={9}
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={inputId.trim().length < 3 || loading}
                      className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-40 text-white font-black px-5 rounded-xl text-sm transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-orange-500/40"
                    >
                      {loading ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <>
                          Suivre
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </>
                      )}
                    </button>
                  </div>
                    </>
                  ) : (
                    <>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
                        Adresse email
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="votre@email.com"
                          className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                          autoComplete="email"
                        />
                        <button
                          type="submit"
                          disabled={!emailInput.includes("@") || loading}
                          className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-40 text-white font-black px-5 rounded-xl text-sm transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-orange-500/40"
                        >
                          {loading ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <>
                              Chercher
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                  {notFound && (
                    <div className="flex items-center gap-2 mt-3 bg-red-900/50 border border-red-500/40 rounded-xl px-3 py-2.5">
                      <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-xs text-red-300 font-semibold">{searchMode === "email" ? "Aucune commande trouvée pour cet email" : "Commande introuvable — vérifiez le numéro"}</p>
                    </div>
                  )}
                </form>

                {/* Divider */}
                <div className="border-t border-slate-700 mb-5" />

                {/* Steps */}
                <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-3">Étapes de livraison</p>
                <div className="relative flex items-start justify-between">
                  {/* Connecting line */}
                  <div className="absolute top-5 left-[calc(16.67%)] right-[calc(16.67%)] h-px bg-gradient-to-r from-green-500/60 via-blue-500/60 to-orange-500/60" />
                  {[
                    { n: "1", label: "Confirmée", sub: "Reçue", bg: "bg-green-500", ring: "ring-green-500/40", icon: "M5 13l4 4L19 7" },
                    { n: "2", label: "En route", sub: "Expédiée", bg: "bg-blue-500", ring: "ring-blue-500/40", icon: "M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" },
                    { n: "3", label: "Livraison", sub: "À domicile", bg: "bg-orange-500", ring: "ring-orange-500/40", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
                  ].map((s) => (
                    <div key={s.n} className="relative flex flex-col items-center gap-2 flex-1">
                      <div className={`w-10 h-10 rounded-full ${s.bg} ring-4 ${s.ring} flex items-center justify-center shadow-lg z-10`}>
                        <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-black text-white leading-tight">{s.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
        <div className="relative h-10 overflow-hidden">
          <svg viewBox="0 0 1440 40" className="absolute bottom-0 w-full" fill="#f5f7fb" preserveAspectRatio="none">
            <path d="M0,40 C360,0 1080,40 1440,0 L1440,40 Z" />
          </svg>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">

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
                <p className="text-base font-black text-white leading-tight">{currentStep?.label ?? "En cours"}</p>
                <p className="text-[11px] text-white/80 mt-0.5">{currentStep?.sub}</p>
              </div>
              {orderData.status !== "delivered" && <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />}
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
                          ? step.active ? "bg-orange-500 shadow-sm shadow-orange-200" : "bg-green-500 shadow-sm shadow-green-200"
                          : "bg-gray-100 border-2 border-gray-200"
                      }`}>
                        {step.done ? (
                          step.active ? <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" /> :
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        ) : <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
                      </div>
                      {i < steps.length - 1 && <div className={`w-0.5 flex-1 my-1 ${step.done ? "bg-green-200" : "bg-gray-100"}`} style={{ minHeight: "32px" }} />}
                    </div>
                    <div className={`pb-5 flex-1 ${i === steps.length - 1 ? "pb-0" : ""}`}>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-black leading-none ${step.done ? "text-slate-900" : "text-gray-300"}`}>{step.label}</p>
                        {step.date && <span className="text-[10px] text-gray-400 font-semibold">{step.date}</span>}
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

            {/* Help */}
            <div className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Besoin d&apos;aide ?</p>
                <p className="text-[11px] text-gray-400">Notre équipe est disponible 7j/7 pour vous assister</p>
              </div>
              <Link href="/contact" className="ml-auto shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-3 py-2 rounded-xl transition-colors">
                Contacter
              </Link>
            </div>
          </>
        )}

        {/* Empty state */}
        {!orderData && !notFound && (
          <div className="bg-white rounded-2xl shadow-sm px-5 py-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 mb-1">Où trouver mon numéro ?</p>
              <p className="text-xs text-gray-400 leading-relaxed">Votre numéro de suivi au format <span className="font-bold text-orange-500">ET-XXXXXX</span> figure dans l&apos;email de confirmation reçu après votre commande.</p>
              <Link href="/commander/confirmation" className="inline-flex items-center gap-1 text-xs text-orange-500 font-bold mt-2 hover:underline">
                Voir ma dernière commande
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
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
