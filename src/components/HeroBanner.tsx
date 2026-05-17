"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

const SLIDES = [
  {
    id: 0,
    image: "/images/3D hero section/box tv.png",
    alt: "Android TV Box X96Q",
    badge: "Meilleure Vente",
    badgeBg: "bg-orange-500",
    model: "X96Q — 2 Go / 16 Go",
    title: "Android TV\nBox X96Q",
    features: [
      "Allwinner H313 Quad-Core — Android 10",
      "4K Ultra HD H.265/HEVC — RAM 2 Go DDR3",
      "Wi-Fi 2.4 GHz + Ethernet 100 Mbps",
    ],
    price: 55,
    oldPrice: 70,
    href: "/produits/android-tv-box-x96q",
    glow: "rgba(249,115,22,0.38)",
    glow2: "rgba(234,88,12,0.2)",
    rating: 4.8,
    reviews: 47,
  },
  {
    id: 1,
    image: "/images/3D hero section/box tv usb.png",
    alt: "Android TV Stick Mortal Q8",
    badge: "Nouveau",
    badgeBg: "bg-indigo-500",
    model: "Mortal Q8 — TV Stick",
    title: "TV Stick\nMortal Q8",
    features: [
      "Branchez sur HDMI — transformez votre TV",
      "Wi-Fi intégré — Android prêt à l'emploi",
      "Format pocket ultra-compact",
    ],
    price: 60,
    oldPrice: 79,
    href: "/produits/android-tv-stick-mortal-q8",
    glow: "rgba(99,102,241,0.38)",
    glow2: "rgba(139,92,246,0.2)",
    rating: 4.6,
    reviews: 28,
  },
];

