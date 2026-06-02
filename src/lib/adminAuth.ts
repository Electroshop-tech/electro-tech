import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "set-jwt-secret-in-env"
);
const COOKIE_NAME = "admin_token";

export async function isAdmin(req: NextRequest): Promise<boolean> {
  const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
  if (!cookieToken) return false;
  try {
    const { payload } = await jwtVerify(cookieToken, ADMIN_SECRET);
    return payload.role === "admin";
  } catch {
    return false;
  }
}
