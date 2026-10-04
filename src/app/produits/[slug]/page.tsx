import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getProducts, getProductBySlug } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import ProductReviews from "@/components/ProductReviews";
import NewsletterSection from "@/components/NewsletterSection";
import ProductDetail from "@/components/ProductDetail";
import detailStyles from "@/components/ProductDetailPremium.module.css";
import MobileStickyCart from "@/components/MobileStickyCart";
import RecentlyViewed from "@/components/RecentlyViewed";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produit introuvable" };
  const title = product.metaTitle?.trim() || `${product.name} | ElectroShop-Tech`;
  const description = product.metaDescription?.trim() || product.description?.substring(0, 160) || `Achetez ${product.name} au meilleur prix sur ElectroShop-Tech.`;
  const image = product.images?.[0] || "/images/3D%20hero%20section/3D%20Hero%20section%201.jpg";
  const canonical = `https://electroshop-tech.com/produits/${slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, images: [image], type: "website", url: canonical },
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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const allProducts = await getProducts();
  const product = (await getProductBySlug(slug)) ?? allProducts.find((p) => p.slug === slug);
  if (!product) notFound();

  const catLabel = categoryLabels[product.category] ?? product.category;
  const related = allProducts
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .sort((a, b) => b.id - a.id)
    .slice(0, 4);

  const images = product.images?.length ? product.images : [product.image];

  // Only show approved reviews publicly (legacy reviews without the flag stay visible)
  const visibleReviews = (product.productReviews ?? []).filter((r) => r.approved !== false);

  const avgRating =
    visibleReviews.length > 0
      ? Math.round(visibleReviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / visibleReviews.length * 10) / 10
      : null;

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
    ...(avgRating && visibleReviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: visibleReviews.length,
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
    <div className="bg-[#f7f8fa] min-h-screen pb-20 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {/* Breadcrumb */}
      <div className="border-b border-slate-200/60">
        <Link href={`/categorie/${product.category}`} className={detailStyles.mobileBreadcrumb}>
          <span aria-hidden="true">←</span> {catLabel}
        </Link>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 hidden md:flex items-center gap-2 text-xs text-gray-500 flex-wrap">
          <Link href="/" className="hover:text-orange-500 transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/produits" className="hover:text-orange-500 transition-colors">Produits</Link>
          <span>/</span>
          <Link href={`/categorie/${product.category}`} className="hover:text-orange-500 transition-colors">{catLabel}</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 md:py-8">
        <ProductDetail product={product} images={images} category={catLabel} rating={avgRating} reviewCount={visibleReviews.length} />

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
                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-800 mb-5">
                    {section.title}
                  </h2>
                  {section.body.split("\n\n").map((para, j) => (
                    <p key={j} className={`text-base leading-relaxed mb-4 text-slate-500`}>
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
        <div id="product-reviews" className="scroll-mt-8">
        <ProductReviews
          initialReviews={visibleReviews}
          productName={product.name}
          productSlug={product.slug}
        />
        </div>

        {/* Recently viewed */}
        <RecentlyViewed products={allProducts} currentSlug={product.slug} />

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-black text-gray-900 mb-6">
              Produits <span className="text-orange-500">similaires</span>
            </h2>
              <div className="flex gap-4 overflow-x-auto pb-3 sm:pb-0 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-4 sm:gap-4 lg:gap-5">
              {related.map((p) => (
                <div key={p.id} className="shrink-0 w-[220px] xs:w-[240px] sm:w-auto snap-start">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <NewsletterSection />
      {product.inStock !== false && <MobileStickyCart product={{
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.currentPrice,
        originalPrice: product.originalPrice,
        image: product.image,
        slug: product.slug,
      }} />}
    </div>
  );
}
