import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProducts, getProductBySlug } from "@/lib/store";
import AddToCartWidget from "@/components/AddToCartWidget";
import ProductCard from "@/components/ProductCard";
import ProductReviews from "@/components/ProductReviews";
import NewsletterSection from "@/components/NewsletterSection";
import ProductGallery from "@/components/ProductGallery";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const allProducts = getProducts();
  const product = getProductBySlug(slug) ?? allProducts.find((p) => p.slug === slug);
  if (!product) notFound();

  const discount = Math.round(
    (1 - product.currentPrice / product.originalPrice) * 100
  );
  const catLabel = categoryLabels[product.category] ?? product.category;
  const related = allProducts
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  // Fallback specs parsed from description
  const displaySpecs: string[] =
    product.specs ??
    product.description.split(",").map((s) => s.trim()).filter(Boolean);

  const images = product.images ?? [product.image];

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">{product.name}</h1>
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
          <div className="md:col-span-4 space-y-5">
            {/* Condition + Guarantee */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">État</p>
                  <p className="text-sm font-bold text-gray-900">
                    {product.condition ?? (product.isRefurbished ? "Produit occasion" : "Produit neuf")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Garantie</p>
                  <p className="text-sm font-bold text-gray-900">{product.guarantee ?? "12 Mois"}</p>
                </div>
              </div>
            </div>

            {/* Specs */}
            <div>
              <h3 className="text-sm font-black text-gray-900 mb-3">Les points forts</h3>
              <ul className="space-y-2">
                {displaySpecs.map((spec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    {spec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Add to devis */}
            <div className="pt-2 border-t border-gray-100">
              <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Ajouter au devis
              </button>
            </div>

            {/* Category + Share */}
            <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
              <p className="text-gray-500">
                <span className="font-bold text-gray-700">Catégorie :</span>{" "}
                <Link href={`/categorie/${product.category}`} className="text-orange-500 hover:underline">
                  {catLabel}
                </Link>
              </p>
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-700">Partager :</span>
                {[
                  { label: "f", href: "#", color: "text-blue-600" },
                  { label: "𝕏", href: "#", color: "text-gray-800" },
                  { label: "in", href: "#", color: "text-blue-700" },
                  { label: "🔗", href: "#", color: "text-gray-500" },
                ].map((s) => (
                  <a key={s.label} href={s.href} className={`${s.color} font-bold hover:opacity-70 transition-opacity text-sm`}>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Purchase box (3 cols) ── */}
          <div className="md:col-span-3">
            <div className="border border-gray-200 rounded-2xl p-5 space-y-4 sticky top-24">

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
                  {product.originalPrice.toLocaleString("fr-FR")}€
                </p>
                <div className="flex items-end gap-2">
                  <p className="text-orange-500 text-4xl font-black leading-tight">
                    {product.currentPrice.toLocaleString("fr-FR")}€
                  </p>
                  {discount > 0 && (
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg mb-1">
                      −{(product.originalPrice - product.currentPrice).toLocaleString("fr-FR")}€
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

              {/* Qty + Add to cart */}
              <div className="border-t border-gray-100 pt-4">
                <AddToCartWidget price={product.currentPrice} />
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
                  <div key={b.label} className="flex flex-col items-center text-center gap-1.5 p-2.5 rounded-xl bg-gray-50">
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
                  <div className="relative w-full max-w-md aspect-[4/3]">
                    <Image
                      src={section.image}
                      alt={section.title}
                      fill
                      className="object-contain drop-shadow-lg"
                    />
                  </div>
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
        />

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-black text-gray-900 mb-6">
              Produits <span className="text-orange-500">similaires</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <NewsletterSection />
    </div>
  );
}
