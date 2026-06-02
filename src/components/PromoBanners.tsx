"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

function useCountdown() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.floor((midnight.getTime() - now.getTime()) / 1000);
      setTime({
        h: Math.floor(diff / 3600),
        m: Math.floor((diff % 3600) / 60),
        s: diff % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

function CountUnit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <span className="bg-black/30 text-white font-black text-base sm:text-lg leading-none px-2 py-1 rounded-md min-w-[2.2rem] text-center tabular-nums">{display}</span>
      <span className="text-white/40 text-[9px] uppercase tracking-wider mt-1">{label}</span>
    </div>
  );
}

const promoBanners = [
  {
    id: 1,
    tag: "BON PLAN",
    tagGradient: "from-orange-500 to-orange-400",
    productName: "Android TV Box X96Q",
    specs: "4K Ultra HD · Android 10 · 2Go RAM / 16Go ROM",
    originalPrice: 70,
    currentPrice: 55,
    currency: "€",
    discountPct: "-21%",
    href: "/produits/android-tv-box-x96q",
    image: "/products/Android%20Tv%20Box%20X96Q/transparent photo.png",
    gradient: "from-[#0f0c1a] via-[#1a1035] to-[#3b1e05]",
    gradientEnd: "#0f0c1a",
    accentColor: "text-orange-400",
    glowRgb: "251,146,60",
    discountGradient: "from-orange-500 to-red-500",
  },
  {
    id: 2,
    tag: "OFFRE FLASH",
    tagGradient: "from-red-500 to-rose-400",
    productName: "TV Stick Mortal Q8",
    specs: "4K Ultra HD · Android TV · Wi-Fi 5 GHz · 2Go RAM",
    originalPrice: 79,
    currentPrice: 60,
    currency: "€",
    discountPct: "-24%",
    href: "/produits/android-tv-stick-mortal-q8",
    image: "/products/Android TV Stick Mortal Q8/transparent photo.jpg",
    gradient: "from-[#020b18] via-[#041832] to-[#071a3e]",
    gradientEnd: "#020b18",
    accentColor: "text-blue-400",
    glowRgb: "59,130,246",
    discountGradient: "from-blue-500 to-blue-400",
  },
];

