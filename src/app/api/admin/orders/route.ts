import { NextRequest, NextResponse } from "next/server";
import { getOrders, updateOrder, addAdminLog } from "@/lib/store";
import { isAdmin } from "@/lib/adminAuth";
import { sendOrderStatusEmail } from "@/lib/email";
import type { Order } from "@/lib/types";

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status")?.trim().toLowerCase();
  const payment = sp.get("payment")?.trim().toLowerCase();
  const q = sp.get("q")?.trim().toLowerCase();
  const from = sp.get("from"); // YYYY-MM-DD
  const to = sp.get("to");

  let orders: Order[] = await getOrders();

  if (status && status !== "all") {
    orders = orders.filter((o) => o.status === status);
  }
  if (payment && payment !== "all") {
    orders = orders.filter((o) => o.paymentStatus === payment);
  }
  if (from) {
    const fromTs = new Date(from + "T00:00:00").getTime();
    if (!Number.isNaN(fromTs)) orders = orders.filter((o) => new Date(o.createdAt).getTime() >= fromTs);
  }
  if (to) {
    const toTs = new Date(to + "T23:59:59").getTime();
    if (!Number.isNaN(toTs)) orders = orders.filter((o) => new Date(o.createdAt).getTime() <= toTs);
  }
  if (q) {
    orders = orders.filter((o) =>
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      (o.customerPhone ?? "").toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ orders });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status, trackingNumber, notes, paymentStatus } = await req.json() as {
    id: string;
    status?: Order["status"];
    trackingNumber?: string;
    notes?: string;
    paymentStatus?: Order["paymentStatus"];
  };

  if (!id) return NextResponse.json({ error: "ID manquant." }, { status: 400 });

  const updated = await updateOrder(id, { status, trackingNumber, notes, paymentStatus });
  if (!updated) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });

  // Send status email to customer when the status changed (non-blocking)
  if (status !== undefined && updated.customerEmail) {
    sendOrderStatusEmail(updated, trackingNumber).catch(err =>
      console.error("[email] Failed to send status email:", err)
    );
  }

  // Log admin action
  const changes = [
    status !== undefined ? `statut → ${status}` : null,
    trackingNumber ? `suivi: ${trackingNumber}` : null,
    paymentStatus !== undefined ? `paiement → ${paymentStatus}` : null,
    notes !== undefined ? "notes modifiées" : null,
  ].filter(Boolean).join(", ");
  addAdminLog("order.update", `Commande ${id.slice(-8).toUpperCase()} : ${changes || "aucune modification"}`).catch(() => {});

  return NextResponse.json({ order: updated });
}

