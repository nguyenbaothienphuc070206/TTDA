import { randomUUID } from "node:crypto";

function asText(value) {
  return String(value || "").trim();
}

function toSafeInt(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : fallback;
}

function getMemoryStore() {
  if (!globalThis.__vovinamPasskeyPersistentStore) {
    globalThis.__vovinamPasskeyPersistentStore = {
      credentials: new Map(),
      userIndex: new Map(),
      challenges: new Map(),
    };
  }
  return globalThis.__vovinamPasskeyPersistentStore;
}

function getRedisConfig() {
  const baseUrl = asText(process.env.PASSKEY_UPSTASH_REDIS_REST_URL || process.env.RATE_LIMIT_UPSTASH_REDIS_REST_URL).replace(/\/$/, "");
  const token = asText(process.env.PASSKEY_UPSTASH_REDIS_REST_TOKEN || process.env.RATE_LIMIT_UPSTASH_REDIS_REST_TOKEN);
  if (!baseUrl || !token) return null;
  return { baseUrl, token };
}

async function runRedisCommand(command) {
  const cfg = getRedisConfig();
  if (!cfg) {
    return { ok: false, reason: "redis_not_configured", result: null };
  }

  try {
    const res = await fetch(`${cfg.baseUrl}/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
      cache: "no-store",
    });

    if (!res.ok) {
      return { ok: false, reason: "redis_http_error", result: null };
    }

    const data = await res.json().catch(() => null);
    if (!data || data.error) {
      return { ok: false, reason: "redis_response_error", result: null };
    }

    return { ok: true, reason: "", result: data.result };
  } catch {
    return { ok: false, reason: "redis_network_error", result: null };
  }
}

function challengeKey(challenge) {
  return `passkey:challenge:${asText(challenge)}`;
}

function credentialKey(credentialId) {
  return `passkey:credential:${asText(credentialId)}`;
}

function userSetKey(userId) {
  return `passkey:user:${asText(userId)}:credentials`;
}

function normalizeCredential(input) {
  return {
    id: asText(input?.id),
    userId: asText(input?.userId),
    publicKeyBase64: asText(input?.publicKeyBase64),
    counter: toSafeInt(input?.counter, 0),
    transports: Array.isArray(input?.transports)
      ? input.transports.map((t) => asText(t)).filter(Boolean).slice(0, 8)
      : [],
    createdAt: asText(input?.createdAt) || new Date().toISOString(),
  };
}

function parseJsonOrNull(raw) {
  const text = asText(raw);
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function putPasskeyChallenge({ challenge, action, userId, ttlSec = 300 }) {
  const c = asText(challenge);
  if (!c) return;

  const payload = {
    challenge: c,
    action: asText(action),
    userId: asText(userId),
    createdAt: new Date().toISOString(),
    expiresAtMs: Date.now() + Math.max(10, Number(ttlSec) || 300) * 1000,
  };

  const redisRes = await runRedisCommand(["SETEX", challengeKey(c), String(Math.max(10, Number(ttlSec) || 300)), JSON.stringify(payload)]);
  if (redisRes.ok) return;

  const mem = getMemoryStore();
  mem.challenges.set(c, payload);
}

export async function takePasskeyChallenge({ challenge, action }) {
  const c = asText(challenge);
  if (!c) return null;

  const redisDel = await runRedisCommand(["GETDEL", challengeKey(c)]);
  if (redisDel.ok) {
    const parsed = parseJsonOrNull(redisDel.result);
    if (!parsed) return null;
    if (asText(parsed.action) !== asText(action)) return null;
    return parsed;
  }

  const mem = getMemoryStore();
  const data = mem.challenges.get(c) || null;
  mem.challenges.delete(c);
  if (!data) return null;
  if (Date.now() > toSafeInt(data.expiresAtMs, 0)) return null;
  if (asText(data.action) !== asText(action)) return null;
  return data;
}

export async function upsertPasskeyCredential(input) {
  const next = normalizeCredential(input);
  if (!next.id || !next.userId || !next.publicKeyBase64) return null;

  const redisSet = await runRedisCommand(["SET", credentialKey(next.id), JSON.stringify(next)]);
  if (redisSet.ok) {
    await runRedisCommand(["SADD", userSetKey(next.userId), next.id]);
    return next;
  }

  const mem = getMemoryStore();
  mem.credentials.set(next.id, next);

  if (!mem.userIndex.has(next.userId)) {
    mem.userIndex.set(next.userId, new Set());
  }
  mem.userIndex.get(next.userId).add(next.id);

  return next;
}

export async function getPasskeyCredentialById(credentialId) {
  const id = asText(credentialId);
  if (!id) return null;

  const redisGet = await runRedisCommand(["GET", credentialKey(id)]);
  if (redisGet.ok) {
    return parseJsonOrNull(redisGet.result);
  }

  const mem = getMemoryStore();
  return mem.credentials.get(id) || null;
}

export async function listPasskeysByUserId(userId) {
  const uid = asText(userId);
  if (!uid) return [];

  const redisMembers = await runRedisCommand(["SMEMBERS", userSetKey(uid)]);
  if (redisMembers.ok && Array.isArray(redisMembers.result)) {
    const items = [];
    for (const idRaw of redisMembers.result.slice(0, 50)) {
      const id = asText(idRaw);
      if (!id) continue;
      const one = await getPasskeyCredentialById(id);
      if (one) items.push(normalizeCredential(one));
    }
    return items;
  }

  const mem = getMemoryStore();
  const ids = Array.from(mem.userIndex.get(uid) || []);
  return ids.map((id) => mem.credentials.get(id)).filter(Boolean);
}

export async function updatePasskeyCounter({ credentialId, counter }) {
  const id = asText(credentialId);
  if (!id) return;

  const existing = await getPasskeyCredentialById(id);
  if (!existing) return;

  const next = {
    ...normalizeCredential(existing),
    counter: toSafeInt(counter, toSafeInt(existing.counter, 0)),
  };

  await upsertPasskeyCredential(next);
}

export function randomPasskeySessionToken() {
  return `${randomUUID()}-${randomUUID()}`;
}
