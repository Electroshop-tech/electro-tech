import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "set-jwt-secret-in-env"
);

const ALLOWED_ORIGINS = new Set([
  "https://electroshop-tech.com",
  "https://www.electroshop-tech.com",
  "http://localhost:3000",
  "http://localhost:3001",
]);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── CSRF: check Origin on state-changing requests ──
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const origin = req.headers.get("origin");
    const isLocalhost = origin?.startsWith("http://localhost:");
    if (origin && !isLocalhost && !ALLOWED_ORIGINS.has(origin)) {
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

  // Pass pathname to server components via request header
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Files with extensions (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.\\w+$).*)",
  ],
};
