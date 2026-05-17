import Link from "next/link";
import Image from "next/image";

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
    image: "/products/Android TV Stick Mortal Q8/transparent photo.png",
    gradient: "from-[#020b18] via-[#041832] to-[#071a3e]",
    accentColor: "text-blue-400",
    glowRgb: "59,130,246",
    discountGradient: "from-blue-500 to-blue-400",
  },
];

export default function PromoBanners() {
  return (
    <>
      <style>{`
        @keyframes cardShimmer {
          0% { transform: translateX(-150%) skewX(-15deg); }
          100% { transform: translateX(350%) skewX(-15deg); }
        }
        @keyframes productFloat {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.12); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        .promo-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.07) 50%, transparent 62%);
          animation: cardShimmer 4s ease-in-out infinite;
          pointer-events: none;
          z-index: 5;
        }
        .product-float { animation: productFloat 5s ease-in-out infinite; }
        .glow-pulse { animation: glowPulse 3.5s ease-in-out infinite; }
        .sparkle-1 { animation: sparkle 2.5s ease-in-out infinite 0s; }
        .sparkle-2 { animation: sparkle 2.5s ease-in-out infinite 0.8s; }
        .sparkle-3 { animation: sparkle 2.5s ease-in-out infinite 1.6s; }
      `}</style>

      <section className="py-7 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {promoBanners.map((b) => (
              <Link
                key={b.id}
                href={b.href}
                className={`promo-card relative flex items-center bg-gradient-to-br ${b.gradient} rounded-3xl overflow-hidden p-7 min-h-[230px] group hover:scale-[1.015] hover:shadow-2xl transition-all duration-400`}
              >
                {/* Dot grid texture */}
                <div
                  className="absolute inset-0 opacity-[0.045]"
                  style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "18px 18px" }}
                />

                {/* Sparkle dots */}
                <div className="sparkle-1 absolute top-6 right-48 w-1.5 h-1.5 bg-white rounded-full pointer-events-none" />
                <div className="sparkle-2 absolute top-14 right-36 w-1 h-1 bg-white rounded-full pointer-events-none" />
                <div className="sparkle-3 absolute bottom-8 right-56 w-1.5 h-1.5 bg-white rounded-full pointer-events-none" />

                {/* ── Left: text ── */}
                <div className="relative z-10 flex flex-col gap-3.5 flex-1 pr-4">
                  {/* Tag */}
                  <span className={`self-start text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1.5 rounded-full bg-gradient-to-r ${b.tagGradient} text-white shadow-lg`}>
                    {b.tag}
                  </span>

                  {/* Product name + specs */}
                  <div>
                    <p className="text-white text-[22px] font-black leading-tight tracking-tight">{b.productName}</p>
                    <p className={`${b.accentColor} text-[11px] font-semibold mt-1.5 tracking-wide`}>{b.specs}</p>
                  </div>

                  {/* Price + badge */}
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-white/30 text-xs line-through leading-none mb-1">
                        {b.originalPrice} {b.currency}
                      </p>
                      <p className="text-white text-[2.6rem] font-black leading-none">
                        {b.currentPrice}
                        <span className="text-xl font-bold ml-1">{b.currency}</span>
                      </p>
                    </div>
                    <div className={`bg-gradient-to-br ${b.discountGradient} text-white font-black rounded-2xl shadow-xl px-3.5 py-2.5 text-center leading-none`}>
                      <span className="text-2xl font-black">{b.discountPct}</span>
                      <br />
                      <span className="text-[9px] tracking-[0.15em] font-semibold opacity-75 uppercase">remise</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <span className="self-start inline-flex items-center gap-1.5 text-[11px] font-bold text-white/45 group-hover:text-white/90 transition-colors duration-300 mt-0.5">
                    Voir l&apos;offre complète
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>

                {/* ── Right: floating transparent product image ── */}
                <div className="relative z-10 flex-shrink-0 w-52 h-52">
                  <div className="product-float w-full h-full relative flex items-center justify-center">
                    {/* Large bright glow disc */}
                    <div
                      className="glow-pulse absolute inset-0 rounded-full blur-2xl"
                      style={{ background: `radial-gradient(circle, rgba(${b.glowRgb},0.7) 0%, rgba(${b.glowRgb},0.2) 50%, transparent 75%)` }}
                    />
                    {/* Soft platform reflection below */}
                    <div
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-4 rounded-full blur-xl opacity-60"
                      style={{ background: `rgba(${b.glowRgb}, 0.5)` }}
                    />
                    <Image
                      src={b.image}
                      alt={b.productName}
                      width={210}
                      height={210}
                      className="relative object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
                      style={{ filter: "brightness(1.25) drop-shadow(0 16px 48px rgba(0,0,0,0.8))" }}
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
