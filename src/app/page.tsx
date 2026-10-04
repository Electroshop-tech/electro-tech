import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import HeroBanner from "@/components/HeroBanner";
import ProductSection from "@/components/ProductSection";
import ProductCard from "@/components/ProductCard";
import { getProductCards } from "@/lib/store";
import Link from "next/link";
import flashStyles from "@/components/FlashSale.module.css";

export const metadata: Metadata = {
  title: "Box Android TV, Caméras de Surveillance & Accessoires en France",
  description:
    "Achetez vos box Android TV 4K, TV Sticks, caméras de surveillance IP et accessoires high-tech au meilleur prix. Produits authentiques, garantis, paiement accompagné par notre équipe.",
  alternates: { canonical: "https://electroshop-tech.com" },
};

const CategoryHighlights = nextDynamic(() => import("@/components/CategoryHighlights"), { ssr: true });
const PromoBanners = nextDynamic(() => import("@/components/PromoBanners"), { ssr: true });
const ReviewsSection = nextDynamic(() => import("@/components/ReviewsSection"), { ssr: true });
const NewsletterSection = nextDynamic(() => import("@/components/NewsletterSection"), { ssr: true });

// ISR: render once, serve from cache, refresh in the background every 60s
// (also revalidated instantly on product changes via the "products" cache tag).
export const revalidate = 60;

export default async function Home() {
  const products = await getProductCards();

  return (
    <>
      <HeroBanner />

      {/* Flash sale banner */}
      <section className={flashStyles.strip} aria-label="Promotions">
        <Link href="/promotions" className={flashStyles.link}>
          <span className={flashStyles.icon} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m13 3-8 11h6l-1 7 9-12h-6l1-6Z" strokeLinejoin="round" /></svg>
          </span>
          <span className={flashStyles.copy}><strong>Les offres du moment</strong><span>Vos essentiels à prix doux.</span></span>
          <span className={flashStyles.action}>Découvrir <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
        </Link>
      </section>

      <ProductSection
        title="Nos meilleures offres"
        subtitle="La tech qu’il vous faut, au meilleur prix."
        products={products}
        viewAllHref="/promotions"
      />

      <CategoryHighlights />

      <PromoBanners products={products} />

      <ProductSection
        title="Meilleures Ventes"
        subtitle="Kits de surveillance, box TV et accessoires plébiscités par nos clients"
        products={products.slice(0, 12)}
        viewAllHref="/produits"
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
            {[...products].sort((a, b) => b.id - a.id).slice(0, 8).map((product) => (
              <div key={product.id} className="min-w-0">
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
            ElectroShop-Tech&nbsp;: Passerelle Multimédia, Accessoires &amp; Caméras en France
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            ElectroShop-Tech est votre spécialiste en ligne pour les box multimédias Android TV,
            les systèmes de vidéosurveillance IP et les accessoires high-tech en France.
            Produits 100% authentiques, garantis et livrés directement chez vous.
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
