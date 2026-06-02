import { NextRequest, NextResponse } from "next/server";
import { getAdminCounts } from "@/lib/store";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getAdminCounts());
}
