"use client";

import { useState } from "react";
import Link from "next/link";

export default function SuiviCommandePage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (orderId.trim() && email.trim()) setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-white">

      {/* HERO */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 pt-20 pb-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div className="pb-20">
              <div className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-black px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Suivi en temps reel
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5">
                Suivi de<br />
                <span className="text-orange-400">commande</span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed max-w-md">
                Entrez votre numero de commande et votre email pour suivre votre livraison.
              </p>
            </div>

          </div>
        </div>
        <div className="relative h-16 overflow-hidden">
          <svg viewBox="0 0 1440 64" className="absolute bottom-0 w-full" fill="white" preserveAspectRatio="none">
            <path d="M0,64 C360,0 1080,64 1440,0 L1440,64 Z" />
          </svg>
        </div>
      </section>

      {/* FORM */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {!submitted ? (
              <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-8">
                <h2 className="text-xl font-black text-slate-900 mb-6">Suivre ma commande</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Numero de commande</label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="Ex: ESH-2024-001234"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
                      required
                    />
                    <p className="text-slate-400 text-xs mt-1.5">Disponible dans votre email de confirmation de commande.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Adresse email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-3 rounded-xl transition-colors shadow-lg shadow-orange-500/25 text-sm">
                    Suivre ma commande &rarr;
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Recherche en cours&hellip;</h2>
                <p className="text-slate-500 text-sm mb-1">Commande : <span className="font-bold text-slate-900">{orderId}</span></p>
                <p className="text-slate-400 text-xs mb-6">Email : {email}</p>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-left mb-6">
                  <p className="text-orange-700 text-sm font-bold">Suivi en cours d&rsquo;integration</p>
                  <p className="text-orange-600 text-xs mt-1 leading-relaxed">Le suivi automatise sera disponible prochainement. Contactez-nous pour obtenir des informations sur votre livraison.</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { setSubmitted(false); setOrderId(""); setEmail(""); }} className="border border-slate-200 text-slate-600 font-bold text-xs px-4 py-2.5 rounded-xl hover:border-slate-300 transition-colors">
                    Nouvelle recherche
                  </button>
                  <Link href="/contact" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors">
                    Contacter le support
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">Votre numero de suivi</p>
              <p className="text-slate-400 text-xs leading-relaxed">Un numero de suivi transporteur vous est envoye par email et SMS des l&rsquo;expedition de votre colis.</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6">
              <p className="text-white font-black text-sm mb-1">Besoin d&rsquo;aide ?</p>
              <p className="text-orange-100 text-xs mb-4 leading-relaxed">Notre equipe repond a toutes vos questions sur votre livraison.</p>
              <Link href="/contact" className="block text-center bg-white text-orange-500 font-black text-xs px-4 py-2.5 rounded-xl hover:bg-orange-50 transition-colors">
                Nous contacter &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
