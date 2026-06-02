import { NextRequest, NextResponse } from "next/server";
import { getMessages, updateMessage, deleteMessage, addAdminLog } from "@/lib/store";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getMessages());
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, read } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const updated = await updateMessage(id, { read });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const ok = await deleteMessage(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await addAdminLog("message.delete", `Message ${id} supprimé`);
  return NextResponse.json({ ok: true });
}
