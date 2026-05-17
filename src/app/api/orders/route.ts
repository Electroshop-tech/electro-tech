import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersByUserId, createOrder } from "@/lib/store";
import type { OrderItem, Address } from "@/lib/types";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  return NextResponse.json({ orders: getOrdersByUserId(session.userId) });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

    const { items, address, paymentMethod } = await req.json() as {
      items: OrderItem[];
      address: Address;
      paymentMethod: string;
    };

    if (!items?.length) return NextResponse.json({ error: "Panier vide." }, { status: 400 });
    if (!address?.street || !address?.city) return NextResponse.json({ error: "Adresse manquante." }, { status: 400 });

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = subtotal; // add shipping logic here if needed

    const order = createOrder({
      userId: session.userId,
      items,
      subtotal,
      total,
      status: "pending",
      address,
      paymentMethod: paymentMethod ?? "cash_on_delivery",
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