const TRANSITION_MS = 700;
const AUTO_PLAY_MS = 5000;

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState<number | null>(null);
  const [dir, setDir] = useState<"right" | "left">("right");
  const [busy, setBusy] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slide = SLIDES[current % SLIDES.length];
  const discount = Math.round((1 - slide.price / slide.oldPrice) * 100);
  const savings = slide.oldPrice - slide.price;

  const goTo = useCallback((next: number, direction: "right" | "left") => {
    if (busy || next === current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setBusy(true);
    setExiting(current);
    setDir(direction);
    setCurrent(next);
    setTimeout(() => { setExiting(null); setBusy(false); }, TRANSITION_MS);
  }, [busy, current]);

  const goNext = useCallback(() => goTo((current + 1) % SLIDES.length, "right"), [current, goTo]);
  const goPrev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length, "left"), [current, goTo]);

  useEffect(() => {
    timerRef.current = setTimeout(goNext, AUTO_PLAY_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [goNext]);

  return (
    <>
      <style>{`
        @keyframes heroFloat {
          0%   { transform: perspective(1000px) translateY(0px)   rotateX(0deg)  rotateY(0deg)  scale(1);    filter: drop-shadow(0 30px 60px rgba(0,0,0,0.55)); }
          25%  { transform: perspective(1000px) translateY(-20px) rotateX(6deg)  rotateY(-6deg) scale(1.03); filter: drop-shadow(0 45px 75px rgba(0,0,0,0.65)); }
          50%  { transform: perspective(1000px) translateY(-32px) rotateX(9deg)  rotateY(0deg)  scale(1.05); filter: drop-shadow(0 55px 90px rgba(0,0,0,0.7)); }
          75%  { transform: perspective(1000px) translateY(-20px) rotateX(6deg)  rotateY(6deg)  scale(1.03); filter: drop-shadow(0 45px 75px rgba(0,0,0,0.65)); }
          100% { transform: perspective(1000px) translateY(0px)   rotateX(0deg)  rotateY(0deg)  scale(1);    filter: drop-shadow(0 30px 60px rgba(0,0,0,0.55)); }
        }
        @keyframes magic3dEnterRight {
          0%   { opacity:0;    transform:perspective(1000px) rotateY(80deg)  scale(0.58) translateZ(-320px); filter:brightness(0.15); }
          50%  { opacity:0.65; transform:perspective(1000px) rotateY(18deg)  scale(0.92) translateZ(-30px);  filter:brightness(0.85); }
          100% { opacity:1;    transform:perspective(1000px) rotateY(0deg)   scale(1)    translateZ(0);      filter:brightness(1); }
        }
        @keyframes magic3dEnterLeft {
          0%   { opacity:0;    transform:perspective(1000px) rotateY(-80deg) scale(0.58) translateZ(-320px); filter:brightness(0.15); }
          50%  { opacity:0.65; transform:perspective(1000px) rotateY(-18deg) scale(0.92) translateZ(-30px);  filter:brightness(0.85); }
          100% { opacity:1;    transform:perspective(1000px) rotateY(0deg)   scale(1)    translateZ(0);      filter:brightness(1); }
        }
        @keyframes magic3dExitLeft {
          0%   { opacity:1;   transform:perspective(1000px) rotateY(0deg)   scale(1)    translateZ(0);      filter:brightness(1); }
          50%  { opacity:0.4; transform:perspective(1000px) rotateY(-48deg) scale(0.75) translateZ(-200px); filter:brightness(0.45); }
          100% { opacity:0;   transform:perspective(1000px) rotateY(-80deg) scale(0.52) translateZ(-400px); filter:brightness(0.1); }
        }
        @keyframes magic3dExitRight {
          0%   { opacity:1;   transform:perspective(1000px) rotateY(0deg)  scale(1)    translateZ(0);      filter:brightness(1); }
          50%  { opacity:0.4; transform:perspective(1000px) rotateY(48deg) scale(0.75) translateZ(-200px); filter:brightness(0.45); }
          100% { opacity:0;   transform:perspective(1000px) rotateY(80deg) scale(0.52) translateZ(-400px); filter:brightness(0.1); }
        }
        @keyframes textSlideIn {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes blobPulse { 0%,100%{opacity:.5;transform:scale(1);}50%{opacity:.9;transform:scale(1.2);} }
        @keyframes ringPulse { 0%,100%{transform:scale(.85);opacity:.6;}50%{transform:scale(1.14);opacity:.18;} }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .hero-float       { animation: heroFloat 7s ease-in-out infinite; will-change:transform,filter; }
        .hero-enter-right { animation: magic3dEnterRight 700ms cubic-bezier(.22,1,.36,1) both; }
        .hero-enter-left  { animation: magic3dEnterLeft  700ms cubic-bezier(.22,1,.36,1) both; }
        .hero-exit-left   { animation: magic3dExitLeft   700ms cubic-bezier(.55,0,1,.45) both; pointer-events:none; }
        .hero-exit-right  { animation: magic3dExitRight  700ms cubic-bezier(.55,0,1,.45) both; pointer-events:none; }
        .hero-text        { animation: textSlideIn 0.55s cubic-bezier(.22,1,.36,1) both; }
        .blob-a { animation: blobPulse 6s ease-in-out infinite; }
        .blob-b { animation: blobPulse 6s ease-in-out 3s infinite; }
        .ring-a { animation: ringPulse 3.5s ease-in-out infinite; }
        .ring-b { animation: ringPulse 3.5s ease-in-out 1.75s infinite; }
        .price-shimmer {
          background: linear-gradient(90deg, #fb923c 0%, #fdba74 40%, #fb923c 60%, #fdba74 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        @keyframes progressFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>

      <section className="bg-slate-950 border-b border-white/5 overflow-hidden select-none">
        <div className="relative h-auto lg:h-[640px]">

          {/* Glow blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="blob-a absolute top-1/2 right-1/4 -translate-y-1/2 w-[580px] h-[580px] rounded-full blur-3xl transition-[background] duration-1000" style={{ background: slide.glow }} />
            <div className="blob-b absolute top-1/3 right-1/3 w-[340px] h-[340px] rounded-full blur-3xl transition-[background] duration-1000" style={{ background: slide.glow2 }} />
            <div className="ring-a absolute top-1/2 right-1/4 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-white/[0.07]" />
            <div className="ring-b absolute top-1/2 right-1/4 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/[0.04]" />
          </div>

          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.028] pointer-events-none" style={{ backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)", backgroundSize:"44px 44px" }} />

          {/* Two-column layout */}
          <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 grid lg:grid-cols-2 items-center gap-4 sm:gap-6 lg:gap-8 pt-6 pb-20 sm:pt-10 sm:pb-28 lg:pt-0 lg:pb-20">

            {/* ── Left: Rich text ── */}
            <div key={`text-${current}`} className="hero-text flex flex-col gap-3 sm:gap-4 order-2 lg:order-1">

              {/* Badge row */}
              <div className="hidden sm:flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider text-white ${slide.badgeBg}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                  {slide.badge}
                </span>
                <span className="text-white/35 text-xs">•</span>
                <span className="text-white/40 text-xs font-medium tracking-widest uppercase">{slide.model}</span>
              </div>

              {/* Title — multiline with leading word styled */}
              <h1 className="text-3xl sm:text-4xl xl:text-6xl font-black text-white leading-[1.05] tracking-tight whitespace-pre-line">
                {slide.title}
              </h1>

              {/* Star rating */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className={`w-4 h-4 ${i <= Math.round(slide.rating) ? "text-amber-400" : "text-white/20"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-amber-400 text-sm font-semibold">{slide.rating}</span>
                <span className="text-white/35 text-sm">({slide.reviews} avis)</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-emerald-400 text-xs font-semibold">En stock</span>
              </div>

              {/* Feature bullets */}
              <ul className="hidden sm:flex flex-col gap-2 mt-1">
                {slide.features.map((f, i) => (
                  <li key={i} className={`flex items-start gap-2.5 text-white/65 text-sm leading-snug${i >= 2 ? " hidden sm:flex" : ""}`}>
                    <svg className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Price block */}
              <div className="flex items-center gap-3 mt-1">
                <span className="price-shimmer text-4xl font-black">{slide.price}€</span>
                <div className="flex flex-col">
                  <span className="text-sm text-white/30 line-through leading-none">{slide.oldPrice}€</span>
                  <span className="text-xs font-bold text-emerald-400 mt-0.5">Vous economisez {savings}€</span>
                </div>
                <span className="bg-emerald-500/15 text-emerald-400 text-xs font-black px-2.5 py-1 rounded-lg border border-emerald-500/25">
                  -{discount}%
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={slide.href}
                  className="inline-flex sm:inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-7 py-3.5 rounded-2xl transition-all duration-200 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 active:translate-y-0 text-sm w-full sm:w-auto justify-center"
                >
                  Voir le produit
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/produits"
                  className="hidden sm:inline-flex items-center gap-2 text-white/55 hover:text-white text-sm font-medium px-5 py-3.5 rounded-2xl border border-white/10 hover:border-white/25 transition-all duration-200"
                >
                  Explorer la gamme
                </Link>
              </div>

              {/* Trust badges */}
              <div className="hidden sm:flex flex-wrap gap-4 pt-1 border-t border-white/[0.07]">
                {[
                  { icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4", label: "Livraison 24-48h" },
                  { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Garantie 1 an" },
                  { icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6", label: "Retour 30 jours" },
                ].map((t) => (
                  <div key={t.label} className="flex items-center gap-1.5 text-white/40 text-xs">
                    <svg className="w-3.5 h-3.5 text-orange-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} />
                    </svg>
                    {t.label}
                  </div>
                ))}
              </div>

            </div>

            {/* ── Right: 3D image ── */}
            <div className="relative h-64 sm:h-72 lg:h-full flex items-center justify-center order-1 lg:order-2" style={{ transformStyle:"preserve-3d" }}>
              {exiting !== null && (
                <div
                  key={`exit-${exiting}`}
                  className={`absolute inset-0 flex items-center justify-center ${dir === "right" ? "hero-exit-left" : "hero-exit-right"}`}
                  style={{ transformStyle:"preserve-3d" }}
                >
                  <Image src={SLIDES[exiting].image} alt={SLIDES[exiting].alt} width={680} height={560} className="max-h-[220px] sm:max-h-[320px] lg:max-h-[500px] w-auto object-contain" />
                </div>
              )}
              <div
                key={`slide-${current}`}
                className={busy ? (dir === "right" ? "hero-enter-right" : "hero-enter-left") : "hero-float"}
                style={{ transformStyle:"preserve-3d" }}
              >
                <Image src={slide.image} alt={slide.alt} width={680} height={560} className="max-h-[220px] sm:max-h-[320px] lg:max-h-[500px] w-auto object-contain" priority={current === 0} />
              </div>
            </div>

          </div>

          {/* Bottom nav */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            {/* Auto-play progress bar */}
            <div className="w-full h-[2px] bg-white/[0.06]">
              <div
                key={`prog-${current}`}
                className="h-full bg-orange-500/70 origin-left"
                style={{ animation: `progressFill ${AUTO_PLAY_MS}ms linear forwards` }}
              />
            </div>

            {/* Controls row */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 py-3.5 flex items-center justify-end">

              {/* Arrow buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  disabled={busy}
                  className="group w-10 h-10 rounded-full flex items-center justify-center border border-white/10 hover:border-orange-500/50 bg-white/[0.05] hover:bg-orange-500/10 text-white/50 hover:text-orange-400 transition-all duration-200 disabled:opacity-25"
                  aria-label="Precedent"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                  onClick={goNext}
                  disabled={busy}
                  className="group w-10 h-10 rounded-full flex items-center justify-center border border-white/10 hover:border-orange-500/50 bg-white/[0.05] hover:bg-orange-500/10 text-white/50 hover:text-orange-400 transition-all duration-200 disabled:opacity-25"
                  aria-label="Suivant"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}