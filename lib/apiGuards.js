import { createHash } from "node:crypto";
import { isIP } from "node:net";

function asText(value) {
  return String(value || "").trim();
}

function parseForwardedForList(value) {
  const raw = asText(value);
  if (!raw) return [];

  return raw
    .split(",")
    .map((part) => asText(part))
    .filter(Boolean);
}

function parseTrustedProxyCount() {
  const n = Number(process.env.TRUSTED_PROXY_COUNT);
  if (!Number.isFinite(n)) return 1;
  return Math.max(0, Math.min(5, Math.round(n)));
}

function normalizeIp(candidate) {
  const raw = asText(candidate).toLowerCase();
  if (!raw) return "";

  const noPortV6 = raw.includes("]") ? raw.split("]")[0].replace("[", "") : raw;
  const noPortV4 = noPortV6.includes(":") && noPortV6.split(":").length === 2 ? noPortV6.split(":")[0] : noPortV6;
  const ip = noPortV4.startsWith("::ffff:") ? noPortV4.slice(7) : noPortV4;

  return isIP(ip) ? ip : "";
}

function pickClientIpFromXff(value) {
  const chain = parseForwardedForList(value)
    .map((part) => normalizeIp(part))
    .filter(Boolean);

  if (!chain.length) return "";

  const trustedProxyCount = parseTrustedProxyCount();
  const idx = chain.length - trustedProxyCount - 1;
  if (idx >= 0 && idx < chain.length) {
    return chain[idx];
  }

  return chain[0];
}

export function getClientIp(request) {
  const xff = request?.headers?.get?.("x-forwarded-for");
  const ipFromXff = pickClientIpFromXff(xff);
  if (ipFromXff) return ipFromXff;

  const realIp = normalizeIp(request?.headers?.get?.("x-real-ip"));
  if (realIp) return String(realIp).trim();

  const cfIp = normalizeIp(request?.headers?.get?.("cf-connecting-ip"));
  if (cfIp) return String(cfIp).trim();

  return "unknown";
}

export function isBodyTooLarge(request, maxBytes) {
  const raw = request?.headers?.get?.("content-length");
  const len = Number(raw);
  if (!Number.isFinite(len)) return false;
  return len > maxBytes;
}

function toExpectedOrigin(request) {
  const protoHeader = request?.headers?.get?.("x-forwarded-proto");
  const proto = protoHeader
    ? asText(protoHeader).split(",")[0].trim()
    : String(request?.nextUrl?.protocol || "http:").replace(":", "");

  const host =
    request?.headers?.get?.("x-forwarded-host") || request?.headers?.get?.("host") || "";

  const cleanHost = asText(host).split(",")[0].trim();
  if (!cleanHost) return "";

  return `${proto}://${cleanHost}`;
}

export function isSameOrigin(request) {
  const origin = request?.headers?.get?.("origin");
  if (!origin) return true;

  const expected = toExpectedOrigin(request);
  if (!expected) return true;

  return asText(origin) === expected;
}

function buildRateLimitActor(request) {
  const ip = getClientIp(request);
  if (ip !== "unknown") return ip;

  const ua = asText(request?.headers?.get?.("user-agent"));
  if (ua) return `ua:${ua.slice(0, 240)}`;
  return "anonymous";
}

function hashToken(value) {
  return createHash("sha256").update(asText(value)).digest("hex").slice(0, 24);
}

function getStore() {
  if (!globalThis.__vovinamRateLimitStore) {
    globalThis.__vovinamRateLimitStore = new Map();
  }
  return globalThis.__vovinamRateLimitStore;
}

function cleanupStoreIfNeeded(store, nowMs) {
  if (!store || typeof store.size !== "number") return;
  if (store.size < 500) return;

  for (const [key, value] of store.entries()) {
    if (!value || typeof value !== "object") {
      store.delete(key);
      continue;
    }

    const resetAtMs = Number(value.resetAtMs);
    if (!Number.isFinite(resetAtMs) || nowMs > resetAtMs + 60_000) {
      store.delete(key);
    }
  }
}

export function checkRateLimit({ request, key, limit, windowMs }) {
  const store = getStore();
  const nowMs = Date.now();
  cleanupStoreIfNeeded(store, nowMs);

  const actor = buildRateLimitActor(request);
  const safeKey = String(key || "").trim() || "default";
  const bucketKey = `${safeKey}:${hashToken(actor)}`;

  const safeLimit = Math.max(1, Math.round(Number(limit) || 1));
  const safeWindowMs = Math.max(1_000, Math.round(Number(windowMs) || 60_000));

  let entry = store.get(bucketKey);
  if (!entry || typeof entry !== "object") {
    entry = { count: 0, resetAtMs: nowMs + safeWindowMs };
    store.set(bucketKey, entry);
  }

  if (nowMs > entry.resetAtMs) {
    entry.count = 0;
    entry.resetAtMs = nowMs + safeWindowMs;
  }

  if (entry.count >= safeLimit) {
    const retryAfterSec = Math.max(1, Math.ceil((entry.resetAtMs - nowMs) / 1000));
    return {
      ok: false,
      limit: safeLimit,
      remaining: 0,
      resetAtMs: entry.resetAtMs,
      retryAfterSec,
    };
  }

  entry.count += 1;

  return {
    ok: true,
    limit: safeLimit,
    remaining: Math.max(0, safeLimit - entry.count),
    resetAtMs: entry.resetAtMs,
    retryAfterSec: 0,
  };
}

export function constantTimeEqual(a, b) {
  const s1 = String(a || "");
  const s2 = String(b || "");

  const len1 = s1.length;
  const len2 = s2.length;
  const max = Math.max(len1, len2);

  let diff = len1 ^ len2;

  for (let i = 0; i < max; i += 1) {
    const c1 = i < len1 ? s1.charCodeAt(i) : 0;
    const c2 = i < len2 ? s2.charCodeAt(i) : 0;
    diff |= c1 ^ c2;
  }

  return diff === 0;
}
