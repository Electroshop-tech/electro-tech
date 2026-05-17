"use client";

const platforms = [
  { name: "Netflix",       color: "#E50914", bg: "#1a0000", icon: "N" },
  { name: "YouTube",       color: "#FF0000", bg: "#1a0000", icon: "▶" },
  { name: "Prime Video",   color: "#00A8E0", bg: "#00111a", icon: "◈" },
  { name: "Disney+",       color: "#113CCF", bg: "#00071a", icon: "✦" },
  { name: "Apple TV+",     color: "#f5f5f7", bg: "#111111", icon: "" },
  { name: "Spotify",       color: "#1DB954", bg: "#001108", icon: "♫" },
  { name: "Twitch",        color: "#9147FF", bg: "#0d0017", icon: "◉" },
  { name: "Google Play",   color: "#4285F4", bg: "#001226", icon: "▷" },
  { name: "TikTok",        color: "#ff0050", bg: "#1a0008", icon: "♪" },
  { name: "DAZN",          color: "#F8FF00", bg: "#111100", icon: "◆" },
  { name: "Plex",          color: "#E5A00D", bg: "#1a1000", icon: "▶" },
  { name: "Kodi",          color: "#17B2E8", bg: "#001018", icon: "⬡" },
];

const doubled = [...platforms, ...platforms];

export default function BrandsSection() {
  return (
    <>
      <style>{`
        @keyframes marqLeft {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marq-track {
          display: flex;
          width: max-content;
          animation: marqLeft 32s linear infinite;
        }
        .marq-track:hover { animation-play-state: paused; }
      `}</style>

      <section className="py-14 bg-[#080c12] border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
          <p className="text-orange-400 text-xs font-black uppercase tracking-widest mb-2">Compatibilité totale</p>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Vos plateformes <span className="text-orange-400">préférées</span>, toutes supportées
          </h2>
          <p className="text-slate-500 text-sm mt-2">Nos box Android TV donnent accès à toutes vos apps en un clic</p>
        </div>

        {/* Fade masks */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#080c12] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#080c12] to-transparent z-10 pointer-events-none" />

          <div className="marq-track gap-4 px-2">
            {doubled.map((p, i) => (
              <div
                key={i}
                className="flex-shrink-0 flex flex-col items-center justify-center gap-2 w-32 h-20 rounded-2xl border border-white/8 mx-2 cursor-default select-none transition-transform hover:scale-105"
                style={{ background: p.bg }}
              >
                <span className="text-2xl leading-none" style={{ color: p.color }}>{p.icon}</span>
                <span className="text-xs font-black tracking-tight" style={{ color: p.color }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust line */}
        <div className="max-w-7xl mx-auto px-4 mt-10 flex flex-wrap items-center justify-center gap-6 text-slate-500 text-xs">
          {["Android TV & Google TV", "Toutes résolutions 4K / FHD", "Wi-Fi 2.4 & 5 GHz", "Mise à jour automatique"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
              {t}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}

