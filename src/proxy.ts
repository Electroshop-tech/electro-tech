import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { neon } from "@neondatabase/serverless";

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "set-jwt-secret-in-env"
);

const ALLOWED_ORIGINS = new Set([
  "https://electroshop-tech.com",
  "https://www.electroshop-tech.com",
  "http://localhost:3000",
  "http://localhost:3001",
]);

// ── Maintenance mode cache (30s TTL) ──────────────────────────────────────────
let _maintenanceCache: { value: boolean; ts: number } | null = null;
const CACHE_TTL = 30_000;

async function isMaintenanceOn(): Promise<boolean> {
  const now = Date.now();
  if (_maintenanceCache && now - _maintenanceCache.ts < CACHE_TTL) {
    return _maintenanceCache.value;
  }
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT value FROM "SiteSetting" WHERE key = 'maintenanceMode' LIMIT 1`;
    const value = rows[0]?.value === "true";
    _maintenanceCache = { value, ts: now };
    return value;
  } catch {
    return false; // on DB error, keep site live
  }
}

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

  // ── Maintenance mode (frontend routes only) ───────────────────────────────
  const isFrontendRoute =
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/_next") &&
    pathname !== "/maintenance" &&
    !/\.[a-zA-Z0-9]+$/.test(pathname); // skip files with extensions

  if (isFrontendRoute) {
    // Logged-in admins always bypass maintenance
    const adminToken = req.cookies.get("admin_token")?.value;
    let isAdmin = false;
    if (adminToken) {
      try {
        const { payload } = await jwtVerify(adminToken, ADMIN_SECRET);
        isAdmin = payload.role === "admin";
      } catch { /* not admin */ }
    }

    if (!isAdmin && await isMaintenanceOn()) {
      return NextResponse.redirect(new URL("/maintenance", req.url));
    }
  }

  return NextResponse.next();
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
