import { NextRequest, NextResponse } from "next/server";
import { getReturns, updateReturn, deleteReturn, addAdminLog } from "@/lib/store";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getReturns());
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status, refundAmount, adminNote } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const data: { status?: string; refundAmount?: number; adminNote?: string } = {};
  if (status !== undefined) data.status = status;
  if (refundAmount !== undefined) data.refundAmount = Number(refundAmount);
  if (adminNote !== undefined) data.adminNote = adminNote;
  const updated = await updateReturn(id, data);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await addAdminLog("return.update", `Retour ${id} → ${status ?? updated.status}`);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const ok = await deleteReturn(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
