import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { canAccessPayment } from "@/lib/payments/access";
import { createOrderCheckout } from "@/lib/payments/checkout";
import { paymentConfigured } from "@/lib/payments/stripe";
import { PaymentError } from "@/lib/payments/validation";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 10, prefix: "checkout" });
  if (limited) return limited;
  if (!paymentConfigured()) return NextResponse.json({ error: "Le paiement en ligne n’est pas encore disponible." }, { status: 503 });
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin && origin !== new URL(process.env.NEXT_PUBLIC_SITE_URL!).origin) return NextResponse.json({ error: "Origine invalide." }, { status: 403 });
  try {
    const parsed = z.object({ orderId: z.string().min(1).max(100) }).strict().safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Commande invalide." }, { status: 400 });
    const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId }, select: { id: true, userId: true } });
    if (!order || !await canAccessPayment(order)) return NextResponse.json({ error: "Commande inaccessible. Connectez-vous ou utilisez le navigateur de votre commande." }, { status: 403 });
    return NextResponse.json({ url: await createOrderCheckout(order.id) });
  } catch (error) {
    if (error instanceof PaymentError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[payment] Checkout session creation failed");
    return NextResponse.json({ error: "Impossible d’ouvrir le paiement. Veuillez réessayer." }, { status: 502 });
  }
}
