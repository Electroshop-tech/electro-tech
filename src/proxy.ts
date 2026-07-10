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

// ── Maintenance mode cache (30s TTL) ──────────────────────────────────────────
let _maintenanceCache: { value: boolean; ts: number } | null = null;
const CACHE_TTL = 30_000;

async function isMaintenanceOn(req: NextRequest): Promise<boolean> {
  const now = Date.now();
  if (_maintenanceCache && now - _maintenanceCache.ts < CACHE_TTL) {
    return _maintenanceCache.value;
  }
  try {
    const url = new URL("/api/maintenance-status", req.url);
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return false;
    const data = await res.json() as { maintenance: boolean };
    _maintenanceCache = { value: data.maintenance, ts: now };
    return data.maintenance;
  } catch {
    return false;
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

  // ── Maintenance mode (page routes only) ──────────────────────────────────
  const isPageRoute =
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/_next") &&
    pathname !== "/maintenance" &&
    !/\.[a-zA-Z0-9]+$/.test(pathname);

  if (isPageRoute) {
    // Admins bypass maintenance
    const adminToken = req.cookies.get("admin_token")?.value;
    let isAdmin = false;
    if (adminToken) {
      try {
        const { payload } = await jwtVerify(adminToken, ADMIN_SECRET);
        isAdmin = payload.role === "admin";
      } catch { /* not admin */ }
    }

    if (!isAdmin && await isMaintenanceOn(req)) {
      return NextResponse.redirect(new URL("/maintenance", req.url));
    }
  }

  // Pass pathname to server components + disable CDN caching for page routes
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  if (isPageRoute || pathname.startsWith("/admin")) {
    res.headers.set("Cache-Control", "no-store");
  }
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.\\w+$).*)",
  ],
};
