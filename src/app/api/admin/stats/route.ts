import { NextRequest, NextResponse } from "next/server";
import { getDBStats, getPageViews, getBestSellers, getLowStockProducts, getAbandonedCarts } from "@/lib/store";
import { isAdmin } from "@/lib/adminAuth";

// Detect device type from User-Agent string
function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
  const lower = ua.toLowerCase();
  if (/tablet|ipad/.test(lower)) return "tablet";
  if (/mobile|android|iphone|ipod|opera mini|windows phone/.test(lower)) return "mobile";
  return "desktop";
}

// Clean referrer to a readable label
function cleanReferrer(ref: string): string {
  if (!ref) return "Direct";
  try {
    const u = new URL(ref);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const stats = await getDBStats();
  const rawViews = await getPageViews();
  const [bestSellers, lowStock, abandonedCarts] = await Promise.all([
    getBestSellers(8),
    getLowStockProducts(5),
    getAbandonedCarts(50),
  ]);
  const views = rawViews.map(v => ({
    url: v.url,
    referrer: v.referrer,
    ua: v.ua,
    sessionId: v.sessionId,
    timestamp: v.timestamp instanceof Date ? v.timestamp.toISOString() : String(v.timestamp),
  }));

  // ── Page view analytics ────────────────────────────────────────────────────
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const fiveMinAgo = new Date(now - 5 * 60 * 1000);
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const todayViews = views.filter(v => new Date(v.timestamp) >= todayStart);
  const yesterdayViews = views.filter(v => {
    const d = new Date(v.timestamp);
    return d >= yesterdayStart && d < todayStart;
  });
  const recentViews = views.filter(v => new Date(v.timestamp) >= fiveMinAgo);
  const last30Views = views.filter(v => new Date(v.timestamp) >= thirtyDaysAgo);

  // Live visitors (unique sessionIds in last 5 min)
  const liveVisitors = new Set(recentViews.map(v => v.sessionId)).size;

  // Today unique visitors
  const todayUnique = new Set(todayViews.map(v => v.sessionId)).size;
  const yesterdayUnique = new Set(yesterdayViews.map(v => v.sessionId)).size;

  // Top pages (last 30 days)
  const pageCount: Record<string, number> = {};
  for (const v of last30Views) {
    pageCount[v.url] = (pageCount[v.url] ?? 0) + 1;
  }
  const topPages = Object.entries(pageCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([url, count]) => ({ url, count }));

  // Top referrers (last 30 days)
  const refCount: Record<string, number> = {};
  for (const v of last30Views) {
    const label = cleanReferrer(v.referrer);
    refCount[label] = (refCount[label] ?? 0) + 1;
  }
  const topReferrers = Object.entries(refCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([source, count]) => ({ source, count }));

  // Device breakdown (last 30 days)
  let mobile = 0, tablet = 0, desktop = 0;
  for (const v of last30Views) {
    const d = detectDevice(v.ua);
    if (d === "mobile") mobile++;
    else if (d === "tablet") tablet++;
    else desktop++;
  }

  // Daily views for last 14 days
  const dailyMap: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const v of views) {
    const day = v.timestamp.slice(0, 10);
    if (day in dailyMap) dailyMap[day]++;
  }
  const dailyViews = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

  return NextResponse.json({
    // existing
    products: stats.products,
    categories: stats.categories,
    brands: stats.brands,
    heroSlides: stats.heroSlides,
    inStock: stats.inStock,
    outOfStock: stats.outOfStock,
    orders: stats.orders,
    pendingOrders: stats.pendingOrders,
    revenue: stats.revenue,
    subscribers: stats.subscribers,
    // new analytics
    liveVisitors,
    todayViews: todayViews.length,
    yesterdayViews: yesterdayViews.length,
    todayUnique,
    yesterdayUnique,
    totalViews: views.length,
    topPages,
    topReferrers,
    devices: { mobile, tablet, desktop },
    dailyViews,
    // commerce insights
    bestSellers,
    lowStock,
    abandonedCarts,
  });
}

