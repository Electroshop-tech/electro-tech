import Link from "next/link";
import { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref: string;
  accentColor?: string;
  mobileScroll?: boolean;
}

export default function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref,
  accentColor = "cyan",
  mobileScroll = false,
}: ProductSectionProps) {
  return (
    <section className="py-12 sm:py-14 bg-[#f5f7fb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div data-reveal="up" className="flex items-end justify-between mb-7 sm:mb-9 gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="mt-1 w-1.5 h-9 rounded-full shrink-0 inline-block bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 shadow-[0_4px_12px_rgba(249,115,22,0.35)]" />
            <div className="min-w-0">
              <span className="inline-block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.18em] text-orange-600 mb-1">
                Sélection ElectroShop
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 tracking-tight truncate">{title}</h2>
              {subtitle && (
                <p className="block text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          <Link
            href={viewAllHref}
            className="shrink-0 group flex items-center gap-1.5 bg-gradient-to-br from-slate-900 to-slate-950 hover:from-orange-500 hover:to-orange-600 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-5 py-2.5 rounded-xl transition-all duration-300 shadow-[0_10px_24px_rgba(15,23,42,0.14)] hover:shadow-[0_14px_30px_rgba(249,115,22,0.30)] hover:-translate-y-0.5 ring-1 ring-white/5"
          >
            Voir tout
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Products */}
        {mobileScroll ? (
          <div className="flex gap-3 overflow-x-auto pb-3 sm:pb-0 sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-5 lg:gap-6 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {products.map((product, i) => (
              <div key={product.id} data-reveal="up" data-reveal-delay={String(i * 70)} className="shrink-0 w-[260px] sm:w-auto snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {products.map((product, i) => (
              <div key={product.id} data-reveal="up" data-reveal-delay={String(i * 70)}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
