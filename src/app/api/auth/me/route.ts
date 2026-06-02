import { NextResponse } from "next/server";
import { getCurrentUser, toSafeUser } from "@/lib/auth";
import { getUserById } from "@/lib/store";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ user: null });

    const user = await getUserById(session.userId);
    if (!user) return NextResponse.json({ user: null });

    return NextResponse.json({ user: toSafeUser(user) });
  } catch {
    return NextResponse.json({ user: null });
  }
}
