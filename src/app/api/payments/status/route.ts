import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { canAccessPayment } from "@/lib/payments/access";
import { paymentConfigured } from "@/lib/payments/stripe";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("orderId");
  if (!id || id.length > 100) return NextResponse.json({ error: "Commande invalide." }, { status: 400 });
  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || !await canAccessPayment(order)) return NextResponse.json({ error: "Commande inaccessible. Connectez-vous ou utilisez le navigateur de votre commande." }, { status: 403 });
    return NextResponse.json({
      id: order.id, orderNumber: order.orderNumber || order.id, email: order.customerEmail,
      total: order.total, amountPaid: order.paymentAmount === null ? null : order.paymentAmount / 100,
      currency: order.paymentCurrency, paymentStatus: order.paymentStatus.toLowerCase(),
      paidAt: order.paidAt, subscriptionSentAt: order.subscriptionSentAt, available: paymentConfigured(),
      cancelled: order.status === "CANCELLED",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Impossible de vérifier le paiement. Veuillez réessayer." }, { status: 503 });
  }
}
