import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProducts, getCategories } from "@/lib/store";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import NewsletterSection from "@/components/NewsletterSection";

export const dynamic = "force-dynamic";

const categoryMeta: Record<string, {
  description: string;
  longDesc: string;
  gradient: string;
  img: string;
  heroImg: string;
  features: string[];
}> = {
  "passerelle-multimedia": {
    description: "Box TV Android et TV Sticks 4K pour transformer n'importe quelle télévision en Smart TV.",
    longDesc: "Transformez votre télévision en Smart TV avec nos box Android et TV Sticks. Accédez à Netflix, YouTube, Prime Video et des milliers d'applications directement sur votre écran — sans abonnement supplémentaire.",
    gradient: "from-orange-600 to-orange-500",
    img: "/Categories images/passerelle multimedia.jpg",
    heroImg: "/Categories images/box tv image page.jpg",
    features: ["4K Ultra HD", "Android TV", "Wi-Fi intégré", "Netflix & YouTube"],
  },
  "accessoires": {
    description: "Télécommandes universelles, câbles HDMI, supports et accessoires pour votre home cinéma.",
    longDesc: "Complétez votre installation avec nos accessoires soigneusement sélectionnés. Télécommandes universelles compatibles avec toutes les box, câbles HDMI haute vitesse, supports et bien plus encore.",
    gradient: "from-blue-700 to-blue-500",
    img: "/Categories images/accessoires.jpg",
    heroImg: "/Categories images/acessoires image page.jpg",
    features: ["Compatibilité universelle", "Qualité premium", "Garantie incluse", "Livraison rapide"],
  },
  "camera-surveillance": {
    description: "Caméras IP, kits DVR/NVR et systèmes de vidéosurveillance pour sécuriser votre domicile.",
    longDesc: "Sécurisez votre maison, bureau ou commerce avec nos systèmes de vidéosurveillance professionnels. Caméras IP Full HD, enregistreurs DVR/NVR, kits complets et accessoires installés facilement.",
    gradient: "from-purple-700 to-purple-500",
    img: "/Categories images/camera de surveillance.jpg",
    heroImg: "/Categories images/camera image page.jpg",
    features: ["Full HD / 4K", "Vision nocturne", "Détection de mouvement", "Application mobile"],
  },
};

const sortLabels: Record<string, string> = {
  "default":      "Par défaut",
  "price-asc":    "Prix croissant",
  "price-desc":   "Prix décroissant",
  "discount":     "Meilleures remises",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = (await getCategories()).find((c) => c.slug === slug);
  const meta = categoryMeta[slug];
  if (!cat) return {};
  const title = `${cat.name} — ElectroShop-Tech`;
  const description = meta?.description ?? `Découvrez notre gamme ${cat.name}`;
  const canonical = `https://electroshop-tech.com/categorie/${slug}`;
  const image = meta?.heroImg ?? "/images/3D%20hero%20section/3D%20Hero%20section%201.jpg";
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, type: "website", url: canonical, images: [{ url: image, width: 1200, height: 630, alt: cat.name }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await getCategories();
  const allProducts = await getProducts();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  const meta = categoryMeta[slug];
  const products = allProducts.filter((p) => p.category === slug);

  return (
    <div className="bg-[#f5f7fb] min-h-screen">

      {/* ── Category hero ── */}
      <div className={`relative bg-gradient-to-r ${meta?.gradient ?? "from-slate-800 to-slate-700"} text-white overflow-hidden h-[300px] sm:h-[390px] lg:h-[500px]`}>
        {/* Full-bleed image — fills container, cropped to banner height */}
        {meta?.heroImg && (
          <Image
            src={meta.heroImg}
            alt={cat.name}
            fill
            className="object-cover object-center"
            priority
          />
        )}
        {/* Dark gradient overlay on top of image */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/62 to-black/18" />
        {/* Subtle dot-grid */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        {/* ── Text content ── */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
            <div className="max-w-lg">

              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs text-white/40 mb-5">
                <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
                <span>/</span>
                <Link href="/produits" className="hover:text-white transition-colors">Produits</Link>
                <span>/</span>
                <span className="text-white/75 font-semibold">{cat.name}</span>
              </nav>

              {/* Compact category badge */}
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full pl-1.5 pr-3 py-1 mb-5 backdrop-blur-sm">
                {meta?.img && (
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                    <Image src={meta.img} alt="" width={14} height={14} className="object-contain w-3.5 h-3.5" />
                  </div>
                )}
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/75">{cat.name}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-3 leading-none tracking-tight">{cat.name}</h1>

              {/* Description — short version */}
              <p className="hidden sm:block text-white/65 text-sm leading-relaxed mb-5 max-w-sm">
                {meta?.description}
              </p>

              {/* Feature pills */}
              {meta?.features && (
                <div className="hidden sm:flex flex-wrap gap-2 mb-7">
                  {meta.features.map((f) => (
                    <span key={f} className="inline-flex items-center gap-1.5 bg-white/10 text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
                      <svg className="w-2.5 h-2.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="flex items-center gap-4">
                <Link
                  href="#products"
                  className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold text-sm px-6 py-3 rounded-xl hover:bg-orange-50 transition-all shadow-xl shadow-black/30"
                >
                  Voir les {products.length} produit{products.length > 1 ? "s" : ""}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <span className="text-white/35 text-xs font-medium">Livraison au Maroc</span>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <CategoryProductGrid
          products={products}
          categoryName={cat.name}
          categoryGradient={meta?.gradient ?? "from-gray-200 to-gray-300"}
          categoryImg={meta?.img}
        />
      </div>

      <NewsletterSection />
    </div>
  );
}
