import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token manquant." }, { status: 400 });
  }

  try {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!subscriber) {
      return NextResponse.json({ error: "Lien invalide ou déjà utilisé." }, { status: 404 });
    }

    await prisma.newsletterSubscriber.delete({ where: { id: subscriber.id } });

    // Redirect to homepage with success message
    return NextResponse.redirect(new URL("/?unsubscribed=1", req.url));
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
