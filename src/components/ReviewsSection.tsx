import { reviews } from "@/lib/data";

const avatarColors = ["from-blue-500 to-blue-600", "from-pink-500 to-rose-500", "from-emerald-500 to-teal-500", "from-violet-500 to-purple-600"];
const initials    = ["YM", "FB", "KT", "SO"];

// Extra reviews to fill the carousel rows
const extraReviews = [
  { id: 5, author: "Mohammed Ait Brahim", role: "Client vérifié", content: "Très bonne box Android TV, image cristalline en 4K. La livraison a été super rapide et le produit bien emballé. Je recommande à 100%.", rating: 5 },
  { id: 6, author: "Nadia Berrada", role: "Google Reviewer", content: "J'ai pris la télécommande universelle et elle fonctionne parfaitement avec ma box X96Q. Service client très réactif, emballage soigné.", rating: 5 },
  { id: 7, author: "Hamid Zniber", role: "Client régulier", content: "Troisième commande chez ElectroShop-Tech et toujours aussi satisfait. Les prix sont imbattables et les produits sont authentiques.", rating: 5 },
  { id: 8, author: "Soukaina El Fassi", role: "Google Reviewer", content: "Le TV Stick est compact et performant. Installation en 2 minutes et tous les services streaming fonctionnent parfaitement.", rating: 5 },
];

const allReviews = [...reviews, ...extraReviews];
const avatarColorsExt = [...avatarColors, "from-orange-500 to-amber-500", "from-cyan-500 to-blue-500", "from-rose-500 to-red-600", "from-teal-500 to-emerald-600"];
const initialsExt = [...initials, "MA", "NB", "HZ", "SE"];

// Split into two rows, duplicated for seamless loop
const row1 = [...allReviews, ...allReviews];
const row2 = [...allReviews.slice(2), ...allReviews.slice(0, 2), ...allReviews.slice(2), ...allReviews.slice(0, 2)];

const StarRow = ({ size = "w-4 h-4" }: { size?: string }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} className={`${size} text-amber-400`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

function ReviewCard({ review, idx }: { review: typeof allReviews[0]; idx: number }) {
  return (
    <div className="flex-shrink-0 w-72 sm:w-80 bg-white rounded-xl border border-slate-200/80 p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(15,23,42,0.06)] mx-2">
      <div className="text-orange-200 text-4xl font-black leading-none -mb-1">&ldquo;</div>
      <p className="text-slate-600 text-sm leading-relaxed flex-1 italic">{review.content}</p>
      <StarRow />
      <div className="border-t border-gray-100 pt-3 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColorsExt[idx % avatarColorsExt.length]} flex items-center justify-center text-white font-black text-xs flex-shrink-0 shadow-md`}>
          {initialsExt[idx % initialsExt.length]}
        </div>
        <div className="min-w-0">
          <p className="text-slate-900 text-sm font-black truncate">{review.author}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-600 text-[10px] font-semibold">Vérifié</span>
            <span className="text-slate-300 text-[10px]">·</span>
            <span className="text-slate-400 text-[10px]">{review.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsSection() {
  return (
    <section className="py-12 sm:py-16 bg-[#f5f7fb] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header row */}
        <div data-reveal="up" className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-6 bg-orange-500 rounded-full inline-block" />
              <p className="text-orange-500 text-xs font-black uppercase tracking-widest">Ce que disent nos clients</p>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
              Avis <span className="text-orange-500">vérifiés</span>
            </h2>
          </div>

          {/* Google score pill */}
          <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-lg px-6 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] w-fit">
            <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 shadow flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-900">4.9</span>
                <StarRow size="w-4 h-4" />
              </div>
              <p className="text-slate-400 text-xs mt-0.5">Basé sur 25 avis Google</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrolling carousel ── */}
      <style>{`
        @keyframes scrollLeft {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes scrollRight {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        .scroll-left  { animation: scrollLeft  38s linear infinite; }
        .scroll-right { animation: scrollRight 42s linear infinite; }
        .scroll-left:hover,
        .scroll-right:hover { animation-play-state: paused; }
      `}</style>

      {/* Fade edges */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-40 bg-gradient-to-r from-[#f5f7fb] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-40 bg-gradient-to-l from-[#f5f7fb] to-transparent z-10 pointer-events-none" />

        {/* Row 1 — scrolls left */}
        <div className="flex overflow-hidden">
          <div className="scroll-left flex">
            {row1.map((r, i) => <ReviewCard key={`r1-${i}`} review={r} idx={i} />)}
          </div>
        </div>
      </div>

    </section>
  );
}
