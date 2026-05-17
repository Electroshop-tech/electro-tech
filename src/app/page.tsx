import HeroBanner from "@/components/HeroBanner";
import NewsletterSection from "@/components/NewsletterSection";
import ProductSection from "@/components/ProductSection";
import WhyUsSection from "@/components/RefurbishedSection";
import ReviewsSection from "@/components/ReviewsSection";
import ProductCard from "@/components/ProductCard";
import PromoBanners from "@/components/PromoBanners";
import { getProducts } from "@/lib/store";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function Home() {
  const products = getProducts();
  return (
    <>
      <HeroBanner />

      {/* Flash sale banner */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-500 py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <span className="bg-white text-orange-500 text-xs font-black px-2.5 py-1 rounded-md">
              ⚡ VENTE FLASH
            </span>
            <span className="font-bold text-sm hidden sm:block">
              Offres limitées — Ne ratez pas ces prix exceptionnels&nbsp;!
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1.5 text-white text-xs font-bold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Livraison gratuite incluse
            </span>
            <Link
              href="/promotions"
              className="flex-shrink-0 bg-white text-orange-500 font-bold text-xs px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors"
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
      />

      {/* New arrivals */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1 h-7 bg-purple-500 rounded-full shrink-0 inline-block" />
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 truncate">Nouveaux Arrivages</h2>
                <p className="hidden sm:block text-sm text-slate-500">Dernières caméras, box TV et accessoires en stock</p>
              </div>
            </div>
            <Link
              href="/nouveautes"
              className="shrink-0 flex items-center gap-1 text-xs sm:text-sm font-bold text-purple-600 hover:text-purple-700 border border-purple-200 hover:border-purple-400 rounded-xl px-3 py-2 hover:bg-purple-50 transition-all"
            >
              Voir tout
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-3 sm:pb-0 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:gap-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {products.map((product) => (
              <div key={product.id} className="shrink-0 w-[165px] sm:w-auto snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <ReviewsSection />

      <NewsletterSection />

      {/* About snippet */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-3">
          <h2 className="text-xl font-black text-slate-900">
            ElectroShop-Tech.ma&nbsp;: Passerelle Multimédia, Accessoires &amp; Caméras au Maroc
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            ElectroShop-Tech.ma est votre spécialiste en ligne pour les box multimédias Android TV,
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

