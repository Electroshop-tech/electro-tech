import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/store";

function scoreProduct(
  p: { name: string; description?: string | null; brand?: string | null; category?: string | null },
  tokens: string[],
  fullQuery: string
): number {
  const name = p.name.toLowerCase();
  const brand = (p.brand ?? "").toLowerCase();
  const cat = (p.category ?? "").toLowerCase();
  const desc = (p.description ?? "").toLowerCase();

  let score = 0;

  // Exact full-query match in name = highest priority
  if (name === fullQuery) score += 100;
  else if (name.startsWith(fullQuery)) score += 60;
  else if (name.includes(fullQuery)) score += 40;

  // Token-level matches
  for (const token of tokens) {
    if (token.length < 2) continue;
    if (name.includes(token)) score += 20;
    if (brand.includes(token)) score += 12;
    if (cat.includes(token)) score += 8;
    if (desc.includes(token)) score += 3;
  }

  return score;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("q")?.trim() ?? "";
  const cat = searchParams.get("cat")?.trim().toLowerCase() ?? "";

  if (!raw) return NextResponse.json({ results: [] });

  const q = raw.toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);

  const all = await getProducts();

  const scored = all
    .filter((p) => {
      const matchesCat = !cat || p.category?.toLowerCase() === cat;
      if (!matchesCat) return false;
      return scoreProduct(p, tokens, q) > 0;
    })
    .map((p) => ({ p, score: scoreProduct(p, tokens, q) }))
    .sort((a, b) => b.score - a.score)
    .map(({ p }) => p);

  return NextResponse.json({ results: scored.slice(0, 40) });
}
