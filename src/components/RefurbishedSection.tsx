"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${6 + (i * 5.3) % 88}%`,
  delay: `${(i * 0.45) % 7}s`,
  duration: `${5 + (i * 0.6) % 5}s`,
  size: i % 3 === 0 ? 4 : i % 3 === 1 ? 3 : 2,
  opacity: 0.3 + (i % 4) * 0.15,
}));

const sparkles = [
  { left: "12%", top: "22%", delay: "0s" },
  { left: "34%", top: "65%", delay: "0.8s" },
  { left: "58%", top: "18%", delay: "1.6s" },
  { left: "76%", top: "72%", delay: "0.4s" },
  { left: "88%", top: "38%", delay: "2.1s" },
  { left: "22%", top: "80%", delay: "1.2s" },
];

export default function WhyUsSection() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const openVideo = useCallback(() => {
    setPlaying(true);
  }, []);

  const closeVideo = useCallback(() => {
    setPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  return (
    <>
      <style>{`
        @keyframes wusReveal {
          from { opacity: 0; transform: scale(0.96) translateY(20px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes wusSweep {
          0%   { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
          8%   { opacity: 0.6; }
          92%  { opacity: 0.6; }
          100% { transform: translateX(320%)  skewX(-18deg); opacity: 0; }
        }
        @keyframes wusScan {
          0%   { top: -4px;   opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 0.5; }
          100% { top: 100%;   opacity: 0; }
        }
        @keyframes wusGlow {
          0%,100% { box-shadow: 0 0 24px 2px rgba(251,146,60,.12), 0 0 70px 14px rgba(59,130,246,.06); }
          50%     { box-shadow: 0 0 40px 4px rgba(251,146,60,.2), 0 0 110px 22px rgba(59,130,246,.1); }
        }
        @keyframes wusFloat {
          0%   { transform: translateY(0)     scale(1);   opacity: 0; }
          10%  { opacity: 1; }
          85%  { opacity: 0.7; }
          100% { transform: translateY(-180px) scale(0.4); opacity: 0; }
        }
        @keyframes wusSparkle {
          0%,100% { opacity: 0;   transform: scale(0.4) rotate(0deg);   }
          40%,60% { opacity: 1;   transform: scale(1.2) rotate(180deg); }
        }
        @keyframes wusBracket {
          0%,100% { opacity: 0.4; transform: scale(1);    }
          50%     { opacity: 1;   transform: scale(1.08); }
        }
        @keyframes wusOrb {
          0%,100% { transform: translate(0,0)       scale(1);   opacity: .06; }
          33%     { transform: translate(20px,-14px) scale(1.12); opacity: .11; }
          66%     { transform: translate(-14px,10px) scale(0.95); opacity: .05; }
        }
        .wus-reveal  { animation: wusReveal  .9s cubic-bezier(.22,1,.36,1) both; }
        .wus-sweep   { animation: wusSweep   5s  linear 1.2s infinite; }
        .wus-scan    { animation: wusScan    8s  linear 2s  infinite; }
        .wus-glow    { animation: wusGlow    4s  ease-in-out infinite; }
        .wus-float   { animation: wusFloat   var(--dur) ease-in var(--delay) infinite; }
        .wus-sparkle { animation: wusSparkle 3s  ease-in-out var(--delay) infinite; }
        .wus-bracket { animation: wusBracket 3s  ease-in-out infinite; }
        .wus-orb     { animation: wusOrb     9s  ease-in-out var(--delay) infinite; }
      `}</style>

      <section className="relative w-full overflow-hidden bg-[#050814]">

        {/* Ambient background orbs */}
        <div className="wus-orb absolute top-[10%] left-[8%]  w-72 h-72 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" style={{"--delay":"0s"} as React.CSSProperties} />
        <div className="wus-orb absolute bottom-[8%] right-[6%] w-80 h-80 rounded-full bg-blue-500/10   blur-3xl pointer-events-none" style={{"--delay":"3s"} as React.CSSProperties} />



        {/* Mobile image — plain, no animation */}
        <Image
          src="/images/For mobile version.jpg"
          alt="Pourquoi nous choisir ElectroShop-Tech"
          width={1080}
          height={1080}
          className="sm:hidden w-full h-auto"
          priority
        />

        {/* Desktop image — entrance + glow */}
        <div className="hidden sm:block wus-reveal wus-glow relative overflow-hidden">

          {playing ? (
            /* Video replaces the image — fills the whole section */
            <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
              <video
                ref={videoRef}
                src="/videos/hero-demo.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              {/* Close / back to image */}
              <button
                onClick={closeVideo}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors z-30"
                aria-label="Fermer la vidéo"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              {/* Clickable TV area with play button */}
              <button
                type="button"
                onClick={openVideo}
                className="absolute top-[8%] right-[3%] w-[55%] h-[75%] z-20 cursor-pointer group"
                aria-label="Lancer la vidéo de démonstration"
              >
                {/* Play button circle */}
                <div className="absolute top-[29%] left-[70%] -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white group-hover:bg-white/90 group-hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.4)] group-hover:shadow-[0_0_60px_rgba(255,255,255,0.6)]">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </button>

              <Image
                src="/images/Pourquoi nous choisir.jpg"
                alt="Pourquoi nous choisir ElectroShop-Tech"
                width={1920}
                height={1080}
                className="w-full h-auto"
                priority
              />

              {/* "See our products" overlay CTA */}
              <a
                href="/produits"
                className="absolute left-8 sm:left-12 bottom-[80px] flex items-center gap-5 px-10 py-7 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xl sm:text-2xl transition-all duration-200 shadow-2xl hover:shadow-2xl hover:-translate-y-2 z-20"
              >
                <svg className="w-9 h-9 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2z" />
                </svg>
                Voir nos produits
              </a>

              {/* Diagonal shimmer sweep */}
              <div className="wus-sweep absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none z-10" />

              {/* Horizontal scan line */}
              <div className="wus-scan absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400/60 to-transparent pointer-events-none z-10" />

              {/* Floating particles */}
              {particles.map((p) => (
                <div
                  key={p.id}
                  className="wus-float absolute bottom-0 rounded-full pointer-events-none z-10"
                  style={{
                    left: p.left,
                    width: p.size,
                    height: p.size,
                    background: p.id % 2 === 0 ? `rgba(251,146,60,${p.opacity})` : `rgba(147,197,253,${p.opacity})`,
                    boxShadow: p.id % 2 === 0 ? `0 0 6px 2px rgba(251,146,60,.4)` : `0 0 6px 2px rgba(147,197,253,.4)`,
                    "--dur": p.duration,
                    "--delay": p.delay,
                  } as React.CSSProperties}
                />
              ))}

              {/* Sparkle stars */}
              {sparkles.map((s, i) => (
                <div
                  key={i}
                  className="wus-sparkle absolute text-orange-300 text-lg font-black pointer-events-none z-10 select-none"
                  style={{ left: s.left, top: s.top, "--delay": s.delay } as React.CSSProperties}
                >
                  ✦
                </div>
              ))}

              {/* Corner bracket — top-left */}
              <svg className="wus-bracket absolute top-4 left-4 z-10 pointer-events-none" width="40" height="40" fill="none">
                <path d="M20 4 L4 4 L4 20" stroke="rgba(251,146,60,.7)" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              {/* Corner bracket — top-right */}
              <svg className="wus-bracket absolute top-4 right-4 z-10 pointer-events-none" width="40" height="40" fill="none" style={{"--delay":"0.5s"} as React.CSSProperties}>
                <path d="M20 4 L36 4 L36 20" stroke="rgba(251,146,60,.7)" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              {/* Corner bracket — bottom-left */}
              <svg className="wus-bracket absolute bottom-4 left-4 z-10 pointer-events-none" width="40" height="40" fill="none" style={{"--delay":"1s"} as React.CSSProperties}>
                <path d="M4 20 L4 36 L20 36" stroke="rgba(59,130,246,.7)" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              {/* Corner bracket — bottom-right */}
              <svg className="wus-bracket absolute bottom-4 right-4 z-10 pointer-events-none" width="40" height="40" fill="none" style={{"--delay":"1.5s"} as React.CSSProperties}>
                <path d="M36 20 L36 36 L20 36" stroke="rgba(59,130,246,.7)" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </>
          )}
        </div>

      </section>
    </>
  );
}
