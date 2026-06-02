import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug, subscribeStockNotification } from "@/lib/store";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const limited = rateLimit(req, { limit: 5, prefix: "notify-stock" });
  if (limited) return limited;

  try {
    const { slug } = await params;
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
    }

    const product = await getProductBySlug(slug);
    if (!product) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });

    const result = await subscribeStockNotification(product.id, email.trim().toLowerCase());
    return NextResponse.json({ ok: true, alreadyExists: result.alreadyExists });
  } catch (err) {
    console.error("[notify-stock]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
