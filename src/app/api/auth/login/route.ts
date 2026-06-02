import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, signToken, setAuthCookie, toSafeUser } from "@/lib/auth";
import { getUserByEmail } from "@/lib/store";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 5, prefix: "login" });
  if (limited) return limited;
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
    }

    const token = await signToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    return NextResponse.json({ user: toSafeUser(user) });
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
