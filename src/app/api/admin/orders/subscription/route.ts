import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/adminAuth";
import { getOrderById, addAdminLog } from "@/lib/store";
import { deliverSubscription, saveSubscriptionInformation } from "@/lib/payments/subscriptions";
import { PaymentError } from "@/lib/payments/validation";

export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
    const parsed = z.object({ orderId: z.string().min(1).max(100), information: z.string().trim().min(1).max(20000), send: z.boolean() }).strict().safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Informations invalides." }, { status: 400 });
    const { orderId, information, send } = parsed.data;
    const current = await getOrderById(orderId);
    if (!current) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
    if (current.subscriptionSentAt) return NextResponse.json({ order: current, delivery: "sent" });
    if (current.subscriptionInformation !== information) await saveSubscriptionInformation(orderId, information);
    if (send && (current.paymentStatus !== "paid" || current.status === "cancelled")) return NextResponse.json({ error: "Le paiement doit être confirmé avant l’envoi." }, { status: 409 });
    const delivery = send ? await deliverSubscription(orderId) : "saved";
    if (delivery === "sending") return NextResponse.json({ error: "Un envoi est déjà en cours. Vérifiez son statut dans quelques instants." }, { status: 409 });
    await addAdminLog("order.subscription", `Commande ${orderId} : ${delivery === "sent" ? "abonnement envoyé par email" : "informations enregistrées"}`);
    return NextResponse.json({ order: await getOrderById(orderId), delivery });
  } catch (error) {
    if (error instanceof PaymentError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[subscription] Admin action failed");
    return NextResponse.json({ error: "Impossible d’enregistrer ou d’envoyer l’abonnement." }, { status: 500 });
  }
}
