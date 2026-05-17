import Link from "next/link";
import { getProducts } from "@/lib/store";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

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

export default function ProduitsPage() {
  const allProducts = getProducts();
  const categories = [...new Set(allProducts.map((p) => p.category))];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-orange-500 transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Tous les produits</span>
        </div>
      </div>

      {/* Mobile category filter pills */}
      <div className="lg:hidden bg-white border-b border-gray-100 overflow-x-auto">
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

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        <div className="flex gap-6">

          {/* ── Sidebar filters ── */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
              <h3 className="font-black text-sm text-gray-900 mb-4">Catégories</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="/produits" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 text-orange-500 font-bold text-sm">
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
                  {["Produits neufs", "Occasion / Reconditionné"].map((label) => (
                    <li key={label}>
                      <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-600 hover:text-orange-500 transition-colors font-medium">
                        <input type="checkbox" className="rounded accent-orange-500" />
                        {label}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <h1 className="text-xl font-black text-gray-900">
                  Tous les <span className="text-orange-500">produits</span>
                </h1>
                <p className="text-gray-400 text-sm mt-0.5">{allProducts.length} produits disponibles</p>
              </div>
              <select className="w-full sm:w-auto border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option>Trier par : Pertinence</option>
                <option>Prix croissant</option>
                <option>Prix décroissant</option>
                <option>Nouveautés</option>
              </select>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {allProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
