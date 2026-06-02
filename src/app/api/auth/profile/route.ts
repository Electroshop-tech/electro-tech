import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, toSafeUser } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/store";

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

    const { firstName, lastName, phone, address, avatar } = await req.json();

    // Validate avatar size if provided (max ~2MB base64)
    if (avatar !== undefined && avatar !== null && typeof avatar === "string" && avatar.length > 2_800_000) {
      return NextResponse.json({ error: "Image trop volumineuse (max 2 Mo)." }, { status: 413 });
    }

    const updated = await updateUser(session.userId, {
      firstName, lastName, phone, address,
      ...(avatar !== undefined ? { avatar: avatar ?? undefined } : {}),
    });
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

    const user = await getUserById(session.userId);
    if (!user) return NextResponse.json({ user: null }, { status: 404 });

    return NextResponse.json({ user: toSafeUser(user) });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
