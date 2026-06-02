import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getAdminUserByEmail, setAdminUserLastLogin } from "@/lib/store";
import { verifyPassword } from "@/lib/auth";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
// Principal admin credentials — always available as a master login.
const MASTER_USERNAME = "admin";
const MASTER_PASSWORD = "hamid@2026";
const ADMIN_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "set-jwt-secret-in-env"
);
const COOKIE_NAME = "admin_token";

export async function POST(req: NextRequest) {
  const { password, email, remember } = await req.json();

  let staffRole = "owner";
  let name = "Administrateur";
  let uid: string | null = null;

  const identifier = typeof email === "string" ? email.trim() : "";
  const isMasterIdentifier =
    identifier === "" || identifier.toLowerCase() === MASTER_USERNAME;
  const isMasterPassword =
    password === MASTER_PASSWORD || (!!ADMIN_PASSWORD && password === ADMIN_PASSWORD);

  if (isMasterIdentifier && isMasterPassword) {
    // Principal admin (master) login — always works with admin / hamid@2026
    staffRole = "owner";
    name = "Administrateur";
    uid = null;
  } else if (identifier) {
    // Staff account login
    const user = await getAdminUserByEmail(identifier);
    if (!user || !user.active) {
      return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
    }
    const ok = await verifyPassword(password ?? "", user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
    }
    staffRole = user.role;
    name = user.name;
    uid = user.id;
    setAdminUserLastLogin(user.id).catch(() => {});
  } else {
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }

  // "Rester connecté" → 30 days, otherwise a 1-day session.
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
  const expiration = remember ? "30d" : "1d";

  const token = await new SignJWT({ role: "admin", staffRole, name, uid })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(ADMIN_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
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
