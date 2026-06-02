import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const ADMIN_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "set-jwt-secret-in-env"
);
const COOKIE_NAME = "admin_token";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Admin non configuré" }, { status: 500 });
  }
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(ADMIN_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ ok: true });
}

// Verify admin token — used by other admin API routes
export async function verifyAdminToken(req: NextRequest): Promise<boolean> {
  // Check cookie first
  const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
  if (cookieToken) {
    try {
      const { payload } = await jwtVerify(cookieToken, ADMIN_SECRET);
      return payload.role === "admin";
    } catch { /* invalid token */ }
  }

  // Fallback: check x-admin-key header (for backward compat during migration)
  const headerKey = req.headers.get("x-admin-key");
  if (headerKey === ADMIN_PASSWORD) return true;

  return false;
}
