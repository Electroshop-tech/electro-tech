import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersByUserId, createOrder, getUserById, getProductById, validatePromoCode, incrementPromoUses, computeDeliveryFee, markCartRecovered } from "@/lib/store";
import { sendOrderConfirmation, sendAdminOrderNotification } from "@/lib/email";
import { rateLimit } from "@/lib/rateLimit";
import { validate, createOrderSchema } from "@/lib/validation";
import type { OrderItem } from "@/lib/types";
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

    const parsed = validate(createOrderSchema, await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { items, address, paymentMethod, notes, customer, promoCode, sessionId } = parsed.data;

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

    // Server-side price validation — don't trust client prices.
    // Also resolve the authoritative product name/image from the DB.
    const verifiedItems: OrderItem[] = [];
    for (const item of items) {
      const dbProduct = await getProductById(Number(item.productId));
      verifiedItems.push({
        productId: item.productId,
        productName: dbProduct?.name ?? item.productName,
        productImage: dbProduct?.image ?? item.productImage,
        quantity: item.quantity,
        price: dbProduct ? dbProduct.currentPrice : item.price,
      });
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

    // Calculate delivery fee (free threshold → zone fee → global setting)
    const deliveryFee = await computeDeliveryFee(subtotal, address.city);

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

    // Mark this session's abandoned cart (if any) as recovered
    if (sessionId) {
      markCartRecovered(sessionId).catch(() => {});
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
  } catch (err) {
    console.error("[orders] POST failed:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
