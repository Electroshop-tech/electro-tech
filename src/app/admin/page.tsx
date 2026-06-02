"use client";

import { useEffect, useState } from "react";
import Link from "next/link";


interface Stats {
  products: number;
  categories: number;
  brands: number;
  heroSlides: number;
  inStock: number;
  outOfStock: number;
  orders: number;
  pendingOrders: number;
  revenue: number;
  subscribers: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
}

const quickLinks = [
  { href: "/admin/products/new", label: "Ajouter un produit", color: "bg-orange-500 hover:bg-orange-600", icon: "M12 4v16m8-8H4" },
  { href: "/admin/categories", label: "Gérer les catégories", color: "bg-blue-500 hover:bg-blue-600", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
  { href: "/admin/newsletter", label: "Envoyer une newsletter", color: "bg-violet-500 hover:bg-violet-600", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { href: "/admin/orders", label: "Voir les commandes", color: "bg-emerald-500 hover:bg-emerald-600", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats", { credentials: "include" })
        .then((r) => r.json())
        .then(setStats),
      fetch("/api/admin/orders")
        .then((r) => r.json())
        .then((d) => setRecentOrders((d.orders ?? []).slice(0, 5))),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: "Produits", value: stats.products, sub: `${stats.inStock} en stock · ${stats.outOfStock} épuisés`, color: "text-orange-500", bg: "bg-orange-500/10" },
        { label: "Commandes", value: stats.orders, sub: `${stats.pendingOrders} en attente`, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Chiffre d'affaires", value: `${stats.revenue.toLocaleString()}€`, sub: "total cumulé", color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Abonnés newsletter", value: stats.subscribers, sub: "inscrits confirmés", color: "text-violet-500", bg: "bg-violet-500/10" },
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

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-900 font-black text-sm uppercase tracking-widest">Dernières commandes</h3>
          <Link href="/admin/orders" className="text-orange-500 hover:text-orange-600 text-xs font-bold">
            Voir tout →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <p className="text-gray-400 text-sm">Aucune commande pour le moment</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Commande</th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Client</th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Total</th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Statut</th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => {
                  const statusConfig: Record<string, { label: string; color: string }> = {
                    pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
                    confirmed: { label: "Confirmée", color: "bg-blue-100 text-blue-700" },
                    shipped: { label: "Expédiée", color: "bg-purple-100 text-purple-700" },
                    delivered: { label: "Livrée", color: "bg-green-100 text-green-700" },
                    cancelled: { label: "Annulée", color: "bg-red-100 text-red-700" },
                  };
                  const s = statusConfig[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-700" };
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-800 text-xs">
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800 text-xs">{order.customerName}</p>
                        <p className="text-[11px] text-gray-400">{order.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900 text-xs">{order.total.toFixed(2)}€</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${s.color}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notification email info */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-sm text-green-700">
        <p className="font-bold mb-1">📧 Notifications par e-mail</p>
        <p className="text-green-600 text-xs leading-relaxed">
          Les notifications de commande et de contact sont envoyées automatiquement à <code className="bg-green-100 px-1 rounded font-bold">contact.electrotetch@gmail.com</code>.
          Configurez <code className="bg-green-100 px-1 rounded">RESEND_API_KEY</code> dans les variables d&apos;environnement pour activer l&apos;envoi.
        </p>
      </div>

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
