import { NextRequest, NextResponse } from "next/server";
import { getAdminLogs } from "@/lib/store";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const logs = await getAdminLogs(100);
  return NextResponse.json({ logs });
}
