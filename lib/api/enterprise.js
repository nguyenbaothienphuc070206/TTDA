import { randomUUID } from "node:crypto";

function asText(value) {
  return String(value || "").trim();
}

export function getRequestId(request) {
  const fromHeader = asText(request?.headers?.get?.("x-request-id"));
  if (fromHeader) {
    return fromHeader.slice(0, 80);
  }
  return randomUUID();
}

export function jsonNoStoreWithRequestId(payload, { status = 200, requestId = "" } = {}) {
  const safeRequestId = asText(requestId) || randomUUID();
  const res = Response.json(payload, { status });
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("x-request-id", safeRequestId);
  return res;
}

export function jsonOk(data, { requestId = "", status = 200 } = {}) {
  return jsonNoStoreWithRequestId(
    {
      ok: true,
      data,
      error: null,
    },
    { status, requestId }
  );
}

export function jsonError(
  {
    message,
    code = "UNKNOWN_ERROR",
    details = null,
  },
  { requestId = "", status = 400 } = {}
) {
  return jsonNoStoreWithRequestId(
    {
      ok: false,
      data: null,
      error: {
        code: asText(code) || "UNKNOWN_ERROR",
        message: asText(message) || "Unexpected error.",
        details,
      },
    },
    { status, requestId }
  );
}

export function isLikelyUserId(value) {
  const s = asText(value);
  if (!s) return false;
  if (s.length < 8 || s.length > 128) return false;
  return /^[a-zA-Z0-9-]+$/.test(s);
}

export function asSafeText(value, maxLen = 500) {
  return asText(value).slice(0, Math.max(1, Number(maxLen) || 1));
}