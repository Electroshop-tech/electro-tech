import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID manquant." }, { status: 400 });

  const order = await getOrderById(id);
  if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });

  // Return limited info (no full customer data for security)
  return NextResponse.json({
    id: order.id,
    orderNumber: order.orderNumber,
    items: order.items.map(i => ({
      name: i.productName,
      image: i.productImage,
      price: i.price,
      qty: i.quantity,
    })),
    subtotal: order.subtotal,
    total: order.total,
    promoCode: order.promoCode,
    promoDiscount: order.promoDiscount,
    status: order.status,
    customerFirstName: order.customerName.split(" ")[0],
    customerLastName: order.customerName.split(" ").slice(1).join(" "),
    city: order.address?.city,
    phone: order.customerPhone ? order.customerPhone.replace(/.(?=.{4})/g, "•") : undefined,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
  });
}
