import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { upsertAbandonedCart } from "@/lib/store";
import { rateLimit } from "@/lib/rateLimit";
import { validate, cartTrackSchema } from "@/lib/validation";

/**
 * POST /api/cart/track
 * Stores a snapshot of a visitor's cart keyed by an anonymous session id so the
 * admin can follow up on abandoned carts. Called (debounced) from the client
 * cart context. Best-effort: never blocks the shopping experience.
 */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 20, prefix: "cart-track" });
  if (limited) return limited;

  try {
    const parsed = validate(cartTrackSchema, await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { sessionId, email, customerName, phone, items } = parsed.data;

    const session = await getCurrentUser();
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

    await upsertAbandonedCart({
      sessionId,
      userId: session?.userId ?? null,
      email: email ?? session?.email ?? null,
      customerName: customerName ?? null,
      phone: phone ?? null,
      items,
      subtotal,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
