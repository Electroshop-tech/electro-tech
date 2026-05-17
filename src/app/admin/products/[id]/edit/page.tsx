"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import type { Product } from "@/lib/types";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "admin1234";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/products/${id}`, { headers: { "x-admin-key": ADMIN_KEY } })
      .then((r) => {
        if (!r.ok) throw new Error("Produit introuvable");
        return r.json();
      })
      .then(setProduct)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 text-sm">
        {error || "Produit introuvable"}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h2 className="text-slate-900 font-black text-lg">Modifier : {product.name}</h2>
          <p className="text-slate-500 text-sm">Modifiez les informations du produit.</p>
        </div>
      </div>
      <ProductForm initial={product} productId={product.id} />
    </div>
  );
}
