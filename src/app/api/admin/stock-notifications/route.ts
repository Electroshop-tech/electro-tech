import { NextRequest, NextResponse } from "next/server";
import { countStockNotifications, getProducts } from "@/lib/store";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const counts = await countStockNotifications();
  const products = await getProducts();
  const byId = new Map(products.map((p) => [p.id, p]));
  const rows = counts.map((c) => ({
    productId: c.productId,
    productName: byId.get(c.productId)?.name ?? `Produit #${c.productId}`,
    productSlug: byId.get(c.productId)?.slug ?? "",
    inStock: byId.get(c.productId)?.inStock !== false,
    count: c.count,
  }));
  const total = rows.reduce((s, r) => s + r.count, 0);
  return NextResponse.json({ rows, total });
}
