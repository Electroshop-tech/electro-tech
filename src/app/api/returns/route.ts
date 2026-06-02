import { NextRequest, NextResponse } from "next/server";
import { createReturn, getOrderById } from "@/lib/store";
import { sendContactNotification } from "@/lib/email";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 3, prefix: "returns" });
  if (limited) return limited;

  try {
    const { orderId, customerName, customerEmail, customerPhone, reason, comment } = await req.json();

    if (!orderId?.trim() || !customerName?.trim() || !customerEmail?.trim() || !reason?.trim()) {
      return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }

    // Verify the order exists and the email matches (basic ownership check)
    const order = await getOrderById(orderId.trim());
    if (!order) {
      return NextResponse.json({ error: "Numéro de commande introuvable." }, { status: 404 });
    }
    if (order.customerEmail.toLowerCase() !== customerEmail.trim().toLowerCase()) {
      return NextResponse.json({ error: "L'e-mail ne correspond pas à cette commande." }, { status: 400 });
    }

    const ret = await createReturn({
      orderId: orderId.trim(),
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone?.trim() || null,
      reason: reason.trim(),
      comment: comment?.trim() || null,
    });

    // Notify admin (reuse contact notification template)
    sendContactNotification({
      name: customerName.trim(),
      email: customerEmail.trim(),
      phone: customerPhone?.trim() || undefined,
      subject: `Demande de retour — commande #${orderId.trim().slice(-8).toUpperCase()}`,
      message: `Motif: ${reason}\n\n${comment ?? ""}`,
    }).catch(() => {});

    return NextResponse.json({ ok: true, id: ret.id });
  } catch (err) {
    console.error("[returns]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
