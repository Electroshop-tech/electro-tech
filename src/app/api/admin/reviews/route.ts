import { NextRequest, NextResponse } from "next/server";
import { getProducts, getProductById, updateProduct, addAdminLog } from "@/lib/store";
import { isAdmin } from "@/lib/adminAuth";
import type { ProductReview } from "@/lib/types";

// GET — flattened list of every product review (including pending) for moderation
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await getProducts();
  const reviews = products.flatMap((p) =>
    (p.productReviews ?? []).map((r) => ({
      ...r,
      productId: p.id,
      productName: p.name,
      productSlug: p.slug,
      productImage: p.image,
      status: r.approved === false ? "pending" : r.approved === true ? "approved" : "legacy",
    }))
  );

  return NextResponse.json(reviews);
}

// PATCH — moderate a single review: approve | reject | reply
export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, reviewId, action, reply } = await req.json();
  if (!productId || reviewId == null || !action) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const product = await getProductById(Number(productId));
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const reviews: ProductReview[] = product.productReviews ?? [];
  const idx = reviews.findIndex((r) => r.id === Number(reviewId));
  if (idx === -1) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  if (action === "approve") {
    reviews[idx] = { ...reviews[idx], approved: true };
  } else if (action === "reject") {
    reviews[idx] = { ...reviews[idx], approved: false };
  } else if (action === "reply") {
    reviews[idx] = { ...reviews[idx], reply: typeof reply === "string" ? reply.trim() : "" };
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await updateProduct(product.id, { productReviews: reviews });
  await addAdminLog(`review.${action}`, `Avis #${reviewId} sur "${product.name}"`);

  return NextResponse.json({ ok: true });
}

// DELETE — remove a review entirely
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, reviewId } = await req.json();
  if (!productId || reviewId == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const product = await getProductById(Number(productId));
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const reviews: ProductReview[] = (product.productReviews ?? []).filter(
    (r) => r.id !== Number(reviewId)
  );

  await updateProduct(product.id, { productReviews: reviews });
  await addAdminLog("review.delete", `Avis #${reviewId} supprimé de "${product.name}"`);

  return NextResponse.json({ ok: true });
}