export default function PromoBanners() {
  const { h, m, s } = useCountdown();
  return (
    <>
      <style>{`
        @keyframes cardShimmer {
          0% { transform: translateX(-150%) skewX(-15deg); }
          100% { transform: translateX(350%) skewX(-15deg); }
        }
        @keyframes productFloat {
          0%, 100% { transform: translateY(0px) rotate(-0.5deg); }
          50% { transform: translateY(-6px) rotate(0.5deg); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.32; transform: scale(1); }
          50% { opacity: 0.52; transform: scale(1.06); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        .promo-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.045) 50%, transparent 60%);
          animation: cardShimmer 5.5s ease-in-out infinite;
          pointer-events: none;
          z-index: 5;
        }
        .product-float { animation: productFloat 5s ease-in-out infinite; }
        .glow-pulse { animation: glowPulse 3.5s ease-in-out infinite; }
        .sparkle-1 { animation: sparkle 2.5s ease-in-out infinite 0s; }
        .sparkle-2 { animation: sparkle 2.5s ease-in-out infinite 0.8s; }
        .sparkle-3 { animation: sparkle 2.5s ease-in-out infinite 1.6s; }
      `}</style>

      <section className="py-8 sm:py-10 bg-[#f5f7fb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            {promoBanners.map((b, i) => (
              <Link
                key={b.id}
                href={b.href}
                data-reveal={i === 0 ? "left" : "right"}
                data-reveal-delay={i === 1 ? "120" : "0"}
                className={`promo-card relative flex flex-col sm:flex-row sm:items-center bg-gradient-to-br ${b.gradient} rounded-lg overflow-hidden sm:p-7 min-h-0 sm:min-h-[230px] group hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.24)] transition-all duration-300`}
              >
                {/* ── Mobile: image stage ── */}
                <div className="sm:hidden relative h-48 flex items-center justify-center overflow-hidden">
                  {/* Dot grid */}
                  <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                  {/* Deep glow */}
                  <div
                    className="glow-pulse absolute w-64 h-64 rounded-full blur-3xl"
                    style={{ background: `radial-gradient(circle, rgba(${b.glowRgb},0.55) 0%, rgba(${b.glowRgb},0.18) 55%, transparent 78%)` }}
                  />
                  {/* Sparkles */}
                  <div className="sparkle-1 absolute top-5 right-14 w-1.5 h-1.5 bg-white rounded-full pointer-events-none" />
                  <div className="sparkle-2 absolute top-12 right-6 w-1 h-1 bg-white rounded-full pointer-events-none" />
                  <div className="sparkle-3 absolute bottom-12 right-20 w-1.5 h-1.5 bg-white rounded-full pointer-events-none" />
                  {/* Product image */}
                  <Image
                    src={b.image}
                    alt={b.productName}
                    width={210}
                    height={210}
                    className="product-float relative z-10 h-40 w-auto object-contain"
                    style={{ filter: `brightness(1.18) drop-shadow(0 16px 34px rgba(0,0,0,0.72))` }}
                  />
                  {/* Seamless fade into card background */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
                    style={{ background: `linear-gradient(to bottom, transparent 0%, ${b.gradientEnd} 100%)` }}
                  />
                </div>

                {/* ── Content (mobile: below image | desktop: left) ── */}
                <div className="relative z-10 flex flex-col gap-3 flex-1 px-5 pb-5 pt-2 sm:p-0 sm:pr-4">
                  {/* Tag + countdown */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-black tracking-[0.18em] uppercase px-3 py-1.5 rounded-full bg-gradient-to-r ${b.tagGradient} text-white shadow-sm shadow-black/30`}>
                      {b.tag}
                    </span>
                    {b.id === 1 && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-orange-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex items-center gap-1">
                          <CountUnit value={h} label="h" />
                          <span className="text-white/50 font-black text-sm -mt-2">:</span>
                          <CountUnit value={m} label="m" />
                          <span className="text-white/50 font-black text-sm -mt-2">:</span>
                          <CountUnit value={s} label="s" />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Name + specs */}
                  <div>
                    <p className="text-white text-[1.2rem] sm:text-[22px] font-black leading-tight tracking-tight">{b.productName}</p>
                    <p className={`${b.accentColor} text-[11px] font-semibold mt-1.5 leading-snug`}>{b.specs}</p>
                  </div>
                  {/* Price + discount */}
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-white/30 text-xs line-through leading-none mb-1">{b.originalPrice} {b.currency}</p>
                      <p className="text-white text-[2.1rem] sm:text-[2.6rem] font-black leading-none">
                        {b.currentPrice}<span className="text-base font-bold ml-1">{b.currency}</span>
                      </p>
                    </div>
                    <div className={`bg-gradient-to-br ${b.discountGradient} text-white font-black rounded-lg shadow-lg shadow-black/30 px-3.5 py-2.5 text-center leading-none`}>
                      <span className="text-xl font-black">{b.discountPct}</span><br />
                      <span className="text-[9px] tracking-[0.15em] font-semibold opacity-80 uppercase">remise</span>
                    </div>
                  </div>
                  {/* CTA */}
                  <span className="self-start inline-flex items-center gap-1.5 text-xs font-bold text-white/45 group-hover:text-white transition-colors duration-300">
                    Voir l&apos;offre complète
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>

                {/* ── Desktop: floating image right ── */}
                <div className="hidden sm:flex relative z-10 flex-shrink-0 w-52 h-52">
                  <div className="product-float w-full h-full relative flex items-center justify-center">
                    <div className="glow-pulse absolute inset-0 rounded-full blur-2xl" style={{ background: `radial-gradient(circle, rgba(${b.glowRgb},0.48) 0%, rgba(${b.glowRgb},0.14) 50%, transparent 75%)` }} />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-4 rounded-full blur-xl opacity-40" style={{ background: `rgba(${b.glowRgb}, 0.42)` }} />
                    <Image
                      src={b.image}
                      alt={b.productName}
                      width={210}
                      height={210}
                      className="relative object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
                      style={{ filter: "brightness(1.14) drop-shadow(0 16px 34px rgba(0,0,0,0.68))" }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
