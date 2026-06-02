import nextDynamic from "next/dynamic";
import HeroBanner from "@/components/HeroBanner";
import ProductSection from "@/components/ProductSection";
import ProductCard from "@/components/ProductCard";
import { getProductCards } from "@/lib/store";
import Link from "next/link";

const WhyUsSection = nextDynamic(() => import("@/components/RefurbishedSection"), { ssr: true });
const PromoBanners = nextDynamic(() => import("@/components/PromoBanners"), { ssr: true });
const ReviewsSection = nextDynamic(() => import("@/components/ReviewsSection"), { ssr: true });
const NewsletterSection = nextDynamic(() => import("@/components/NewsletterSection"), { ssr: true });

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProductCards();

  const heroStats = [
    "android-tv-box-x96q",
    "android-tv-stick-mortal-q8",
  ].map((slug) => {
    const p = products.find((x) => x.slug === slug);
    const reviews = p?.productReviews ?? [];
    const rating = reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
    return { rating: Math.round(rating * 10) / 10, reviews: reviews.length };
  });

  return (
    <>
      <HeroBanner stats={heroStats} />

      {/* Flash sale banner */}
      <section data-reveal="fade" className="bg-white border-y border-slate-200 py-3.5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4 w-full min-w-0">
          <div className="flex items-center gap-3 text-slate-800 min-w-0">
            <span className="bg-orange-50 text-orange-600 border border-orange-100 text-xs font-black px-2.5 py-1 rounded-md">
              ⚡ VENTE FLASH
            </span>
            <span className="font-semibold text-xs sm:text-sm block truncate">
              Offres limitées — Ne ratez pas ces prix exceptionnels&nbsp;!
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:flex items-center gap-1.5 text-slate-500 text-xs font-bold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Livraison gratuite incluse
            </span>
            <Link
              href="/promotions"
              className="flex-shrink-0 max-w-[136px] sm:max-w-none truncate bg-slate-950 text-white font-bold text-[11px] sm:text-xs px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Voir les offres →
            </Link>
          </div>
        </div>
      </section>

      <ProductSection
        title="Nos Meilleures Offres"
        subtitle="Box multimédia, accessoires et caméras aux meilleurs prix"
        products={products}
        viewAllHref="/promotions"
        accentColor="red"
      />

      <WhyUsSection />

      <PromoBanners />

      <ProductSection
        title="Meilleures Ventes"
        subtitle="Kits de surveillance, box TV et accessoires plébiscités par nos clients"
        products={products}
        viewAllHref="/produits"
        accentColor="red"
        mobileScroll
      />

      {/* New arrivals */}
      <section className="py-12 sm:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-7 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1 h-7 bg-orange-500 rounded-full shrink-0 inline-block" />
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 truncate">Nouveaux Arrivages</h2>
                <p className="block text-xs sm:text-sm text-slate-500 mt-0.5">Dernières caméras, box TV et accessoires en stock</p>
              </div>
            </div>
            <Link
              href="/nouveautes"
              className="shrink-0 flex items-center gap-1 text-xs sm:text-sm font-bold text-slate-700 hover:text-orange-600 border border-slate-200 hover:border-orange-200 rounded-lg px-3 py-2 hover:bg-orange-50 transition-all"
            >
              Voir tout
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {products.slice(0, 8).map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <ReviewsSection />

      <NewsletterSection />

      {/* About snippet */}
      <section data-reveal="up" className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-3">
          <h2 className="text-xl font-black text-slate-900">
            ElectroShop-Tech&nbsp;: Passerelle Multimédia, Accessoires &amp; Caméras au Maroc
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            ElectroShop-Tech est votre spécialiste en ligne pour les box multimédias Android TV,
            les systèmes de vidéosurveillance IP et les accessoires high-tech au Maroc.
            Produits 100% authentiques, garantis et livrés rapidement partout au Maroc.
          </p>
          <Link
            href="/a-propos"
            className="inline-flex items-center gap-1.5 text-orange-500 hover:text-orange-600 text-sm font-semibold transition-colors"
          >
            En savoir plus sur nous
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
