import { NextRequest, NextResponse } from "next/server";
import { hashPassword, signToken, setAuthCookie, toSafeUser } from "@/lib/auth";
import { getUserByEmail, createUser } from "@/lib/store";
import { sendWelcomeEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 5, prefix: "register" });
  if (limited) return limited;
  try {
    const { firstName, lastName, email, password, phone } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères." }, { status: 400 });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ firstName, lastName, email, passwordHash, phone: phone ?? undefined });

    const token = await signToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.firstName).catch(err =>
      console.error("[email] Failed to send welcome email:", err)
    );

    return NextResponse.json({ user: toSafeUser(user) }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
