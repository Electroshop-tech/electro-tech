import Link from "next/link";
import { getProducts } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import NewsletterSection from "@/components/NewsletterSection";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Bon Plans & Promotions — ElectroShop-Tech",
  description: "Profitez de nos meilleures offres et promotions sur les box TV Android, accessoires et caméras de surveillance.",
};

export default async function PromotionsPage() {
  const allProducts = await getProducts();
  const promoProducts = allProducts.filter(
    (p) => p.originalPrice > p.currentPrice
  ).sort((a, b) => {
    const discA = (a.originalPrice - a.currentPrice) / a.originalPrice;
    const discB = (b.originalPrice - b.currentPrice) / b.originalPrice;
    return discB - discA;
  });

  const statsItems = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
        </svg>
      ),
      value: `${promoProducts.length}`,
      label: "Produits en promo",
      color: "text-orange-500 bg-orange-50",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      value: promoProducts.length > 0 ? `${Math.round(Math.max(...promoProducts.map((p) => ((p.originalPrice - p.currentPrice) / p.originalPrice) * 100)))}%` : "0%",
      label: "Remise maximale",
      color: "text-red-500 bg-red-50",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      value: "Gratuite",
      label: "Livraison dès 50€",
      color: "text-green-600 bg-green-50",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      value: "12 mois",
      label: "Garantie incluse",
      color: "text-blue-600 bg-blue-50",
    },
  ];

  return (
    <div className="bg-[#f5f7fb] min-h-screen">

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-orange-700 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.055]">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${40 + (i * 17) % 80}px`,
                height: `${40 + (i * 17) % 80}px`,
                top: `${(i * 23) % 100}%`,
                left: `${(i * 37) % 100}%`,
                opacity: 0.3,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white font-medium">Bon Plans</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-4">
                <span className="text-lg">🔥</span>
                <span className="text-xs font-bold tracking-wide uppercase">Offres limitées</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 leading-tight">
                Bon Plans &<br />Promotions
              </h1>
              <p className="text-white/80 text-sm leading-relaxed max-w-lg">
                Économisez sur notre sélection de box TV Android, TV sticks, accessoires et caméras de surveillance.
                Des prix imbattables, une qualité garantie.
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 md:w-80 flex-shrink-0">
              {statsItems.map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-lg p-4 text-center">
                  <div className="text-2xl font-black">{s.value}</div>
                  <div className="text-[11px] text-white/70 font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust bar ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
          {[
            { icon: "🚚", text: "Livraison 24-48h" },
            { icon: "🔒", text: "Paiement sécurisé" },
            { icon: "↩️", text: "Retour 30 jours" },
            { icon: "🛡️", text: "Garantie constructeur" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Sort toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-black text-gray-900">Toutes les promotions</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {promoProducts.length} offre{promoProducts.length !== 1 ? "s" : ""} disponible{promoProducts.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">Trier :</label>
            <select className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 outline-none bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 cursor-pointer">
              <option value="discount">Meilleures remises</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>
        </div>

        {/* Product grid */}
        {promoProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {promoProducts.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">Aucune promotion disponible pour le moment.</p>
          </div>
        )}

        {/* Promo CTA banner */}
        <div className="mt-12 bg-gradient-to-r from-slate-950 to-slate-800 rounded-lg p-5 sm:p-8 text-white text-center shadow-[0_18px_44px_rgba(15,23,42,0.16)]">
          <h3 className="text-xl font-black mb-2">Ne ratez aucune offre !</h3>
          <p className="text-white/70 text-sm mb-5">
            Inscrivez-vous à notre newsletter et recevez nos meilleures promotions en avant-première.
          </p>
          <form className="flex items-center gap-3 max-w-md mx-auto" action="#">
            <input
              type="email"
              placeholder="Votre adresse e-mail"
              className="flex-1 min-w-0 px-4 py-2.5 rounded-lg text-sm text-slate-800 outline-none placeholder-slate-400"
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
            >
              S&apos;inscrire
            </button>
          </form>
        </div>
      </div>

      <NewsletterSection />
    </div>
  );
}
