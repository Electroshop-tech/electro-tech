import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getProducts, getProductBySlug } from "@/lib/store";
import AddToCartWidget from "@/components/AddToCartWidget";
import ProductCard from "@/components/ProductCard";
import ProductReviews from "@/components/ProductReviews";
import NewsletterSection from "@/components/NewsletterSection";
import ProductGallery from "@/components/ProductGallery";
import MobileStickyCart from "@/components/MobileStickyCart";
import RecentlyViewed from "@/components/RecentlyViewed";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produit introuvable" };
  const title = `${product.name} | ElectroShop-Tech`;
  const description = product.description?.substring(0, 160) || `Achetez ${product.name} au meilleur prix sur ElectroShop-Tech.`;
  const image = product.images?.[0] || "/images/3D%20hero%20section/3D%20Hero%20section%201.jpg";
  return {
    title,
    description,
    openGraph: { title, description, images: [image], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

const categoryLabels: Record<string, string> = {
  "pc-portable": "PC Portable",
  "pc-bureau": "PC de Bureau",
  "pc-gamer": "PC Portable Gamer",
  "composants": "Composants",
  "peripheriques": "Périphériques",
  "moniteurs": "Moniteurs",
  "passerelle-multimedia": "Passerelle Multimédia",
  "accessoires": "Accessoires",
  "camera-surveillance": "Caméra de Surveillance",
};

const brandColors: Record<string, string> = {
  Lenovo: "text-orange-500",
  HP: "text-blue-600",
  Dell: "text-blue-700",
  ASUS: "text-blue-800",
  MSI: "text-orange-600",
  Acer: "text-green-600",
  Apple: "text-gray-700",
  Samsung: "text-blue-900",
  LG: "text-orange-500",
  Logitech: "text-green-700",
};

function getDeliveryEstimate(): { date: string; beforeCutoff: boolean } {
  const now = new Date();
  const moroccoHour = (now.getUTCHours() + 1) % 24;
  const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const months = ["jan.", "f\u00e9v.", "mars", "avr.", "mai", "juin", "juil.", "ao\u00fbt", "sep.", "oct.", "nov.", "d\u00e9c."];
  const delivery = new Date(now);
  delivery.setDate(delivery.getDate() + (moroccoHour < 18 ? 1 : 2));
  while (delivery.getDay() === 0 || delivery.getDay() === 6) {
    delivery.setDate(delivery.getDate() + 1);
  }
  return {
    date: `${days[delivery.getDay()]}. ${delivery.getDate()} ${months[delivery.getMonth()]}`,
    beforeCutoff: moroccoHour < 18,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const allProducts = await getProducts();
  const product = (await getProductBySlug(slug)) ?? allProducts.find((p) => p.slug === slug);
  if (!product) notFound();

  const discount = Math.round(
    (1 - product.currentPrice / product.originalPrice) * 100
  );
  const canonicalUrl = `https://electroshop-tech.com/produits/${product.slug}`;
  const catLabel = categoryLabels[product.category] ?? product.category;
  const related = allProducts
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  // Fallback specs parsed from description
  const displaySpecs: string[] =
    product.specs ??
    product.description.split(",").map((s) => s.trim()).filter(Boolean);

  const images = product.images ?? [product.image];

  const avgRating =
    product.productReviews && product.productReviews.length > 0
      ? Math.round(product.productReviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / product.productReviews.length * 10) / 10
      : null;

  const deliveryEst = product.inStock !== false ? getDeliveryEstimate() : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images.map((img: string) =>
      img.startsWith("http") ? img : `https://electroshop-tech.com${img}`
    ),
    brand: {
      "@type": "Brand",
      name: product.brand ?? "ElectroShop-Tech",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: product.currentPrice,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `https://electroshop-tech.com/produits/${product.slug}`,
      seller: {
        "@type": "Organization",
        name: "ElectroShop-Tech",
      },
    },
    ...(avgRating && product.productReviews
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: product.productReviews.length,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://electroshop-tech.com" },
      { "@type": "ListItem", position: 2, name: "Produits", item: "https://electroshop-tech.com/produits" },
      { "@type": "ListItem", position: 3, name: catLabel, item: `https://electroshop-tech.com/categorie/${product.category}` },
      { "@type": "ListItem", position: 4, name: product.name },
    ],
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-2 text-xs text-gray-500 flex-wrap">
          <Link href="/" className="hover:text-orange-500 transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/produits" className="hover:text-orange-500 transition-colors">Produits</Link>
          <span>/</span>
          <Link href={`/categorie/${product.category}`} className="hover:text-orange-500 transition-colors">{catLabel}</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-black text-slate-950 mb-1 tracking-tight">{product.name}</h1>

        {/* Inline star rating */}
        {avgRating !== null && product.productReviews && product.productReviews.length > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <svg key={i} className={`w-4 h-4 ${i <= Math.round(avgRating) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-amber-500 text-sm font-bold">{avgRating.toFixed(1)}</span>
            <span className="text-gray-400 text-sm">({product.productReviews.length} avis)</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className={`text-xs font-semibold ${product.inStock !== false ? "text-emerald-600" : "text-red-500"}`}>
              {product.inStock !== false ? "En stock" : "Rupture de stock"}
            </span>
          </div>
        )}

        {product.sku && (
          <p className="text-xs text-gray-400 mb-6">
            <span className="font-bold text-gray-500">UGS :</span> {product.sku}
          </p>
        )}

        {/* Main 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* ── Left: Image gallery (5 cols) ── */}
          <ProductGallery
            images={images}
            name={product.name}
            discount={discount}
            badge={product.badge}
            isRefurbished={product.isRefurbished}
          />

          {/* ── Center: Info (4 cols) ── */}
          <div className="md:col-span-4 space-y-5 order-3 md:order-none">
            {/* Condition + Guarantee — combined row */}
            <div className="flex items-center gap-0 bg-white rounded-lg overflow-hidden border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-2.5 flex-1 px-3 py-2.5">
                <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center text-green-600 flex-shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">État</p>
                  <p className="text-xs font-bold text-gray-900">
                    {product.condition ?? (product.isRefurbished ? "Occasion" : "Neuf")}
                  </p>
                </div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="flex items-center gap-2.5 flex-1 px-3 py-2.5">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Garantie</p>
                  <p className="text-xs font-bold text-gray-900">{product.guarantee ?? "12 Mois"}</p>
                </div>
              </div>
            </div>

            {/* Specs */}
            <div>
              <h3 className="text-sm font-black text-gray-900 mb-2.5 flex items-center gap-2">
                <span className="w-1 h-4 bg-orange-500 rounded-full" />
                Les points forts
              </h3>
              <ul className="space-y-1.5">
                {displaySpecs.map((spec, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                    <svg className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {spec}
                  </li>
                ))}
              </ul>
            </div>



            {/* Category + Share */}
            <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
              <p className="text-gray-500">
                <span className="font-bold text-gray-700">Catégorie :</span>{" "}
                <Link href={`/categorie/${product.category}`} className="text-orange-500 hover:underline">
                  {catLabel}
                </Link>
              </p>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700 text-sm mr-1">Partager :</span>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer" aria-label="X" className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-800 hover:text-white transition-all">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></svg>
                </a>
                <a href="#" aria-label="Copier le lien" className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-500 hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                </a>
              </div>
            </div>
          </div>

          {/* ── Right: Purchase box (3 cols) ── */}
          <div className="md:col-span-3 order-2 md:order-none">
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 sticky top-24 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">

              {/* Stock + discount pill */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-green-600">En stock</span>
                </div>
                {discount > 0 && (
                  <span className="text-xs font-black text-white bg-orange-500 px-2 py-0.5 rounded-full">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Price block */}
              <div className="pb-4 border-b border-gray-100">
                <p className="text-gray-400 text-sm line-through mb-0.5">
                  {product.originalPrice.toLocaleString()}€
                </p>
                <div className="flex items-end gap-2">
                  <p className="text-orange-500 text-4xl font-black leading-tight">
                    {product.currentPrice.toLocaleString()}€
                  </p>
                  {discount > 0 && (
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg mb-1">
                      −{(product.originalPrice - product.currentPrice).toLocaleString()}€
                    </span>
                  )}
                </div>
              </div>

              {/* Free delivery highlight */}
              <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                <div>
                  <p className="text-xs font-black text-green-700">Livraison GRATUITE</p>
                  <p className="text-[10px] text-green-600">Expédié sous 24h · suivi inclus</p>
                </div>
              </div>

              {/* Delivery estimate */}
              {deliveryEst && (
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
                  <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-xs font-black text-blue-700">Livraison estimée</p>
                    <p className="text-[10px] text-blue-600">
                      {deliveryEst.date} · {deliveryEst.beforeCutoff ? "Commandez avant 18h" : "Expédié demain matin"}
                    </p>
                  </div>
                </div>
              )}

              {/* Stock urgency */}
              {product.inStock !== false && (
                <p className="text-[10px] font-bold text-orange-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  Commandez maintenant — stock disponible
                </p>
              )}

              {/* Qty + Add to cart */}
              <div className="border-t border-gray-100 pt-4">
                <AddToCartWidget product={{
                  id: product.id,
                  name: product.name,
                  brand: product.brand,
                  price: product.currentPrice,
                  originalPrice: product.originalPrice,
                  image: product.image,
                  slug: product.slug,
                }} />
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-4">
                {[
                  {
                    color: "bg-blue-50 text-blue-500",
                    label: "Paiement sécurisé",
                    d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
                  },
                  {
                    color: "bg-green-50 text-green-600",
                    label: "Garantie 12 mois",
                    d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                  },
                  {
                    color: "bg-orange-50 text-orange-500",
                    label: "Retour 14 jours",
                    d: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6",
                  },
                  {
                    color: "bg-purple-50 text-purple-600",
                    label: "Support dédié",
                    d: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
                  },
                ].map((b) => (
                  <div key={b.label} className="flex flex-col items-center text-center gap-1.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${b.color}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={b.d} />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 leading-tight">{b.label}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

        {/* ── Description sections ── */}
        {product.descriptionSections && product.descriptionSections.length > 0 && (
          <div className="mt-16 space-y-0 border-t border-gray-100">
            {product.descriptionSections.map((section, i) => (
              <div
                key={i}
                className={`flex flex-col ${section.imageRight ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-12 py-16 border-b border-gray-100`}
              >
                {/* Text */}
                <div className="flex-1 px-4">
                  <h2 className="text-2xl md:text-3xl font-black italic text-gray-900 mb-5">
                    {section.title}
                  </h2>
                  {section.body.split("\n\n").map((para, j) => (
                    <p key={j} className={`text-base leading-relaxed mb-4 ${j === 0 ? "text-orange-500 font-medium" : "text-blue-600 font-medium"}`}>
                      {para}
                    </p>
                  ))}
                </div>
                {/* Image */}
                <div className="flex-1 flex items-center justify-center">
                  <Image
                    src={section.image}
                    alt={section.title}
                    width={480}
                    height={360}
                    className="object-contain drop-shadow-lg w-full max-w-sm md:max-w-md rounded-xl"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Caractéristiques table ── */}
        {product.characteristics && product.characteristics.length > 0 && (
          <div className="mt-12 mb-16">
            <h2 className="text-2xl font-black text-gray-900 mb-1">Caractéristiques</h2>
            <div className="w-12 h-1 bg-orange-500 rounded mb-6" />
            <table className="w-full text-sm">
              <tbody>
                {product.characteristics.map((c, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="py-3 px-4 font-bold text-gray-800 w-1/3 border-b border-gray-100">
                      {c.label}
                    </td>
                    <td className="py-3 px-4 text-gray-500 border-b border-gray-100">
                      {c.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Reviews ── */}
        <ProductReviews
          initialReviews={product.productReviews ?? []}
          productName={product.name}
          productSlug={product.slug}
        />

        {/* Recently viewed */}
        <RecentlyViewed products={allProducts} currentSlug={product.slug} />

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-black text-gray-900 mb-6">
              Produits <span className="text-orange-500">similaires</span>
            </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <NewsletterSection />
      <MobileStickyCart product={{
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.currentPrice,
        originalPrice: product.originalPrice,
        image: product.image,
        slug: product.slug,
      }} />
    </div>
  );
}
