"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "admin1234";

interface Stats {
  products: number;
  categories: number;
  brands: number;
  heroSlides: number;
  inStock: number;
  outOfStock: number;
}

const quickLinks = [
  { href: "/admin/products/new", label: "Ajouter un produit", color: "bg-orange-500 hover:bg-orange-600", icon: "M12 4v16m8-8H4" },
  { href: "/admin/categories", label: "Gérer les catégories", color: "bg-blue-500 hover:bg-blue-600", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
  { href: "/admin/brands", label: "Gérer les marques", color: "bg-violet-500 hover:bg-violet-600", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
  { href: "/admin/hero", label: "Gérer les bannières", color: "bg-emerald-500 hover:bg-emerald-600", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", { headers: { "x-admin-key": ADMIN_KEY } })
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: "Produits", value: stats.products, sub: `${stats.inStock} en stock`, color: "text-orange-500", bg: "bg-orange-500/10" },
        { label: "Catégories", value: stats.categories, sub: "catégories actives", color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Marques", value: stats.brands, sub: "marques référencées", color: "text-violet-500", bg: "bg-violet-500/10" },
        { label: "Bannières Hero", value: stats.heroSlides, sub: "slides configurés", color: "text-emerald-500", bg: "bg-emerald-500/10" },
      ]
    : [];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-black mb-1">Bienvenue dans l&apos;administration 👋</h2>
        <p className="text-slate-400 text-sm">Gérez vos produits, catégories, marques et bannières depuis ce tableau de bord.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse">
                <div className="w-10 h-10 bg-gray-100 rounded-xl mb-3" />
                <div className="h-7 bg-gray-100 rounded w-12 mb-1" />
                <div className="h-4 bg-gray-100 rounded w-24" />
              </div>
            ))
          : statCards.map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <span className={`${s.color} font-black text-sm`}>#</span>
                </div>
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
                <div className="text-slate-400 text-[11px] mt-1">{s.sub}</div>
              </div>
            ))}
      </div>

      {/* Quick links */}
      <div>
        <h3 className="text-slate-900 font-black text-sm uppercase tracking-widest mb-3">Actions rapides</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickLinks.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className={`${q.color} text-white rounded-2xl p-4 flex items-center gap-3 transition-colors shadow-sm`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={q.icon} />
              </svg>
              <span className="font-bold text-sm">{q.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Out of stock warning */}
      {stats && stats.outOfStock > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-red-700 font-black text-sm">{stats.outOfStock} produit{stats.outOfStock > 1 ? "s" : ""} hors stock</p>
            <p className="text-red-500 text-xs mt-0.5">Mettez à jour le stock de vos produits.</p>
            <Link href="/admin/products" className="inline-block mt-2 text-red-600 font-bold text-xs underline">
              Voir les produits →
            </Link>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-700">
        <p className="font-bold mb-1">💡 Comment ça fonctionne</p>
        <p className="text-blue-600 text-xs leading-relaxed">
          Les données sont sauvegardées dans <code className="bg-blue-100 px-1 rounded">data/db.json</code>. 
          Les modifications sont immédiatement prises en compte sur le site public lors du prochain rechargement de page.
        </p>
      </div>
    </div>
  );
}
