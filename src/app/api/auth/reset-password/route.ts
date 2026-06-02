import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 5, prefix: "reset-pw" });
  if (limited) return limited;

  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { resetToken: token } });
    if (!user || !user.resetExpiry || user.resetExpiry < new Date()) {
      return NextResponse.json({ error: "Lien expiré ou invalide. Veuillez refaire une demande." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetExpiry: null },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
