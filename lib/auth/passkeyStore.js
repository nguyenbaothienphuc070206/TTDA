import { randomUUID } from "node:crypto";

function asText(value) {
  return String(value || "").trim();
}

function getRoot() {
  if (!globalThis.__vovinamPasskeyStore) {
    globalThis.__vovinamPasskeyStore = {
      byUser: new Map(),
      byCredentialId: new Map(),
      challenges: new Map(),
    };
  }
  return globalThis.__vovinamPasskeyStore;
}

function cleanupChallenges(store) {
  const now = Date.now();
  for (const [challenge, data] of store.challenges.entries()) {
    if (!data || now > Number(data.expiresAtMs || 0)) {
      store.challenges.delete(challenge);
    }
  }
}

export function addPasskeyChallenge({ challenge, action, userId, ttlMs = 5 * 60 * 1000 }) {
  const store = getRoot();
  cleanupChallenges(store);

  const c = asText(challenge);
  if (!c) return;

  store.challenges.set(c, {
    action: asText(action),
    userId: asText(userId),
    expiresAtMs: Date.now() + Math.max(10_000, Number(ttlMs) || 300_000),
  });
}

export function consumePasskeyChallenge({ challenge, action }) {
  const store = getRoot();
  cleanupChallenges(store);

  const c = asText(challenge);
  if (!c) return null;

  const data = store.challenges.get(c);
  store.challenges.delete(c);

  if (!data) return null;
  if (asText(data.action) !== asText(action)) return null;
  return data;
}

export function upsertPasskeyCredential({ userId, credentialId, publicKeyBase64, counter, transports }) {
  const store = getRoot();
  const uid = asText(userId);
  const cid = asText(credentialId);

  if (!uid || !cid) return null;

  const next = {
    id: cid,
    userId: uid,
    publicKeyBase64: asText(publicKeyBase64),
    counter: Math.max(0, Math.round(Number(counter) || 0)),
    transports: Array.isArray(transports) ? transports.slice(0, 5).map((t) => asText(t)).filter(Boolean) : [],
    createdAt: new Date().toISOString(),
  };

  if (!store.byUser.has(uid)) {
    store.byUser.set(uid, []);
  }

  const list = store.byUser.get(uid) || [];
  const idx = list.findIndex((x) => asText(x?.id) === cid);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...next };
  } else {
    list.push(next);
  }

  store.byUser.set(uid, list);
  store.byCredentialId.set(cid, next);

  return next;
}

export function updatePasskeyCounter({ credentialId, counter }) {
  const store = getRoot();
  const cid = asText(credentialId);
  const found = store.byCredentialId.get(cid);
  if (!found) return;

  found.counter = Math.max(0, Math.round(Number(counter) || 0));
  store.byCredentialId.set(cid, found);

  const list = store.byUser.get(found.userId) || [];
  const idx = list.findIndex((x) => asText(x?.id) === cid);
  if (idx >= 0) {
    list[idx] = { ...list[idx], counter: found.counter };
    store.byUser.set(found.userId, list);
  }
}

export function getPasskeysByUserId(userId) {
  const store = getRoot();
  const uid = asText(userId);
  if (!uid) return [];
  return (store.byUser.get(uid) || []).slice();
}

export function getPasskeyByCredentialId(credentialId) {
  const store = getRoot();
  const cid = asText(credentialId);
  if (!cid) return null;
  return store.byCredentialId.get(cid) || null;
}

export function randomPasskeySessionToken() {
  return `${randomUUID()}-${randomUUID()}`;
}
