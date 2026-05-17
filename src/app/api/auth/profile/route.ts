import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, toSafeUser } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/store";

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

    const { firstName, lastName, phone, address } = await req.json();

    const updated = updateUser(session.userId, { firstName, lastName, phone, address });
    if (!updated) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });

    return NextResponse.json({ user: toSafeUser(updated) });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ user: null }, { status: 401 });

    const user = getUserById(session.userId);
    if (!user) return NextResponse.json({ user: null }, { status: 404 });

    return NextResponse.json({ user: toSafeUser(user) });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
