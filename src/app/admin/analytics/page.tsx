"use client";

import { useEffect, useState, useCallback } from "react";


interface TopPage  { url: string; count: number }
interface TopRef   { source: string; count: number }
interface DayViews { date: string; count: number }

interface Stats {
  // store metrics
  products: number; inStock: number; outOfStock: number;
  categories: number; brands: number; heroSlides: number;
  orders: number; pendingOrders: number; revenue: number; subscribers: number;
  // traffic
  liveVisitors: number;
  todayViews: number; yesterdayViews: number;
  todayUnique: number; yesterdayUnique: number;
  totalViews: number;
  topPages: TopPage[];
  topReferrers: TopRef[];
  devices: { mobile: number; tablet: number; desktop: number };
  dailyViews: DayViews[];
}

// ── small helpers ─────────────────────────────────────────────────────────────
function delta(today: number, yesterday: number) {
  if (yesterday === 0) return today > 0 ? "+100%" : "—";
  const pct = Math.round(((today - yesterday) / yesterday) * 100);
  return (pct >= 0 ? "+" : "") + pct + "%";
}
function deltaColor(today: number, yesterday: number) {
  if (today >= yesterday) return "text-emerald-600";
  return "text-red-500";
}
function pageName(url: string) {
  if (url === "/" || url === "") return "Accueil";
  return url.replace(/^\//, "").replace(/-/g, " ").split("/").join(" › ") || url;
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

// ── sub-components ────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color, textColor, icon }: {
  label: string; value: string | number; sub: string;
  color: string; textColor: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-3.5 sm:p-5 flex items-center gap-3">
      <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <span className={textColor}>{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base sm:text-xl font-black text-gray-900 leading-tight truncate">{value}</p>
        <p className="text-[11px] sm:text-xs font-semibold text-gray-500 mt-0.5 truncate">{label}</p>
        <p className="text-[10px] sm:text-[11px] text-gray-400 truncate">{sub}</p>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest mb-3 sm:mb-4">{children}</h2>;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/stats", { credentials: "include" })
      .then(r => r.json())
      .then((d: Stats) => { setStats(d); setLoading(false); setLastRefresh(new Date()); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 30_000); // refresh every 30s
    return () => clearInterval(iv);
  }, [load]);

  const s = stats;

  // ── daily chart max ────────────────────────────────────────────────────────
  const chartMax = s ? Math.max(...s.dailyViews.map(d => d.count), 1) : 1;

  // ── device total ──────────────────────────────────────────────────────────
  const devTotal = s ? (s.devices.mobile + s.devices.tablet + s.devices.desktop) || 1 : 1;

  return (
    <div className="p-3 sm:p-6 space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-black text-gray-900 truncate">Analytiques</h1>
          <p className="text-gray-400 text-[11px] sm:text-sm mt-0.5 hidden sm:block">Données réelles · actualisation auto toutes les 30 s</p>
          {lastRefresh && <p className="text-[10px] text-gray-300 sm:hidden">{lastRefresh.toLocaleTimeString("fr-FR")}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {s && (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-xl px-2.5 py-1.5">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-sm font-black text-emerald-700">{s.liveVisitors}</span>
              <span className="text-[11px] text-emerald-600 font-semibold hidden xs:inline">en ligne</span>
            </div>
          )}
          <button onClick={load} title="Actualiser"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Last refresh — desktop only */}
      {lastRefresh && (
        <p className="text-[11px] text-gray-300 -mt-4 hidden sm:block">
          Dernière mise à jour : {lastRefresh.toLocaleTimeString("fr-FR")}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="w-11 h-11 bg-gray-100 rounded-xl mb-4" />
              <div className="h-6 bg-gray-100 rounded w-16 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
      ) : !s ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-sm font-semibold">Impossible de charger les statistiques</p>
        </div>
      ) : (
        <>
          {/* ── Section 1: Traffic today ─────────────────────────────────── */}
          <section>
            <SectionTitle>Trafic aujourd&apos;hui</SectionTitle>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Live visitors */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">En direct</span>
                </div>
                <p className="text-4xl font-black text-gray-900">{s.liveVisitors}</p>
                <p className="text-xs text-gray-400 mt-1">visiteurs actifs (5 min)</p>
              </div>
              {/* Today views */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Pages vues</p>
                <p className="text-3xl font-black text-gray-900">{s.todayViews.toLocaleString()}</p>
                <p className={`text-xs font-semibold mt-1 ${deltaColor(s.todayViews, s.yesterdayViews)}`}>
                  {delta(s.todayViews, s.yesterdayViews)} vs hier
                </p>
              </div>
              {/* Unique visitors today */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Visiteurs uniques</p>
                <p className="text-3xl font-black text-gray-900">{s.todayUnique.toLocaleString()}</p>
                <p className={`text-xs font-semibold mt-1 ${deltaColor(s.todayUnique, s.yesterdayUnique)}`}>
                  {delta(s.todayUnique, s.yesterdayUnique)} vs hier
                </p>
              </div>
              {/* Total views all time */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Total vues (cumulé)</p>
                <p className="text-3xl font-black text-gray-900">{s.totalViews.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">depuis le lancement</p>
              </div>
            </div>
          </section>

          {/* ── Section 2: Daily chart ───────────────────────────────────── */}
          <section>
            <SectionTitle>Pages vues — 14 derniers jours</SectionTitle>
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <div className="overflow-x-auto -mx-1 px-1">
                <div className="flex items-end gap-1.5 h-28 sm:h-32" style={{ minWidth: "320px" }}>
                  {s.dailyViews.map((d) => (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 group">
                      <div className="relative w-full flex items-end justify-center" style={{ height: "88px" }}>
                        <div
                          title={`${fmtDate(d.date)}: ${d.count} vue${d.count !== 1 ? "s" : ""}`}
                          className="w-full rounded-t-md bg-gradient-to-t from-orange-500 to-orange-400 transition-all duration-500 cursor-default"
                          style={{ height: `${(d.count / chartMax) * 100}%`, minHeight: d.count > 0 ? "4px" : "0" }}
                        />
                      </div>
                      <span className="text-[8px] sm:text-[9px] text-gray-400 font-medium truncate w-full text-center">
                        {fmtDate(d.date).split(" ")[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {chartMax <= 1 && (
                <p className="text-center text-[11px] text-gray-300 mt-3">Aucune visite — naviguez sur le site pour voir les données</p>
              )}
            </div>
          </section>

          {/* ── Section 3: Top pages + Referrers ────────────────────────── */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Top pages */}
            <section className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <SectionTitle>Pages les plus visitées</SectionTitle>
              {s.topPages.length === 0 ? (
                <p className="text-sm text-gray-300 text-center py-6">Pas encore de données</p>
              ) : (
                <div className="space-y-3">
                  {s.topPages.map((p, i) => (
                    <div key={p.url} className="flex items-center gap-3">
                      <span className="text-xs font-black text-gray-300 w-4">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-700 truncate capitalize">{pageName(p.url)}</span>
                          <span className="text-xs font-black text-gray-500 ml-2 shrink-0">{p.count.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                            style={{ width: `${(p.count / s.topPages[0].count) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Top referrers */}
            <section className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <SectionTitle>Sources de trafic</SectionTitle>
              {s.topReferrers.length === 0 ? (
                <p className="text-sm text-gray-300 text-center py-6">Pas encore de données</p>
              ) : (
                <div className="space-y-3">
                  {s.topReferrers.map((r, i) => (
                    <div key={r.source} className="flex items-center gap-3">
                      <span className="text-xs font-black text-gray-300 w-4">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-700 truncate">{r.source}</span>
                          <span className="text-xs font-black text-gray-500 ml-2 shrink-0">{r.count.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full"
                            style={{ width: `${(r.count / s.topReferrers[0].count) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ── Section 4: Devices ──────────────────────────────────────── */}
          <section>
            <SectionTitle>Appareils</SectionTitle>
            {/* On mobile: stacked list. On sm+: 3-col grid */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 sm:divide-y-0 sm:grid sm:grid-cols-3 sm:gap-0 sm:bg-transparent sm:border-none sm:shadow-none">
              {[
                { label: "Mobile", key: "mobile" as const, color: "bg-orange-400", light: "bg-orange-50", text: "text-orange-600",
                  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
                { label: "Tablette", key: "tablet" as const, color: "bg-sky-400", light: "bg-sky-50", text: "text-sky-600",
                  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
                { label: "Desktop", key: "desktop" as const, color: "bg-violet-400", light: "bg-violet-50", text: "text-violet-600",
                  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
              ].map(dev => {
                const count = s.devices[dev.key];
                const pct = Math.round((count / devTotal) * 100);
                return (
                  <div key={dev.key} className="flex items-center gap-3 p-3.5 sm:p-0 sm:bg-white sm:rounded-2xl sm:border sm:border-gray-100 sm:shadow-sm sm:p-5">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${dev.light}`}>
                      <span className={dev.text}>{dev.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-600">{dev.label}</p>
                        <p className="text-sm font-black text-gray-900">{pct}%
                          <span className="text-[10px] text-gray-400 font-normal ml-1">({count})</span>
                        </p>
                      </div>
                      <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${dev.color} rounded-full transition-all`} style={{ width: `${pct || 0}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Section 5: Store KPIs ────────────────────────────────────── */}
          <section>
            <SectionTitle>Boutique</SectionTitle>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard label="Produits actifs" value={s.products} sub={`${s.inStock} en stock · ${s.outOfStock} rupture`}
                color="bg-orange-50" textColor="text-orange-500"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} />
              <KpiCard label="Commandes" value={s.orders} sub={`${s.pendingOrders} en attente`}
                color="bg-blue-50" textColor="text-blue-500"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} />
              <KpiCard label="Revenus totaux" value={`${s.revenue.toLocaleString()}€`} sub="Cumul de toutes les commandes"
                color="bg-emerald-50" textColor="text-emerald-600"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
              <KpiCard label="Abonnés newsletter" value={s.subscribers} sub="Emails inscrits"
                color="bg-violet-50" textColor="text-violet-500"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
              <KpiCard label="Catégories" value={s.categories} sub="Actives dans le catalogue"
                color="bg-sky-50" textColor="text-sky-500"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>} />
              <KpiCard label="Marques" value={s.brands} sub="Référencées"
                color="bg-pink-50" textColor="text-pink-500"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>} />
              <KpiCard label="Bannières Hero" value={s.heroSlides} sub="Slides actives"
                color="bg-amber-50" textColor="text-amber-500"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
              <KpiCard
                label="Produits en rupture" value={s.outOfStock}
                sub={s.outOfStock === 0 ? "Tout est en stock ✓" : "À réapprovisionner"}
                color={s.outOfStock > 0 ? "bg-red-50" : "bg-emerald-50"}
                textColor={s.outOfStock > 0 ? "text-red-500" : "text-emerald-500"}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

