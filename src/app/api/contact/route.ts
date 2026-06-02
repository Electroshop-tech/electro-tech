import { NextRequest, NextResponse } from "next/server";
import { sendContactNotification } from "@/lib/email";
import { rateLimit } from "@/lib/rateLimit";
import { validate, contactSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 3, prefix: "contact" });
  if (limited) return limited;
  try {
    const parsed = validate(contactSchema, await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { name, email, phone, subject, message } = parsed.data;

    // Send notification to admin (non-blocking)
    sendContactNotification({
      name,
      email,
      phone,
      subject,
      message,
    }).catch((err) => console.error("[contact] Email send error:", err));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
