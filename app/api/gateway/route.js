import { createCompatResponder } from "@/lib/api/compatResponse";
import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";
import { resolveGatewayTarget } from "@/lib/api/gatewayRegistry";

function asText(value) {
  return String(value || "").trim();
}

function stripHopByHopHeaders(headers) {
  const out = new Headers();
  const blocked = new Set([
    "host",
    "connection",
    "content-length",
    "accept-encoding",
    "transfer-encoding",
    "upgrade",
  ]);

  for (const [k, v] of headers.entries()) {
    const key = asText(k).toLowerCase();
    if (!key || blocked.has(key)) continue;
    out.set(k, v);
  }

  return out;
}

async function proxyRequest(request, method) {
  const startedAt = Date.now();
  const api = createCompatResponder(request);
  const url = new URL(request.url);
  const target = asText(url.searchParams.get("target"));
  const spec = resolveGatewayTarget(target);

  if (!spec) {
    return api.fail({ message: "Gateway target is not allowed.", code: "GATEWAY_TARGET_INVALID", status: 400 });
  }

  const safeMethod = asText(method).toUpperCase();
  if (!spec.methods.includes(safeMethod)) {
    return api.fail({ message: "HTTP method is not allowed for target.", code: "METHOD_NOT_ALLOWED", status: 405 });
  }

  if (safeMethod !== "GET" && !isSameOrigin(request)) {
    return api.fail({ message: "Invalid origin.", code: "INVALID_ORIGIN", status: 403 });
  }

  if (safeMethod !== "GET" && isBodyTooLarge(request, 1_200_000)) {
    return api.fail({ message: "Request body too large.", code: "BODY_TOO_LARGE", status: 413 });
  }

  const rl = checkRateLimit({
    request,
    key: `gateway_${target}_${safeMethod.toLowerCase()}`,
    limit: safeMethod === "GET" ? 300 : 120,
    windowMs: 60 * 1000,
  });

  if (!rl.ok) {
    return api.fail({
      message: "Too many requests.",
      code: "RATE_LIMITED",
      status: 429,
      retryAfterSec: rl.retryAfterSec,
    });
  }

  const path = new URL(spec.path, url.origin);
  const passthrough = new URLSearchParams(url.searchParams);
  passthrough.delete("target");

  for (const [k, v] of passthrough.entries()) {
    path.searchParams.set(k, v);
  }

  let body;
  if (safeMethod !== "GET") {
    body = await request.text();
  }

  const headers = stripHopByHopHeaders(request.headers);
  headers.set("x-internal-gateway", "v1");

  const upstream = await fetch(path.toString(), {
    method: safeMethod,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const response = new Response(upstream.body, {
    status: upstream.status,
    headers: stripHopByHopHeaders(upstream.headers),
  });

  response.headers.set("Cache-Control", "no-store");
  response.headers.set("x-gateway-target", spec.target);
  response.headers.set("x-request-id", api.requestId);
  response.headers.set("x-gateway-latency-ms", String(Math.max(0, Date.now() - startedAt)));

  if (String(process.env.GATEWAY_AUDIT_LOG || "").trim() === "1") {
    const safePath = path.pathname;
    const entry = {
      at: new Date().toISOString(),
      requestId: api.requestId,
      target: spec.target,
      method: safeMethod,
      status: upstream.status,
      latencyMs: Math.max(0, Date.now() - startedAt),
      path: safePath,
    };
    console.log(`[gateway] ${JSON.stringify(entry)}`);
  }

  return response;
}

export async function GET(request) {
  return proxyRequest(request, "GET");
}

export async function POST(request) {
  return proxyRequest(request, "POST");
}

export async function PUT(request) {
  return proxyRequest(request, "PUT");
}

export async function PATCH(request) {
  return proxyRequest(request, "PATCH");
}

export async function DELETE(request) {
  return proxyRequest(request, "DELETE");
}
