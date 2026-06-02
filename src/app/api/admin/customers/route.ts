import { NextRequest, NextResponse } from "next/server";
import { getUsers, getOrders } from "@/lib/store";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const users = await getUsers();
  const orders = await getOrders();

  // Attach order count per user, strip passwordHash for security
  const customers = users.map(({ passwordHash: _, ...u }) => ({
    ...u,
    orderCount: orders.filter(o => o.userId === u.id).length,
  }));

  return NextResponse.json({ customers });
}
