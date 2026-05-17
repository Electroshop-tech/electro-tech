import Link from "next/link";
import { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref: string;
  accentColor?: string;
}

export default function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref,
  accentColor = "cyan",
}: ProductSectionProps) {
  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="w-1 h-8 bg-orange-500 rounded-full inline-block" />
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
            </div>
            {subtitle && (
              <p className="text-sm text-slate-400 ml-4 mt-1">{subtitle}</p>
            )}
          </div>
          <Link
            href={viewAllHref}
            className="group flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-orange-200 hover:shadow-orange-300 hover:scale-105"
          >
            Voir tout
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
