"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

const SLIDES = [
  {
    id: 0,
    image: "/images/3D hero section/box tv.jpg",
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
    glowImg: "rgba(249,115,22,0.24)",
    chips: [{ label: "Android", value: "10" }, { label: "RAM", value: "2 Go", accent: true }],
    rating: 4.8,
    reviews: 47,
  },
  {
    id: 1,
    image: "/images/3D hero section/box tv usb.jpg",
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
    glowImg: "rgba(99,102,241,0.24)",
    chips: [{ label: "Android", value: "10" }, { label: "Ultra", value: "4K", accent: true }],
    rating: 4.6,
    reviews: 28,
  },
];

const TRANSITION_MS = 700;
const AUTO_PLAY_MS = 5000;

type SlideStats = { rating: number; reviews: number };

export default function HeroBanner({ stats }: { stats?: SlideStats[] }) {
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState<number | null>(null);
  const [dir, setDir] = useState<"right" | "left">("right");
  const [busy, setBusy] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseSlide = SLIDES[current % SLIDES.length];
  const overrides = stats?.[current % SLIDES.length];
  const slide = overrides ? { ...baseSlide, rating: overrides.rating, reviews: overrides.reviews } : baseSlide;
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
          0%   { transform: perspective(1000px) translateY(0px)  rotateX(0deg) rotateY(0deg) scale(1);    filter: drop-shadow(0 24px 44px rgba(0,0,0,0.46)); }
          50%  { transform: perspective(1000px) translateY(-12px) rotateX(3deg) rotateY(3deg) scale(1.015); filter: drop-shadow(0 34px 58px rgba(0,0,0,0.52)); }
          100% { transform: perspective(1000px) translateY(0px)  rotateX(0deg) rotateY(0deg) scale(1);    filter: drop-shadow(0 24px 44px rgba(0,0,0,0.46)); }
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
        @keyframes blobPulse { 0%,100%{opacity:.32;transform:scale(1);}50%{opacity:.48;transform:scale(1.08);} }
        @keyframes ringPulse { 0%,100%{transform:scale(.9);opacity:.38;}50%{transform:scale(1.08);opacity:.12;} }
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

      <section className="bg-[#050814] border-b border-slate-900 overflow-hidden select-none">
        <div className="relative h-auto lg:h-[600px]">

          {/* Glow blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="blob-a absolute top-1/2 right-1/4 -translate-y-1/2 w-[560px] h-[560px] rounded-full blur-3xl transition-[background] duration-1000 opacity-50" style={{ background: slide.glow }} />
            <div className="blob-b absolute top-1/3 right-1/3 w-[300px] h-[300px] rounded-full blur-3xl transition-[background] duration-1000 opacity-40" style={{ background: slide.glow2 }} />
            <div className="ring-a absolute top-1/2 right-1/4 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-white/[0.07]" />
            <div className="ring-b absolute top-1/2 right-1/4 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/[0.04]" />
          </div>

          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.030] pointer-events-none" style={{ backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)", backgroundSize:"44px 44px" }} />

          {/* Two-column layout */}
          <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 grid lg:grid-cols-2 items-center gap-4 sm:gap-6 lg:gap-10 pt-5 pb-16 sm:pt-10 sm:pb-24 lg:pt-0 lg:pb-16">

            {/* ── Left: Rich text ── */}
            <div key={`text-${current}`} className="hero-text flex flex-col gap-3.5 sm:gap-4 order-2 lg:order-1">

              {/* Badge row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider text-white ${slide.badgeBg}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                  {slide.badge}
                </span>
                <span className="text-white/35 text-[10px] hidden sm:inline">•</span>
                <span className="text-white/40 text-[10px] sm:text-xs font-medium tracking-widest uppercase">{slide.model}</span>
              </div>

              {/* Title — first line white, second line orange */}
              <h1 className="text-3xl sm:text-4xl xl:text-6xl font-black leading-[1.05] tracking-tight">
                {slide.title.split('\n').map((line, i) => (
                  <span key={i} className={`block ${
                    i === 1 ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300' : 'text-white'
                  }`}>{line}</span>
                ))}
              </h1>

              {/* Star rating */}
              <div className="flex items-center gap-2">
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
              <div className="flex flex-col gap-1.5 mt-1">
                <div className="inline-flex items-center gap-1.5 text-[10px] text-orange-300/60 font-semibold tracking-widest uppercase">
                  <span className="w-1 h-1 rounded-full bg-orange-400/60" />
                  Prix spécial — Stock limité
                </div>
                <div className="flex items-center gap-3">
                  <span className="price-shimmer text-5xl font-black tracking-tight">{slide.price}€</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-white/30 line-through leading-none">{slide.oldPrice}€</span>
                    <span className="text-xs font-bold text-emerald-400">Économie {savings}€</span>
                  </div>
                  <span className="bg-emerald-500/15 text-emerald-300 text-xs font-black px-2.5 py-1.5 rounded-xl border border-emerald-500/25 shadow-[0_0_12px_rgba(52,211,153,0.15)]">
                    -{discount}%
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={slide.href}
                  className="inline-flex items-center gap-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-black px-7 py-3.5 rounded-xl transition-all duration-200 shadow-[0_12px_28px_rgba(249,115,22,0.30)] hover:shadow-[0_18px_36px_rgba(249,115,22,0.42)] hover:-translate-y-0.5 active:translate-y-0 text-sm w-full sm:w-auto justify-center"
                >
                  Voir le produit
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/produits"
                  className="hidden sm:inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-semibold px-5 py-3.5 rounded-xl border border-white/[0.12] hover:border-white/30 hover:bg-white/[0.05] transition-all duration-200 backdrop-blur-sm"
                >
                  Explorer la gamme
                  <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="hidden sm:flex flex-wrap gap-2 pt-2 border-t border-white/[0.07]">
                {[
                  { icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4", label: "Livraison 24-48h" },
                  { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Garantie 1 an" },
                  { icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6", label: "Retour 30 jours" },
                ].map((t) => (
                  <div key={t.label} className="flex items-center gap-1.5 text-white/55 text-xs bg-white/[0.04] border border-white/[0.07] rounded-lg px-2.5 py-1.5">
                    <svg className="w-3.5 h-3.5 text-orange-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} />
                    </svg>
                    {t.label}
                  </div>
                ))}
              </div>

</div>

            {/* ── Right: 3D image ── */}
            <div className="relative h-64 sm:h-72 lg:h-full flex items-center justify-center order-1 lg:order-2" style={{ transformStyle:"preserve-3d" }}>
              {/* Ambient light — warm centre bleeds into slide accent for stronger screen-blend transparency */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center" aria-hidden="true">
                <div style={{ width: '95%', height: '95%', borderRadius: '50%', background: `radial-gradient(ellipse 62% 62% at 50% 52%, rgba(255,242,200,0.72) 0%, rgba(255,205,100,0.42) 20%, ${slide.glowImg} 50%, transparent 72%)` }} />
              </div>
              {/* Left & bottom edge fades — image dissolves seamlessly into hero background */}
              <div className="absolute inset-y-0 left-0 w-2/5 pointer-events-none z-[5] hidden lg:block" style={{ background: 'linear-gradient(to right, #050814 0%, rgba(5,8,20,0.55) 50%, transparent 100%)' }} />
              <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none z-[5]" style={{ background: 'linear-gradient(to top, #050814 0%, rgba(5,8,20,0.4) 60%, transparent 100%)' }} />
              {/* Floating spec chips — driven by slide data */}
              <div className="absolute top-2 right-2 sm:top-4 sm:right-0 hidden sm:flex flex-col gap-2 z-10">
                {slide.chips.map((chip) => (
                  <div key={chip.value} className={`backdrop-blur-sm rounded-2xl px-3.5 py-2 text-center ${
                    chip.accent
                      ? "bg-orange-500/10 border border-orange-500/20 shadow-[0_4px_16px_rgba(249,115,22,0.15)]"
                      : "bg-white/[0.06] border border-white/[0.10] shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
                  }`}>
                    <div className={`text-[9px] font-semibold uppercase tracking-widest ${chip.accent ? "text-orange-300/60" : "text-white/40"}`}>{chip.label}</div>
                    <div className={`text-xl font-black leading-none mt-0.5 ${chip.accent ? "text-orange-400" : "text-white"}`}>{chip.value}</div>
                  </div>
                ))}
              </div>
              {exiting !== null && (
                <div
                  key={`exit-${exiting}`}
                  className={`absolute inset-0 flex items-center justify-center ${dir === "right" ? "hero-exit-left" : "hero-exit-right"}`}
                  style={{ transformStyle:"preserve-3d" }}
                >
                  <Image src={SLIDES[exiting].image} alt={SLIDES[exiting].alt} width={680} height={560} className="max-h-[250px] sm:max-h-[320px] lg:max-h-[500px] w-auto object-contain" style={{ mixBlendMode: 'screen', filter: 'brightness(1.18) contrast(1.04) saturate(1.1)', WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 14%, rgba(0,0,0,0.9) 36%, rgba(0,0,0,0.42) 60%, transparent 76%)', maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 14%, rgba(0,0,0,0.9) 36%, rgba(0,0,0,0.42) 60%, transparent 76%)' }} />
                </div>
              )}
              <div
                key={`slide-${current}`}
                className={busy ? (dir === "right" ? "hero-enter-right" : "hero-enter-left") : "hero-float"}
                style={{ transformStyle:"preserve-3d" }}
              >
                <Image src={slide.image} alt={slide.alt} width={680} height={560} className="max-h-[250px] sm:max-h-[320px] lg:max-h-[500px] w-auto object-contain" style={{ mixBlendMode: 'screen', filter: 'brightness(1.18) contrast(1.04) saturate(1.1)', WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 14%, rgba(0,0,0,0.9) 36%, rgba(0,0,0,0.42) 60%, transparent 76%)', maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 14%, rgba(0,0,0,0.9) 36%, rgba(0,0,0,0.42) 60%, transparent 76%)' }} priority={current === 0} />
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

              {/* Arrow buttons + dot indicators */}
              <div className="flex items-center gap-3">
                <button
                  onClick={goPrev}
                  disabled={busy}
                  className="group w-9 h-9 rounded-full flex items-center justify-center border border-white/10 hover:border-orange-500/50 bg-white/[0.05] hover:bg-orange-500/10 text-white/50 hover:text-orange-400 transition-all duration-200 disabled:opacity-25"
                  aria-label="Precedent"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                {/* Slide dots */}
                <div className="flex items-center gap-1.5">
                  {SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => !busy && goTo(i, i > current ? 'right' : 'left')}
                      className={`rounded-full transition-all duration-300 ${
                        i === current
                          ? 'w-6 h-2 bg-orange-500'
                          : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={goNext}
                  disabled={busy}
                  className="group w-9 h-9 rounded-full flex items-center justify-center border border-white/10 hover:border-orange-500/50 bg-white/[0.05] hover:bg-orange-500/10 text-white/50 hover:text-orange-400 transition-all duration-200 disabled:opacity-25"
                  aria-label="Suivant"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
