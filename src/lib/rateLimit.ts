import { NextRequest, NextResponse } from "next/server";

const windowMs = 60_000; // 1 minute window
const buckets = new Map<string, { count: number; resetAt: number }>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of buckets) {
    if (val.resetAt < now) buckets.delete(key);
  }
}, 300_000);

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Simple in-memory rate limiter per IP.
 * Returns null if allowed, or a 429 response if rate-limited.
 */
export function rateLimit(
  req: NextRequest,
  { limit = 10, prefix = "global" }: { limit?: number; prefix?: string } = {}
): NextResponse | null {
  const ip = getIP(req);
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  bucket.count++;
  if (bucket.count > limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans un instant." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      }
    );
  }

  return null;
}
