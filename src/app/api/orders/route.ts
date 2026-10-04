import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { after } from "next/server";
import { dispatchOrderAlerts } from "@/lib/admin-notifications";
import { getOrdersByUserId, createOrder, getUserById, getProductById, validatePromoCode, incrementPromoUses, computeDeliveryFee, markCartRecovered } from "@/lib/store";
import { dispatchOrderEmails } from "@/lib/order-emails";
import { rateLimit } from "@/lib/rateLimit";
import { validate, createOrderSchema } from "@/lib/validation";
import type { OrderItem } from "@/lib/types";
import { grantOrderPaymentAccess } from "@/lib/payments/access";
import { paymentConfigured } from "@/lib/payments/stripe";

export const maxDuration = 60;

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
    if (paymentMethod === "stripe" && !paymentConfigured()) return NextResponse.json({ error: "Le paiement en ligne n’est pas disponible." }, { status: 503 });

    let customerName: string;
    let customerEmail: string;
    let customerPhone: string | undefined;
    let userId: string | undefined;

    if (session) {
      const user = await getUserById(session.userId);
      customerName = user ? `${user.firstName} ${user.lastName}` : "Client";
      customerEmail = user?.email ?? session.email;
      customerPhone = customer?.phone || user?.phone;
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
      if (!dbProduct) return NextResponse.json({ error: "Un produit de votre panier n’est plus disponible." }, { status: 400 });
      verifiedItems.push({
        productId: item.productId,
        productName: dbProduct?.name ?? item.productName,
        productImage: dbProduct?.image ?? item.productImage,
        quantity: item.quantity,
        price: dbProduct ? dbProduct.currentPrice : item.price,
      });
    }

    const subtotal = verifiedItems.reduce((s, i) => s + i.price * i.quantity, 0);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) return NextResponse.json({ error: "Une adresse email valide est nécessaire pour recevoir la confirmation de commande." }, { status: 400 });

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
      paymentMethod,
      notes,
      promoCode: appliedPromoCode,
      promoDiscount,
    });

    after(async () => {
      try { await dispatchOrderAlerts(order.id); }
      catch { console.error("[notifications] Phone dispatch unavailable", { orderId: order.id }); }
      try { await dispatchOrderEmails(order.id); }
      catch { console.error("[email] Queued order emails unavailable", { orderId: order.id }); }
    });

    // Increment promo uses
    if (appliedPromoCode) {
      incrementPromoUses(appliedPromoCode).catch(() => {});
    }

    // Mark this session's abandoned cart (if any) as recovered
    if (sessionId) {
      markCartRecovered(sessionId).catch(() => {});
    }

    try { await grantOrderPaymentAccess(order.id); }
    catch { console.error("[orders] Payment access cookie unavailable", { orderId: order.id }); }
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "ORDER_OUT_OF_STOCK") return NextResponse.json({ error: "Un produit est en rupture de stock. Veuillez vérifier votre panier." }, { status: 409 });
    console.error("[orders] POST failed:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
