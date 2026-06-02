import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "MISSING_JWT_SECRET"
);

const ALLOWED_ORIGINS = new Set([
  "https://electroshop-tech.com",
  "https://www.electroshop-tech.com",
  "http://localhost:3000",
]);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── CSRF: check Origin on state-changing requests ──
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const origin = req.headers.get("origin");
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // ── Admin route protection ──
  if (pathname.startsWith("/api/admin")) {
    // Allow login/logout endpoints without token
    if (pathname === "/api/admin/auth") return NextResponse.next();

    const token = req.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, ADMIN_SECRET);
      if (payload.role !== "admin") throw new Error("Not admin");
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/admin/:path*",
    "/api/auth/:path*",
    "/api/contact",
    "/api/newsletter",
    "/api/orders/:path*",
  ],
};
