import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/adminAuth";
import { rateLimit } from "@/lib/rateLimit";
import { paymentConfigured } from "@/lib/payments/stripe";
import { createOrderCheckout } from "@/lib/payments/checkout";
import { PaymentError } from "@/lib/payments/validation";

export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: "Origine invalide." }, { status: 403 });
  const limited = rateLimit(req, { limit: 10, prefix: "admin-payment-link" });
  if (limited) return limited;
  if (!paymentConfigured()) return NextResponse.json({ error: "Configurez Stripe pour créer un lien de paiement sécurisé. Vous pouvez contacter le client pour convenir du règlement." }, { status: 503 });
  try {
    const parsed = z.object({ orderId: z.string().min(1).max(100) }).strict().safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Commande invalide." }, { status: 400 });
    // Reuses the same idempotent checkout and provider-confirmed payment flow
    // as customer checkout. Creating a link never marks the order as paid.
    const url = await createOrderCheckout(parsed.data.orderId);
    return NextResponse.json({ url }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof PaymentError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Impossible de créer le lien. Réessayez." }, { status: 502 });
  }
}
