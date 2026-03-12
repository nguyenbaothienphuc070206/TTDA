function parseForwardedFor(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const first = raw.split(",")[0];
  return String(first || "").trim();
}

export function getClientIp(request) {
  const xff = request?.headers?.get?.("x-forwarded-for");
  const ipFromXff = parseForwardedFor(xff);
  if (ipFromXff) return ipFromXff;

  const realIp = request?.headers?.get?.("x-real-ip");
  if (realIp) return String(realIp).trim();

  const cfIp = request?.headers?.get?.("cf-connecting-ip");
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
    ? String(protoHeader).split(",")[0].trim()
    : String(request?.nextUrl?.protocol || "http:").replace(":", "");

  const host =
    request?.headers?.get?.("x-forwarded-host") || request?.headers?.get?.("host") || "";

  const cleanHost = String(host).split(",")[0].trim();
  if (!cleanHost) return "";

  return `${proto}://${cleanHost}`;
}

export function isSameOrigin(request) {
  const origin = request?.headers?.get?.("origin");
  if (!origin) return true;

  const expected = toExpectedOrigin(request);
  if (!expected) return true;

  return String(origin) === expected;
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

  const ip = getClientIp(request);
  const safeKey = String(key || "").trim() || "default";
  const bucketKey = `${safeKey}:${ip}`;

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
