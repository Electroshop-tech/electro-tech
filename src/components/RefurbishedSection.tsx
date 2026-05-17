"use client";

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
          0%,100% { box-shadow: 0 0 30px 4px rgba(251,146,60,.18), 0 0 80px 16px rgba(59,130,246,.1); }
          50%     { box-shadow: 0 0 60px 8px rgba(251,146,60,.35), 0 0 140px 30px rgba(59,130,246,.2); }
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
          0%,100% { transform: translate(0,0)       scale(1);   opacity: .12; }
          33%     { transform: translate(30px,-20px) scale(1.2); opacity: .22; }
          66%     { transform: translate(-20px,15px) scale(0.9); opacity: .08; }
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

      <section className="relative w-full overflow-hidden bg-[#060b15]">

        {/* Ambient background orbs */}
        <div className="wus-orb absolute top-[10%] left-[8%]  w-72 h-72 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" style={{"--delay":"0s"} as React.CSSProperties} />
        <div className="wus-orb absolute bottom-[8%] right-[6%] w-80 h-80 rounded-full bg-blue-500/20   blur-3xl pointer-events-none" style={{"--delay":"3s"} as React.CSSProperties} />

        {/* Top fade — desktop only */}
        <div className="hidden sm:block absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-gray-50 to-transparent z-20 pointer-events-none" />

        {/* Mobile image — plain, no animation */}
        <Image
          src="/images/For mobile version.png"
          alt="Pourquoi nous choisir ElectroShop-Tech"
          width={1080}
          height={1080}
          className="sm:hidden w-full h-auto"
          priority
        />

        {/* Desktop image — entrance + glow */}
        <div className="hidden sm:block wus-reveal wus-glow relative overflow-hidden">

          <Image
            src="/images/Pourquoi nous choisir.png"
            alt="Pourquoi nous choisir ElectroShop-Tech"
            width={1920}
            height={1080}
            className="w-full h-auto"
            priority
          />

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
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-gray-100 to-transparent z-20 pointer-events-none" />
      </section>
    </>
  );
}
