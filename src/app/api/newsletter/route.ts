import { NextRequest, NextResponse } from "next/server";
import { subscribeNewsletter } from "@/lib/store";
import { rateLimit } from "@/lib/rateLimit";
import { validate, newsletterSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 5, prefix: "newsletter" });
  if (limited) return limited;
  try {
    const parsed = validate(newsletterSchema, await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const result = await subscribeNewsletter(parsed.data.email.toLowerCase());
    if (result.alreadyExists) {
      return NextResponse.json({ ok: true, alreadyExists: true });
    }
    return NextResponse.json({ ok: true, alreadyExists: false });
  } catch (err) {
    console.error("[newsletter]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
