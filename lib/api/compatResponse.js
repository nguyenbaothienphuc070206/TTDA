import { NextResponse } from "next/server";

import { getRequestId } from "@/lib/api/enterprise";

function asText(value) {
  return String(value || "").trim();
}

function attachHeaders(res, requestId, retryAfterSec) {
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("x-request-id", asText(requestId));
  if (Number.isFinite(Number(retryAfterSec)) && Number(retryAfterSec) > 0) {
    res.headers.set("Retry-After", String(Math.max(1, Math.round(Number(retryAfterSec)))));
  }
  return res;
}

export function createCompatResponder(request) {
  const requestId = getRequestId(request);

  return {
    requestId,
    ok(payload, status = 200) {
      const res = NextResponse.json(payload, { status });
      return attachHeaders(res, requestId, 0);
    },
    fail({ message, code, status = 400, extra = null, retryAfterSec = 0 }) {
      const payload = {
        error: asText(message) || "Unexpected error.",
        code: asText(code) || "UNKNOWN_ERROR",
      };

      if (extra && typeof extra === "object") {
        Object.assign(payload, extra);
      }

      const res = NextResponse.json(payload, { status });
      return attachHeaders(res, requestId, retryAfterSec);
    },
  };
}
