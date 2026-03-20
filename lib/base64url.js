function toBase64(bytesOrString) {
  if (typeof Buffer !== "undefined") {
    if (typeof bytesOrString === "string") {
      return Buffer.from(bytesOrString, "utf8").toString("base64");
    }
    return Buffer.from(bytesOrString).toString("base64");
  }

  if (typeof bytesOrString === "string") {
    // Encode UTF-8 string to base64 in browser
    const bytes = new TextEncoder().encode(bytesOrString);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 1) {
      bin += String.fromCharCode(bytes[i]);
    }
    return btoa(bin);
  }

  let bin = "";
  for (let i = 0; i < bytesOrString.length; i += 1) {
    bin += String.fromCharCode(bytesOrString[i]);
  }
  return btoa(bin);
}

function fromBase64(base64) {
  const b64 = String(base64 || "");

  if (typeof Buffer !== "undefined") {
    return Buffer.from(b64, "base64").toString("utf8");
  }

  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) {
    bytes[i] = bin.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function toUrlSafe(base64) {
  return String(base64 || "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromUrlSafe(b64url) {
  const raw = String(b64url || "").replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (raw.length % 4)) % 4;
  return raw + "=".repeat(padLen);
}

export function base64UrlEncode(text) {
  return toUrlSafe(toBase64(String(text || "")));
}

export function base64UrlDecode(b64url) {
  try {
    return fromBase64(fromUrlSafe(b64url));
  } catch {
    return "";
  }
}

export function base64UrlEncodeJson(obj) {
  try {
    const json = JSON.stringify(obj);
    return base64UrlEncode(json);
  } catch {
    return "";
  }
}

export function base64UrlDecodeJson(b64url) {
  const text = base64UrlDecode(b64url);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
