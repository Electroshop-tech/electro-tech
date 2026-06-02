import { NextRequest, NextResponse } from "next/server";
import { getMessages, updateMessage, deleteMessage, addAdminLog } from "@/lib/store";
import { sendContactReply } from "@/lib/email";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getMessages());
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, reply } = await req.json();
  if (!id || typeof reply !== "string" || !reply.trim()) {
    return NextResponse.json({ error: "Message et réponse requis" }, { status: 400 });
  }
  const messages = await getMessages();
  const msg = messages.find((m) => m.id === id);
  if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await sendContactReply({
    to: msg.email,
    name: msg.name,
    subject: msg.subject ?? "Votre message",
    reply: reply.trim(),
    originalMessage: msg.message,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Échec de l'envoi" }, { status: 502 });
  }

  // Mark as read once replied.
  const updated = await updateMessage(id, { read: true });
  await addAdminLog("message.reply", `Réponse envoyée à ${msg.email}`);
  return NextResponse.json({ ok: true, message: updated });
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
