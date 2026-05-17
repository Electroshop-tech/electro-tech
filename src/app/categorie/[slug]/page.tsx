import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProducts, getCategories } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
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
    img: "/Categories images/passerelle multimedia.png",
    heroImg: "/Categories images/box tv image page.png",
    features: ["4K Ultra HD", "Android TV", "Wi-Fi intégré", "Netflix & YouTube"],
  },
  "accessoires": {
    description: "Télécommandes universelles, câbles HDMI, supports et accessoires pour votre home cinéma.",
    longDesc: "Complétez votre installation avec nos accessoires soigneusement sélectionnés. Télécommandes universelles compatibles avec toutes les box, câbles HDMI haute vitesse, supports et bien plus encore.",
    gradient: "from-blue-700 to-blue-500",
    img: "/Categories images/accessoires.png",
    heroImg: "/Categories images/acessoires image page.png",
    features: ["Compatibilité universelle", "Qualité premium", "Garantie incluse", "Livraison rapide"],
  },
  "camera-surveillance": {
    description: "Caméras IP, kits DVR/NVR et systèmes de vidéosurveillance pour sécuriser votre domicile.",
    longDesc: "Sécurisez votre maison, bureau ou commerce avec nos systèmes de vidéosurveillance professionnels. Caméras IP Full HD, enregistreurs DVR/NVR, kits complets et accessoires installés facilement.",
    gradient: "from-purple-700 to-purple-500",
    img: "/Categories images/camera de surveillance.png",
    heroImg: "/Categories images/camera image page.png",
    features: ["Full HD / 4K", "Vision nocturne", "Détection de mouvement", "Application mobile"],
  },
};

const sortLabels: Record<string, string> = {
  "default":      "Par défaut",
  "price-asc":    "Prix croissant",
  "price-desc":   "Prix décroissant",
  "discount":     "Meilleures remises",
};

export function generateStaticParams() {
  return getCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = getCategories().find((c) => c.slug === slug);
  const meta = categoryMeta[slug];
  if (!cat) return {};
  return {
    title: `${cat.name} — ElectroShop-Tech.ma`,
    description: meta?.description ?? `Découvrez notre gamme ${cat.name}`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = getCategories();
  const allProducts = getProducts();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  const meta = categoryMeta[slug];
  const products = allProducts.filter((p) => p.category === slug);

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Category hero ── */}
      <div className={`relative bg-gradient-to-r ${meta?.gradient ?? "from-slate-800 to-slate-700"} text-white overflow-hidden h-[300px] sm:h-[400px] lg:h-[520px]`}>
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/20" />
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">

          {/* ── Sidebar ── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-3">

              {/* Categories card */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-4 pt-4 pb-2 border-b border-gray-50">
                  <h3 className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Catégories</h3>
                </div>
                <ul className="p-2 space-y-0.5">
                  <li>
                    <Link
                      href="/produits"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-800 text-sm font-medium transition-all group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center group-hover:bg-orange-50 group-hover:border-orange-200 transition-all flex-shrink-0">
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </div>
                      <span className="flex-1 truncate">Tous les produits</span>
                      <span className="text-[11px] font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 flex-shrink-0">{allProducts.length}</span>
                    </Link>
                  </li>
                  {categories.map((c) => {
                    const count = allProducts.filter((p) => p.category === c.slug).length;
                    const isActive = c.slug === slug;
                    const iconFile = c.slug === "passerelle-multimedia" ? "passerelle multimedia" : c.slug === "accessoires" ? "accessoires" : "camera de surveillance";
                    return (
                      <li key={c.slug}>
                        <Link
                          href={`/categorie/${c.slug}`}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            isActive
                              ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                            isActive ? "bg-white/25 border-white/30" : "bg-white border-gray-200 shadow-sm"
                          }`}>
                            <Image
                              src={`/Categories images/${iconFile}.png`}
                              alt={c.name}
                              width={22}
                              height={22}
                              className="object-contain w-5 h-5"
                            />
                          </div>
                          <span className="flex-1 truncate">{c.name}</span>
                          <span className={`text-[11px] font-bold rounded-full px-2 py-0.5 flex-shrink-0 ${
                            isActive ? "bg-white/25 text-white" : "bg-gray-100 text-gray-400"
                          }`}>
                            {count}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Filters card */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-4 pt-4 pb-2 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Filtres</h3>
                  <button className="text-[11px] text-orange-500 font-semibold hover:underline">Réinitialiser</button>
                </div>

                <div className="p-4 space-y-5">
                  {/* Condition */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-2.5">État du produit</p>
                    <div className="space-y-2">
                      {[
                        { label: "Produit neuf", icon: "✦" },
                        { label: "Reconditionné", icon: "↻" },
                      ].map(({ label, icon }) => (
                        <label key={label} className="flex items-center gap-3 cursor-pointer group">
                          <div className="w-4 h-4 rounded border-2 border-gray-200 group-hover:border-orange-400 flex items-center justify-center flex-shrink-0 transition-colors">
                            <input type="checkbox" className="sr-only" />
                          </div>
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors font-medium">{label}</span>
                          <span className="ml-auto text-base leading-none text-gray-300">{icon}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-4 border-t border-gray-50">
                    <p className="text-xs font-bold text-gray-500 mb-2.5">Fourchette de prix</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">MAD</span>
                      </div>
                      <div className="w-4 h-px bg-gray-300 flex-shrink-0" />
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          placeholder="Max"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">MAD</span>
                      </div>
                    </div>
                    <button className="mt-3 w-full text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 py-2.5 rounded-xl transition-all shadow-md shadow-orange-100">
                      Appliquer le filtre
                    </button>
                  </div>

                  {/* Stock toggle */}
                  <div className="pt-4 border-t border-gray-50">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">En stock</p>
                        <p className="text-[11px] text-gray-400">Afficher uniquement les disponibles</p>
                      </div>
                      <div className="relative flex-shrink-0">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-gray-200 peer-checked:bg-orange-500 rounded-full transition-colors" />
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-all peer-checked:translate-x-4" />
                      </div>
                    </label>
                  </div>
                </div>
              </div>

            </div>
          </aside>

          {/* ── Main ── */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <p className="text-sm text-gray-500">
                <span className="font-bold text-gray-900">{products.length}</span>{" "}
                {products.length === 1 ? "résultat" : "résultats"} dans{" "}
                <span className="font-semibold text-orange-600">{cat.name}</span>
              </p>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 font-medium">Trier :</label>
                <select className="flex-1 sm:flex-none border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700 outline-none bg-white focus:border-orange-400 cursor-pointer">
                  {Object.entries(sortLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product grid or empty state */}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className={`w-20 h-20 bg-gradient-to-br ${meta?.gradient ?? "from-gray-200 to-gray-300"} rounded-3xl flex items-center justify-center mb-5 opacity-60 overflow-hidden`}>
                  {meta?.img && (
                    <Image src={meta.img} alt={cat.name} width={60} height={60} className="object-contain w-14 h-14" />
                  )}
                </div>
                <h2 className="text-lg font-black text-gray-800 mb-2">Bientôt disponible</h2>
                <p className="text-sm text-gray-500 max-w-xs mb-6">
                  Nos produits <strong>{cat.name}</strong> arrivent très prochainement.
                  Inscrivez-vous pour être notifié en premier !
                </p>
                <Link
                  href="/produits"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-colors"
                >
                  Voir tous les produits
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <NewsletterSection />
    </div>
  );
}
