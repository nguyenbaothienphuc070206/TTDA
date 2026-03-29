import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";

import { APP_ROLES, getAppRoleForUserId } from "./lib/supabase/roles";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  localePrefix: "never",
});

function asText(value) {
  return String(value || "").trim();
}

function sanitizeClientIp(value) {
  const raw = asText(value).toLowerCase();
  if (!raw) return "";

  const first = asText(raw.split(",")[0]);
  const v6 = first.includes("]") ? first.split("]")[0].replace("[", "") : first;
  const plain = v6.startsWith("::ffff:") ? v6.slice(7) : v6;
  if (!plain) return "";

  if (!/^[0-9a-f:.]{2,64}$/i.test(plain)) return "";
  return plain;
}

function readClientIp(request) {
  const cf = sanitizeClientIp(request.headers.get("cf-connecting-ip"));
  if (cf) return cf;

  const xff = sanitizeClientIp(request.headers.get("x-forwarded-for"));
  if (xff) return xff;

  const xr = sanitizeClientIp(request.headers.get("x-real-ip"));
  if (xr) return xr;

  return "unknown";
}

async function sha256Hex(input) {
  const bytes = new TextEncoder().encode(asText(input));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const arr = Array.from(new Uint8Array(digest));
  return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function setSecurityHeaders(res, requestId) {
  res.headers.set("x-request-id", asText(requestId));
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  res.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  res.headers.set("Origin-Agent-Cluster", "?1");

  if (process.env.NODE_ENV === "production") {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
}

function isWriteMethod(method) {
  const m = asText(method).toUpperCase();
  return m === "POST" || m === "PUT" || m === "PATCH" || m === "DELETE";
}

function toSafeInteger(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function selectRateLimitConfig(request) {
  const windowSec = toSafeInteger(process.env.RATE_LIMIT_GLOBAL_WINDOW_SEC, 60, 10, 3600);
  const writeLimit = toSafeInteger(process.env.RATE_LIMIT_GLOBAL_LIMIT_WRITE, 240, 20, 50_000);
  const readLimit = toSafeInteger(process.env.RATE_LIMIT_GLOBAL_LIMIT_READ, 1200, 100, 200_000);
  const limit = isWriteMethod(request.method) ? writeLimit : readLimit;

  return {
    windowSec,
    limit,
    enabled: limit > 0,
  };
}

async function runUpstashCommand(command) {
  const baseUrl = asText(process.env.RATE_LIMIT_UPSTASH_REDIS_REST_URL).replace(/\/$/, "");
  const token = asText(process.env.RATE_LIMIT_UPSTASH_REDIS_REST_TOKEN);

  if (!baseUrl || !token) {
    return { ok: false, reason: "upstash_not_configured" };
  }

  const response = await fetch(`${baseUrl}/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) {
    return { ok: false, reason: "upstash_http_error" };
  }

  const data = await response.json().catch(() => null);
  if (!data || data.error) {
    return { ok: false, reason: "upstash_response_error" };
  }

  return { ok: true, result: data.result };
}

async function checkDistributedRateLimit({ key, limit, windowSec }) {
  const lua = [
    "local current = redis.call('INCR', KEYS[1])",
    "if current == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end",
    "local ttl = redis.call('TTL', KEYS[1])",
    "return {current, ttl}",
  ].join(" ");

  const result = await runUpstashCommand(["EVAL", lua, 1, key, String(windowSec)]);
  if (!result.ok) {
    return {
      ok: true,
      remaining: limit,
      retryAfterSec: 0,
      degraded: true,
    };
  }

  const pair = Array.isArray(result.result) ? result.result : [];
  const count = Number(pair[0]);
  const ttl = Number(pair[1]);
  const safeCount = Number.isFinite(count) ? count : 0;
  const safeTtl = Number.isFinite(ttl) && ttl > 0 ? ttl : windowSec;
  const remaining = Math.max(0, limit - safeCount);

  return {
    ok: safeCount <= limit,
    remaining,
    retryAfterSec: safeCount <= limit ? 0 : safeTtl,
    degraded: false,
  };
}

async function handleApiRequest(request, requestId) {
  const baseResponse = NextResponse.next();
  setSecurityHeaders(baseResponse, requestId);
  baseResponse.headers.set("Cache-Control", "no-store");

  const cfg = selectRateLimitConfig(request);
  if (!cfg.enabled) {
    return baseResponse;
  }

  const ip = readClientIp(request);
  const keyHash = (await sha256Hex(`${request.nextUrl.pathname}:${ip}`)).slice(0, 32);
  const bucket = `edge:rl:v1:${request.method.toUpperCase()}:${keyHash}`;

  const rl = await checkDistributedRateLimit({
    key: bucket,
    limit: cfg.limit,
    windowSec: cfg.windowSec,
  });

  if (!rl.ok) {
    const blocked = NextResponse.json(
      {
        ok: false,
        data: null,
        error: {
          code: "EDGE_RATE_LIMITED",
          message: "Too many requests. Please retry shortly.",
        },
      },
      { status: 429 }
    );

    setSecurityHeaders(blocked, requestId);
    blocked.headers.set("Cache-Control", "no-store");
    blocked.headers.set("Retry-After", String(rl.retryAfterSec || cfg.windowSec));
    blocked.headers.set("x-rate-limit-limit", String(cfg.limit));
    blocked.headers.set("x-rate-limit-remaining", "0");
    blocked.headers.set("x-rate-limit-window", String(cfg.windowSec));
    return blocked;
  }

  baseResponse.headers.set("x-rate-limit-limit", String(cfg.limit));
  baseResponse.headers.set("x-rate-limit-remaining", String(rl.remaining));
  baseResponse.headers.set("x-rate-limit-window", String(cfg.windowSec));
  baseResponse.headers.set("x-rate-limit-mode", rl.degraded ? "degraded-local" : "distributed");

  return baseResponse;
}

function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (String(key || "").startsWith("sb_secret_")) {
    return { url, key: "" };
  }

  return { url, key };
}

function redirectToLogin(request, reason) {
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("reason", reason);
  return NextResponse.redirect(url);
}

export async function proxy(request) {
  const requestId = asText(request.headers.get("x-request-id")) || crypto.randomUUID();
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api/")) {
    return handleApiRequest(request, requestId);
  }

  const intlResponse = intlMiddleware(request);
  setSecurityHeaders(intlResponse, requestId);

  const { url, key } = getSupabasePublicEnv();

  // Only enforce auth on /admin routes.
  if (!pathname.startsWith("/admin")) {
    return intlResponse;
  }

  // Allow the login page itself.
  if (pathname === "/admin/login") {
    return intlResponse;
  }

  if (!url || !key) {
    return redirectToLogin(request, "missing_supabase_env");
  }

  let response = intlResponse;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectToLogin(request, "unauthorized");
  }

  const role = await getAppRoleForUserId(supabase, user.id);

  if (role !== APP_ROLES.ADMIN && role !== APP_ROLES.COACH) {
    return redirectToLogin(request, "forbidden");
  }

  // Admin-only modules.
  if (pathname.startsWith("/admin/tai-chinh") && role !== APP_ROLES.ADMIN) {
    return redirectToLogin(request, "admin_only");
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next|.*\\..*).*)"],
};
