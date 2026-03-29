import { callGateway } from "@/lib/api/gatewayClient";

function asText(value) {
  return String(value || "").trim();
}

function b64urlToArrayBuffer(b64url) {
  const base64 = asText(b64url).replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const normalized = base64 + (pad ? "=".repeat(4 - pad) : "");
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToB64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function mapTransport(raw) {
  if (typeof raw === "string") return raw;
  return "internal";
}

function normalizeCreationOptions(raw) {
  const options = { ...(raw || {}) };
  options.challenge = b64urlToArrayBuffer(options.challenge);
  if (options.user && options.user.id) {
    options.user = { ...options.user, id: b64urlToArrayBuffer(options.user.id) };
  }

  if (Array.isArray(options.excludeCredentials)) {
    options.excludeCredentials = options.excludeCredentials.map((c) => ({
      ...c,
      id: b64urlToArrayBuffer(c.id),
      transports: Array.isArray(c.transports) ? c.transports.map((t) => mapTransport(t)) : undefined,
    }));
  }

  return options;
}

function normalizeRequestOptions(raw) {
  const options = { ...(raw || {}) };
  options.challenge = b64urlToArrayBuffer(options.challenge);

  if (Array.isArray(options.allowCredentials)) {
    options.allowCredentials = options.allowCredentials.map((c) => ({
      ...c,
      id: b64urlToArrayBuffer(c.id),
      transports: Array.isArray(c.transports) ? c.transports.map((t) => mapTransport(t)) : undefined,
    }));
  }

  return options;
}

function credentialToJson(credential) {
  const response = credential.response || {};

  const out = {
    id: credential.id,
    rawId: arrayBufferToB64url(credential.rawId),
    type: credential.type,
    clientExtensionResults: credential.getClientExtensionResults?.() || {},
    response: {
      clientDataJSON: arrayBufferToB64url(response.clientDataJSON),
    },
  };

  if (response.attestationObject) {
    out.response.attestationObject = arrayBufferToB64url(response.attestationObject);
  }

  if (response.authenticatorData) {
    out.response.authenticatorData = arrayBufferToB64url(response.authenticatorData);
  }

  if (response.signature) {
    out.response.signature = arrayBufferToB64url(response.signature);
  }

  if (response.userHandle) {
    out.response.userHandle = arrayBufferToB64url(response.userHandle);
  }

  if (typeof response.transports === "function") {
    out.response.transports = response.transports();
  }

  return out;
}

async function postPasskey(body) {
  const res = await callGateway({
    target: "authPasskey",
    method: "POST",
    payload: body || {},
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(asText(data?.error) || asText(data?.message) || "Passkey request failed.");
  }

  return data;
}

export async function registerPasskey() {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    throw new Error("This browser does not support passkeys.");
  }

  const start = await postPasskey({ action: "register_options" });
  const options = normalizeCreationOptions(start?.options);
  const challenge = asText(start?.options?.challenge);

  const credential = await navigator.credentials.create({ publicKey: options });
  if (!credential) throw new Error("Passkey registration was cancelled.");

  const response = credentialToJson(credential);
  return postPasskey({ action: "register_verify", challenge, response });
}

export async function loginWithPasskey() {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    throw new Error("This browser does not support passkeys.");
  }

  const start = await postPasskey({ action: "login_options" });
  const options = normalizeRequestOptions(start?.options);
  const challenge = asText(start?.options?.challenge);

  const credential = await navigator.credentials.get({ publicKey: options });
  if (!credential) throw new Error("Passkey login was cancelled.");

  const response = credentialToJson(credential);
  return postPasskey({ action: "login_verify", challenge, response });
}

export async function logoutPasskey() {
  return postPasskey({ action: "logout" });
}
