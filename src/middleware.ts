import { NextRequest, NextResponse } from "next/server";

/**
 * Edge-compatible in-memory rate limiter.
 *
 * Limits:
 *   /api/constraints    — 30 req / 60s per IP  (address lookups)
 *   /api/dashboard/*    — 20 req / 60s per IP  (AI assess + document generation)
 *   /api/stripe/*       — 20 req / 60s per IP  (payment flows)
 *   /api/address/*      — 60 req / 60s per IP  (autocomplete — higher limit)
 *
 * Note: In a multi-instance deployment (Cloudflare Pages / Vercel edge)
 * each instance has its own counter. For true global rate limiting, replace
 * this with Cloudflare KV or Upstash Redis. This implementation prevents
 * abusive single-client bursts which is the primary threat vector.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/constraints":       { max: 30,  windowMs: 60_000 },
  "/api/dashboard/assess":  { max: 20,  windowMs: 60_000 },
  "/api/dashboard/generate":{ max: 20,  windowMs: 60_000 },
  "/api/stripe":            { max: 20,  windowMs: 60_000 },
  "/api/address":           { max: 60,  windowMs: 60_000 },
};

function getLimit(pathname: string) {
  for (const [prefix, limit] of Object.entries(LIMITS)) {
    if (pathname.startsWith(prefix)) return limit;
  }
  return null;
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const limit = getLimit(pathname);

  if (!limit) return NextResponse.next();

  const ip  = getClientIp(req);
  const key = `${ip}:${pathname.split("/").slice(0, 4).join("/")}`;
  const now = Date.now();

  let entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + limit.windowMs };
  }

  entry.count++;
  store.set(key, entry);

  // Occasionally prune expired entries to avoid unbounded memory growth
  if (Math.random() < 0.01) {
    for (const [k, v] of store.entries()) {
      if (v.resetAt <= now) store.delete(k);
    }
  }

  if (entry.count > limit.max) {
    return new NextResponse(
      JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
          "X-RateLimit-Limit": String(limit.max),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    );
  }

  const res = NextResponse.next();
  res.headers.set("X-RateLimit-Limit", String(limit.max));
  res.headers.set("X-RateLimit-Remaining", String(limit.max - entry.count));
  res.headers.set("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));
  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
