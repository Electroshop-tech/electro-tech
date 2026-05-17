import { NextRequest, NextResponse } from "next/server";
import { readDB } from "@/lib/store";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "admin1234";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = readDB();
  return NextResponse.json({
    products: db.products.length,
    categories: db.categories.length,
    brands: db.brands.length,
    heroSlides: db.heroSlides.length,
    inStock: db.products.filter((p) => p.inStock).length,
    outOfStock: db.products.filter((p) => !p.inStock).length,
  });
}
