"use client";

import { useState } from "react";
import Image from "next/image";

const avatars = [
  { src: "https://i.pravatar.cc/40?img=5",  alt: "Client 1" },
  { src: "https://i.pravatar.cc/40?img=25", alt: "Client 2" },
  { src: "https://i.pravatar.cc/40?img=61", alt: "Client 3" },
  { src: "https://i.pravatar.cc/40?img=48", alt: "Client 4" },
];

const benefits = [
  "Ventes flash & promotions exclusives en avant-première",
  "Nouveautés box Android TV dès leur arrivée en stock",
  "Conseils d'experts et guides d'installation gratuits",
];

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
    <section className="relative py-16 sm:py-20 bg-[#060a14] overflow-hidden">

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-[10%] -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-[100px]" />
        <div className="absolute top-1/3 right-[5%] w-[380px] h-[380px] rounded-full bg-blue-600/8 blur-[80px]" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── Left: copy & benefits ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-6 bg-orange-500 rounded-full" />
              <p className="text-orange-400 text-xs font-black uppercase tracking-widest">Newsletter ElectroShop-Tech</p>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-[1.1] tracking-tight mb-4">
              Offres exclusives,<br />
              <span className="text-orange-400">directement chez vous</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-7 max-w-sm">
              Rejoignez +&nbsp;40 abonnés et recevez en avant‑première ventes flash, nouveautés et promotions spéciales.
            </p>
            <ul className="space-y-3.5">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-slate-300 text-sm">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            {/* Trust line */}
            <div className="flex items-center gap-2 mt-8">
              <div className="flex -space-x-2">
                {avatars.map((av, i) => (
                  <Image
                    key={i}
                    src={av.src}
                    alt={av.alt}
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full border-2 border-[#060a14] object-cover"
                  />
                ))}
              </div>
              <p className="text-slate-500 text-xs">
                <span className="text-white font-bold">+40</span> abonnés satisfaits
              </p>
            </div>
          </div>

          {/* ── Right: form card ── */}
          <div className="bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl p-7 sm:p-9 shadow-[0_32px_80px_rgba(0,0,0,0.4)]">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 mb-5">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
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
                <h3 className="text-white font-black text-xl mb-1.5">Inscription gratuite</h3>
                <p className="text-slate-400 text-sm mb-6">Ventes flash, nouveautés &amp; promos exclusives — sans spam</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre adresse e-mail *"
                    required
                    className="w-full px-4 py-3.5 bg-white/8 border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-orange-400/70 focus:ring-2 focus:ring-orange-400/20 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 disabled:bg-slate-600 text-white font-bold rounded-xl transition-all duration-200 shadow-[0_12px_28px_rgba(249,115,22,0.28)] hover:shadow-[0_16px_36px_rgba(249,115,22,0.38)] hover:-translate-y-0.5 active:translate-y-0 text-sm"
                  >
                    {loading ? "Inscription…" : "Recevoir les offres exclusives →"}
                  </button>
                </form>
                <p className="text-slate-600 text-xs mt-4 text-center">
                  Pas de spam · Désinscription en un clic · Données protégées
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
