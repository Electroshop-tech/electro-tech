import { NextRequest, NextResponse } from "next/server";
import { subscribeNewsletter } from "@/lib/store";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 5, prefix: "newsletter" });
  if (limited) return limited;
  try {
    const { email } = await req.json();
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
    }

    const result = await subscribeNewsletter(email.trim().toLowerCase());
    if (result.alreadyExists) {
      return NextResponse.json({ ok: true, alreadyExists: true });
    }
    return NextResponse.json({ ok: true, alreadyExists: false });
  } catch (err) {
    console.error("[newsletter]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
