"use client";

import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h2 className="text-slate-900 font-black text-lg">Nouveau produit</h2>
          <p className="text-slate-500 text-sm">Remplissez les informations ci-dessous pour créer un produit.</p>
        </div>
      </div>
      <ProductForm />
    </div>
  );
}
