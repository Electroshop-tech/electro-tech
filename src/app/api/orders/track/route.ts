import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim().toUpperCase();
  const email = searchParams.get("email")?.trim().toLowerCase();

  if ((!id || id.length < 3) && !email) {
    return NextResponse.json({ error: "ID ou email manquant." }, { status: 400 });
  }

  // If email is provided, return all orders for that email (guest lookup)
  if (email && !id) {
    const orders = await prisma.order.findMany({
      where: { customerEmail: email },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    if (orders.length === 0) {
      return NextResponse.json({ error: "Aucune commande trouvée." }, { status: 404 });
    }
    return NextResponse.json({
      orders: orders.map(o => ({
        id: o.id,
        status: o.status,
        createdAt: o.createdAt,
        total: o.total,
        itemCount: o.items.length,
        city: o.addressCity ?? "",
      })),
    });
  }

  // Lookup by ID
  const orders = await prisma.order.findMany({ include: { items: true } });
  const order = orders.find((o) => {
    const short = o.id.replace(/-/g, "").slice(-6).toUpperCase();
    const input = (id ?? "").replace(/^ET-?/i, "").replace(/-/g, "").toUpperCase();
    return short === input || o.id.toUpperCase() === id;
  });

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  const city = order.addressCity ?? "";

  return NextResponse.json({
    id: order.id,
    status: order.status,
    createdAt: order.createdAt,
    total: order.total,
    itemCount: order.items.length,
    city,
    items: order.items.map(i => ({ productName: i.productName })),
  });
}
