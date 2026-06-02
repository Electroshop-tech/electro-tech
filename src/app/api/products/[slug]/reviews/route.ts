import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug, updateProduct } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Rate limit to prevent spam
  const limited = rateLimit(req, { limit: 3, prefix: "reviews" });
  if (limited) return limited;

  try {
    // Require authentication
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Vous devez être connecté pour laisser un avis." }, { status: 401 });
    }

    const { slug } = await params;
    const { author, rating, content } = await req.json();

    if (!author?.trim() || !content?.trim() || !rating) {
      return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }
    if (content.trim().length < 10) {
      return NextResponse.json({ error: "L'avis doit faire au moins 10 caractères." }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Note invalide." }, { status: 400 });
    }

    const product = await getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
    }

    const today = new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const existingReviews = product.productReviews ?? [];
    const newReview = {
      id: existingReviews.length > 0 ? Math.max(...existingReviews.map((r) => r.id)) + 1 : 1,
      author: author.trim(),
      rating: Number(rating),
      date: today,
      content: content.trim(),
      verified: false,
      approved: false,
    };

    await updateProduct(product.id, {
      productReviews: [newReview, ...existingReviews],
    });

    return NextResponse.json({ ok: true, review: newReview });
  } catch (err) {
    console.error("[reviews]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
