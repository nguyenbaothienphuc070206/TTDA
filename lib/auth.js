const SESSION_COOKIE = "vovinam_session_v1";

function bytesToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  if (typeof btoa === "function") return btoa(binary);

  // Node.js fallback
  const NodeBuffer = globalThis.Buffer;
  if (!NodeBuffer) throw new Error("Buffer is not available");
  return NodeBuffer.from(binary, "binary").toString("base64");
}

function base64ToBytes(b64) {
  if (typeof atob === "function") {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  // Node.js fallback
  const NodeBuffer = globalThis.Buffer;
  if (!NodeBuffer) throw new Error("Buffer is not available");
  return new Uint8Array(NodeBuffer.from(b64, "base64"));
}

function base64UrlEncode(bytes) {
  const b64 = bytesToBase64(bytes);
  return b64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlDecodeToBytes(str) {
  const s = String(str || "").replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s + pad;
  return base64ToBytes(b64);
}

async function hmacSha256(secret, data) {
  const keyBytes = new TextEncoder().encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

export function sessionCookieName() {
  return SESSION_COOKIE;
}

export function roles() {
  return {
    ADMIN: "admin",
    COACH: "coach",
    LEARNER: "learner",
  };
}

export async function createSessionToken({ role, subject, expiresAt, secret }) {
  const payload = {
    v: 1,
    role,
    sub: subject || "user",
    exp: expiresAt,
    iat: Date.now(),
  };

  const payloadJson = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(payloadJson));

  const sig = await hmacSha256(secret, payloadB64);
  const sigB64 = base64UrlEncode(sig);

  return `${payloadB64}.${sigB64}`;
}

export async function verifySessionToken(token, secret) {
  const t = String(token || "");
  const [payloadB64, sigB64] = t.split(".");
  if (!payloadB64 || !sigB64) return null;

  const expected = await hmacSha256(secret, payloadB64);
  const expectedB64 = base64UrlEncode(expected);
  if (expectedB64 !== sigB64) return null;

  try {
    const payloadBytes = base64UrlDecodeToBytes(payloadB64);
    const payloadJson = new TextDecoder().decode(payloadBytes);
    const payload = JSON.parse(payloadJson);

    if (!payload || typeof payload !== "object") return null;
    if (payload.v !== 1) return null;
    if (payload.exp && Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}
