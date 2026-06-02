import Link from "next/link";
import { getProducts } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tous les Produits — ElectroShop-Tech",
  description: "Parcourez tout notre catalogue : box Android TV, caméras de surveillance et accessoires high-tech au Maroc.",
};

const categoryLabels: Record<string, string> = {
  "pc-portable": "PC Portable",
  "pc-bureau": "PC de Bureau",
  "pc-gamer": "PC Gamer",
  "composants": "Composants",
  "peripheriques": "Périphériques",
  "moniteurs": "Moniteurs",
  "passerelle-multimedia": "Passerelle Multimédia",
  "accessoires": "Accessoires",
  "camera-surveillance": "Caméra de Surveillance",
};

const sortLabels: Record<string, string> = {
  pertinence: "Trier par : Pertinence",
  price_asc: "Prix croissant",
  price_desc: "Prix décroissant",
  newest: "Nouveautés",
};

export default async function ProduitsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; condition?: string; brand?: string; minPrice?: string; maxPrice?: string }>;
}) {
  const { sort = "pertinence", condition, brand, minPrice, maxPrice } = await searchParams;
  const allProducts = await getProducts();
  const categories = [...new Set(allProducts.map((p) => p.category))];
  const allBrands = [...new Set(allProducts.map((p) => p.brand).filter(Boolean))] as string[];

  let products = [...allProducts];

  // Condition filter
  if (condition === "new") {
    products = products.filter((p) => !p.isRefurbished);
  } else if (condition === "refurbished") {
    products = products.filter((p) => p.isRefurbished);
  }

  // Brand filter
  if (brand) {
    products = products.filter((p) => p.brand === brand);
  }
  // Price filter
  const minP = minPrice ? parseFloat(minPrice) : null;
  const maxP = maxPrice ? parseFloat(maxPrice) : null;
  if (minP !== null) products = products.filter((p) => p.currentPrice >= minP);
  if (maxP !== null) products = products.filter((p) => p.currentPrice <= maxP);

  // Sort
  if (sort === "price_asc") {
    products.sort((a, b) => a.currentPrice - b.currentPrice);
  } else if (sort === "price_desc") {
    products.sort((a, b) => b.currentPrice - a.currentPrice);
  } else if (sort === "newest") {
    products.sort((a, b) => b.id - a.id);
  }

  const buildUrl = (params: Record<string, string>) => {
    const p = new URLSearchParams();
    const merged = { sort, condition: condition ?? "", brand: brand ?? "", minPrice: minPrice ?? "", maxPrice: maxPrice ?? "", ...params };
    Object.entries(merged).forEach(([k, v]) => { if (v && v !== "pertinence" && v !== "") p.set(k, v); });
    const qs = p.toString();
    return `/produits${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="bg-[#f5f7fb] min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-orange-500 transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Tous les produits</span>
        </div>
      </div>

      {/* Mobile category filter pills */}
      <div className="lg:hidden bg-white border-b border-slate-200 overflow-x-auto">
        <div className="flex gap-2 px-4 py-3" style={{ whiteSpace: "nowrap" }}>
          <Link
            href="/produits"
            className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-orange-500 text-white flex-shrink-0"
          >
            Tous ({allProducts.length})
          </Link>
          {categories.map((cat) => {
            const count = allProducts.filter((p) => p.category === cat).length;
            return (
              <Link
                key={cat}
                href={`/categorie/${cat}`}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors flex-shrink-0"
              >
                {categoryLabels[cat] ?? cat}
                <span className="text-gray-400 font-medium">({count})</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="flex gap-6">

          {/* ── Sidebar filters ── */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-lg border border-slate-200/80 p-5 sticky top-24 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <h3 className="font-black text-sm text-gray-900 mb-4">Catégories</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="/produits" className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm ${!categories.includes("") ? "bg-orange-50 text-orange-500" : "text-gray-600 hover:bg-gray-50"}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    Tous les produits
                    <span className="ml-auto text-xs bg-orange-100 text-orange-500 px-1.5 py-0.5 rounded-full font-black">
                      {allProducts.length}
                    </span>
                  </Link>
                </li>
                {categories.map((cat) => {
                  const count = allProducts.filter((p) => p.category === cat).length;
                  return (
                    <li key={cat}>
                      <Link
                        href={`/categorie/${cat}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-orange-500 text-sm font-semibold transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        {categoryLabels[cat] ?? cat}
                        <span className="ml-auto text-xs text-gray-400 font-medium">{count}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <h3 className="font-black text-sm text-gray-900 mb-3">État</h3>
                <ul className="space-y-1.5">
                  <li>
                    <Link
                      href={buildUrl({ condition: condition === "new" ? "" : "new" })}
                      className={`flex items-center gap-2.5 cursor-pointer text-sm font-medium px-2 py-1 rounded-lg transition-colors ${
                        condition === "new" ? "text-orange-500 bg-orange-50" : "text-gray-600 hover:text-orange-500"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${condition === "new" ? "border-orange-500 bg-orange-500" : "border-gray-300"}`}>
                        {condition === "new" && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </span>
                      Produits neufs
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={buildUrl({ condition: condition === "refurbished" ? "" : "refurbished" })}
                      className={`flex items-center gap-2.5 cursor-pointer text-sm font-medium px-2 py-1 rounded-lg transition-colors ${
                        condition === "refurbished" ? "text-orange-500 bg-orange-50" : "text-gray-600 hover:text-orange-500"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${condition === "refurbished" ? "border-orange-500 bg-orange-500" : "border-gray-300"}`}>
                        {condition === "refurbished" && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </span>
                      Occasion / Reconditionné
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Price range */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <h3 className="font-black text-sm text-gray-900 mb-3">Prix</h3>
                <ul className="space-y-1">
                  {(([
                    { label: "Moins de 30€",  min: "",    max: "30"  },
                    { label: "30€ – 60€",     min: "30",  max: "60"  },
                    { label: "60€ – 100€",    min: "60",  max: "100" },
                    { label: "Plus de 100€",  min: "100", max: ""    },
                  ]) as { label: string; min: string; max: string }[]).map(({ label, min: pMin, max: pMax }) => {
                    const isActive = (minPrice ?? "") === pMin && (maxPrice ?? "") === pMax;
                    return (
                      <li key={label}>
                        <Link
                          href={buildUrl({ minPrice: isActive ? "" : pMin, maxPrice: isActive ? "" : pMax })}
                          className={`flex items-center gap-2.5 text-sm font-medium px-2 py-1 rounded-lg transition-colors ${
                            isActive ? "text-orange-500 bg-orange-50" : "text-gray-600 hover:text-orange-500"
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                            isActive ? "border-orange-500 bg-orange-500" : "border-gray-300"
                          }`}>
                            {isActive && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </span>
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Brand filter */}
              {allBrands.length > 1 && (
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <h3 className="font-black text-sm text-gray-900 mb-3">Marque</h3>
                  <ul className="space-y-1">
                    {allBrands.map((b) => {
                      const isActive = brand === b;
                      return (
                        <li key={b}>
                          <Link
                            href={buildUrl({ brand: isActive ? "" : b })}
                            className={`flex items-center gap-2.5 text-sm font-medium px-2 py-1 rounded-lg transition-colors ${
                              isActive ? "text-orange-500 bg-orange-50" : "text-gray-600 hover:text-orange-500"
                            }`}
                          >
                            <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                              isActive ? "border-orange-500 bg-orange-500" : "border-gray-300"
                            }`}>
                              {isActive && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </span>
                            {b}
                            <span className="ml-auto text-xs text-gray-400">{allProducts.filter((p) => p.brand === b).length}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {(sort !== "pertinence" || condition || brand || minPrice || maxPrice) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link href="/produits" className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-orange-500 font-semibold transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Réinitialiser les filtres
                  </Link>
                </div>
              )}
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1">
            {/* Header row */}
            <div className="mb-5">
              <h1 className="text-xl font-black text-gray-900">
                Tous les <span className="text-orange-500">produits</span>
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {products.length} produit{products.length !== 1 ? "s" : ""}
                {products.length !== allProducts.length && ` (sur ${allProducts.length})`}
              </p>
            </div>

            {/* Sort pills (visible alternative to select) */}
            <div className="flex flex-wrap gap-2 mb-5">
              {Object.entries(sortLabels).map(([val, label]) => (
                <Link
                  key={val}
                  href={buildUrl({ sort: val })}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    sort === val
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500"
                  }`}
                >
                  {label.replace("Trier par : ", "")}
                </Link>
              ))}
              {condition && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                  {condition === "new" ? "Neufs" : "Reconditionnés"}
                  <Link href={buildUrl({ condition: "" })} className="hover:text-red-500 transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </Link>
                </span>
              )}
            </div>

            {/* Grid */}
            {products.length === 0 ? (
              <div className="text-center py-24 text-gray-400">
                <p className="text-lg font-bold mb-2">Aucun produit ne correspond à vos filtres.</p>
                <Link href="/produits" className="text-orange-500 hover:underline text-sm font-semibold">Réinitialiser les filtres</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

