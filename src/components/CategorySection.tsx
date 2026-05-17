import Link from "next/link";
import { categories } from "@/lib/data";

export default function CategorySection() {
  return (
    <section className="py-8 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-6 md:gap-4 flex-wrap">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorie/${cat.slug}`}
              className="group flex flex-col items-center gap-2.5 w-20 md:w-24"
            >
              {/* Circle icon */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#fdf3ee] group-hover:bg-orange-100 flex items-center justify-center text-3xl md:text-4xl transition-all duration-200 group-hover:scale-105 shadow-sm group-hover:shadow-md">
                {cat.icon}
              </div>
              <span className="text-[11px] md:text-xs font-semibold text-slate-700 group-hover:text-orange-500 text-center leading-tight transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
