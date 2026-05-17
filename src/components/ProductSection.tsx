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
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1 h-8 bg-orange-500 rounded-full shrink-0 inline-block" />
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight truncate">{title}</h2>
              {subtitle && (
                <p className="hidden sm:block text-sm text-slate-400 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <Link
            href={viewAllHref}
            className="shrink-0 group flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-orange-200 hover:shadow-orange-300 hover:scale-105"
          >
            Voir tout
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Products — horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-3 overflow-x-auto pb-3 sm:pb-0 sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-5 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {products.map((product) => (
            <div key={product.id} className="shrink-0 w-[165px] sm:w-auto snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
