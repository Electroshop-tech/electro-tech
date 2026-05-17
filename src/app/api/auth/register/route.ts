import { NextRequest, NextResponse } from "next/server";
import { hashPassword, signToken, setAuthCookie, toSafeUser } from "@/lib/auth";
import { getUserByEmail, createUser } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, phone } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères." }, { status: 400 });
    }

    const existing = getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = createUser({ firstName, lastName, email, passwordHash, phone: phone ?? undefined });

    const token = await signToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    return NextResponse.json({ user: toSafeUser(user) }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
