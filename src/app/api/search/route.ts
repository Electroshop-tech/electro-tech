import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const cat = searchParams.get("cat")?.trim().toLowerCase() ?? "";

  if (!q) return NextResponse.json({ results: [] });

  const all = await getProducts();
  const results = all.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q);
    const matchesCat = !cat || p.category === cat;
    return matchesQuery && matchesCat;
  });

  return NextResponse.json({ results: results.slice(0, 40) });
}
