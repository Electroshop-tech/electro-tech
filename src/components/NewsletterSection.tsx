"use client";

import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setAlreadyExists(data.alreadyExists ?? false);
      setSubmitted(true);
      setEmail("");
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-20 sm:py-28 bg-[#060a14] overflow-hidden">

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-orange-500/[0.10] blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full bg-blue-600/[0.08] blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.025] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "38px 38px" }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-6 bg-orange-500/10 border border-orange-500/25 rounded-full pl-1.5 pr-4 py-1.5">
          <span className="relative inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/20">
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-orange-400/60 animate-ping" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-orange-400" />
          </span>
          <p className="text-orange-300 text-[11px] font-black uppercase tracking-[0.18em]">Newsletter ElectroShop-Tech</p>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black text-white leading-[1.1] tracking-tight mb-4">
          Offres exclusives,{" "}
          <span className="bg-gradient-to-r from-orange-400 via-orange-300 to-amber-300 bg-clip-text text-transparent">
            directement chez vous
          </span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-10 max-w-md mx-auto">
          Rejoignez +&nbsp;40 abonnés — ventes flash, nouveautés &amp; promos exclusives en avant-première.
        </p>

        {/* Card */}
        <div className="group relative rounded-[1.35rem] p-px bg-gradient-to-br from-white/15 via-white/5 to-transparent shadow-[0_32px_80px_rgba(0,0,0,0.45)]">
          <div className="absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500 pointer-events-none" />
          <div className="relative bg-[#0b1120]/90 backdrop-blur-xl rounded-[1.3rem] px-7 py-8 sm:px-10 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-black text-white text-lg">{alreadyExists ? "Déjà inscrit !" : "Merci, vous êtes inscrit !"}</p>
                <p className="text-slate-400 text-sm">{alreadyExists ? "Cette adresse est déjà dans notre liste." : "Vous recevrez nos prochaines offres en priorité."}</p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Votre adresse e-mail"
                      required
                      className="w-full pl-10 pr-4 py-3.5 bg-white/[0.06] border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-orange-400/70 focus:ring-2 focus:ring-orange-400/20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="sm:w-auto w-full px-6 py-3.5 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold rounded-xl transition-all duration-300 shadow-[0_8px_24px_rgba(249,115,22,0.30)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.45)] hover:-translate-y-0.5 active:translate-y-0 text-sm whitespace-nowrap ring-1 ring-white/10"
                  >
                    {loading ? "Inscription…" : "S'abonner →"}
                  </button>
                </form>
                <p className="text-slate-500 text-xs mt-4 flex items-center justify-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Pas de spam
                  </span>
                  <span className="text-slate-700">·</span>
                  Désinscription en un clic
                  <span className="text-slate-700">·</span>
                  Données protégées
                </p>
              </>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
