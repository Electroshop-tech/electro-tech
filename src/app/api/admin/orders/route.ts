import { NextRequest, NextResponse } from "next/server";
import { getOrders, updateOrderStatus, addAdminLog } from "@/lib/store";
import { isAdmin } from "@/lib/adminAuth";
import { sendOrderStatusEmail } from "@/lib/email";
import type { Order } from "@/lib/types";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orders: Order[] = await getOrders();
  return NextResponse.json({ orders });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status, trackingNumber } = await req.json() as { id: string; status: Order["status"]; trackingNumber?: string };

  // Update tracking number if provided
  if (trackingNumber !== undefined) {
    await prisma.order.update({ where: { id }, data: { trackingNumber } }).catch(() => {});
  }

  const updated = await updateOrderStatus(id, status);
  if (!updated) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });

  // Send status email to customer (non-blocking)
  if (updated.customerEmail) {
    sendOrderStatusEmail(updated, trackingNumber).catch(err =>
      console.error("[email] Failed to send status email:", err)
    );
  }

  // Log admin action
  addAdminLog("order.status", `Commande ${id.slice(-8).toUpperCase()} → ${status}${trackingNumber ? ` (suivi: ${trackingNumber})` : ""}`).catch(() => {});

  return NextResponse.json({ order: updated });
}
