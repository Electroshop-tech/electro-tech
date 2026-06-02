import { NextRequest, NextResponse } from "next/server";
import { getOrders, getPromos } from "@/lib/store";
import { isAdmin } from "@/lib/adminAuth";

// GET — usage report aggregated by promo code (from real orders)
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [orders, promos] = await Promise.all([getOrders(), getPromos()]);

  const byCode = new Map<string, { orders: number; discount: number; revenue: number; lastUsed: string | null }>();
  for (const o of orders) {
    if (!o.promoCode) continue;
    const code = o.promoCode.toUpperCase();
    const entry = byCode.get(code) ?? { orders: 0, discount: 0, revenue: 0, lastUsed: null };
    entry.orders += 1;
    entry.discount += o.promoDiscount ?? 0;
    entry.revenue += o.total ?? 0;
    const created = typeof o.createdAt === "string" ? o.createdAt : new Date(o.createdAt).toISOString();
    if (!entry.lastUsed || created > entry.lastUsed) entry.lastUsed = created;
    byCode.set(code, entry);
  }

  // Merge configured promos with actual usage
  const report = promos.map((p) => {
    const usage = byCode.get(p.code.toUpperCase());
    return {
      code: p.code,
      type: p.type,
      value: p.value,
      active: p.active,
      maxUses: p.maxUses,
      expires: p.expires,
      ordersCount: usage?.orders ?? 0,
      totalDiscount: Math.round((usage?.discount ?? 0) * 100) / 100,
      totalRevenue: Math.round((usage?.revenue ?? 0) * 100) / 100,
      lastUsed: usage?.lastUsed ?? null,
    };
  });

  // Include codes used in orders that no longer exist as promos
  for (const [code, usage] of byCode.entries()) {
    if (!promos.some((p) => p.code.toUpperCase() === code)) {
      report.push({
        code,
        type: "percent",
        value: 0,
        active: false,
        maxUses: 0,
        expires: "",
        ordersCount: usage.orders,
        totalDiscount: Math.round(usage.discount * 100) / 100,
        totalRevenue: Math.round(usage.revenue * 100) / 100,
        lastUsed: usage.lastUsed,
      });
    }
  }

  report.sort((a, b) => b.ordersCount - a.ordersCount);

  const totals = {
    codesUsed: report.filter((r) => r.ordersCount > 0).length,
    totalOrders: report.reduce((s, r) => s + r.ordersCount, 0),
    totalDiscount: Math.round(report.reduce((s, r) => s + r.totalDiscount, 0) * 100) / 100,
    totalRevenue: Math.round(report.reduce((s, r) => s + r.totalRevenue, 0) * 100) / 100,
  };

  return NextResponse.json({ report, totals });
}
