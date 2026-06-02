import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersByUserId, createOrder, getUserById, getProductById, validatePromoCode, incrementPromoUses, getDeliveryFeeForCity } from "@/lib/store";
import { sendOrderConfirmation, sendAdminOrderNotification } from "@/lib/email";
import { rateLimit } from "@/lib/rateLimit";
import type { OrderItem, Address } from "@/lib/types";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  return NextResponse.json({ orders: await getOrdersByUserId(session.userId) });
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 5, prefix: "orders" });
  if (limited) return limited;
  try {
    const session = await getCurrentUser();

    const { items, address, paymentMethod, notes, customer, promoCode } = await req.json() as {
      items: OrderItem[];
      address: Address;
      paymentMethod: string;
      notes?: string;
      customer?: { firstName: string; lastName: string; email: string; phone: string };
      promoCode?: string;
    };

    if (!items?.length) return NextResponse.json({ error: "Panier vide." }, { status: 400 });
    if (!address?.street || !address?.city) return NextResponse.json({ error: "Adresse manquante." }, { status: 400 });

    let customerName: string;
    let customerEmail: string;
    let customerPhone: string | undefined;
    let userId: string | undefined;

    if (session) {
      const user = await getUserById(session.userId);
      customerName = user ? `${user.firstName} ${user.lastName}` : "Client";
      customerEmail = user?.email ?? session.email;
      customerPhone = user?.phone;
      userId = session.userId;
    } else {
      // Guest checkout
      if (!customer?.firstName || !customer?.lastName || !customer?.phone) {
        return NextResponse.json({ error: "Informations client manquantes." }, { status: 400 });
      }
      customerName = `${customer.firstName} ${customer.lastName}`;
      customerEmail = customer.email || "";
      customerPhone = customer.phone;
    }

    // Server-side price validation — don't trust client prices
    const verifiedItems: OrderItem[] = [];
    for (const item of items) {
      const dbProduct = await getProductById(Number(item.productId));
      const verifiedPrice = dbProduct ? dbProduct.currentPrice : item.price;
      verifiedItems.push({ ...item, price: verifiedPrice });
    }

    const subtotal = verifiedItems.reduce((s, i) => s + i.price * i.quantity, 0);

    // Apply promo code if provided
    let promoDiscount = 0;
    let appliedPromoCode: string | undefined;
    if (promoCode) {
      const promoResult = await validatePromoCode(promoCode, subtotal);
      if (promoResult.ok && promoResult.discount) {
        promoDiscount = promoResult.discount;
        appliedPromoCode = promoResult.code;
      }
    }

    // Calculate delivery fee from zones
    const deliveryFee = await getDeliveryFeeForCity(address.city) ?? 0;

    const total = Math.max(0, subtotal - promoDiscount + deliveryFee);

    const order = await createOrder({
      userId: userId ?? "guest",
      customerName,
      customerEmail,
      customerPhone,
      items: verifiedItems,
      subtotal,
      total,
      status: "pending",
      address,
      paymentMethod: paymentMethod ?? "cash_on_delivery",
      notes,
      promoCode: appliedPromoCode,
      promoDiscount,
    });

    // Increment promo uses
    if (appliedPromoCode) {
      incrementPromoUses(appliedPromoCode).catch(() => {});
    }

    // Decrement stock quantities atomically (block overselling)
    for (const item of verifiedItems) {
      const updated = await prisma.product.updateMany({
        where: { id: Number(item.productId), stockQuantity: { gte: item.quantity } },
        data: { stockQuantity: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        // Stock insufficient — but order already created, log warning
        console.warn(`[stock] Product ${item.productId} may be oversold`);
      }
    }
    // Auto-mark products out of stock if quantity reached 0
    await prisma.product.updateMany({
      where: { stockQuantity: { lte: 0 }, inStock: true },
      data: { inStock: false, stockQuantity: 0 },
    });

    // Send emails (non-blocking — don't fail the request if email fails)
    Promise.all([
      sendOrderConfirmation(order),
      sendAdminOrderNotification(order),
    ]).catch(err => console.error("[email] Failed to send order emails:", err));

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
