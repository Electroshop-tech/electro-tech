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

export interface AdminPayload {
  role: string;
  staffRole: string;
  name: string;
  uid: string | null;
}

export async function getAdminPayload(req: NextRequest): Promise<AdminPayload | null> {
  const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
  if (!cookieToken) return null;
  try {
    const { payload } = await jwtVerify(cookieToken, ADMIN_SECRET);
    if (payload.role !== "admin") return null;
    return {
      role: String(payload.role),
      staffRole: typeof payload.staffRole === "string" ? payload.staffRole : "owner",
      name: typeof payload.name === "string" ? payload.name : "Administrateur",
      uid: typeof payload.uid === "string" ? payload.uid : null,
    };
  } catch {
    return null;
  }
}
