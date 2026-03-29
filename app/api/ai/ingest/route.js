import { createCompatResponder } from "@/lib/api/compatResponse";
import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";
import { ingestPolymorphicPayload } from "@/lib/ai/ingestionEngine";

function asText(value) {
  return String(value || "").trim();
}

export async function POST(request) {
  const api = createCompatResponder(request);

  if (!isSameOrigin(request)) {
    return api.fail({ message: "Invalid origin.", code: "INVALID_ORIGIN", status: 403 });
  }

  if (isBodyTooLarge(request, 1_000_000)) {
    return api.fail({ message: "Body too large.", code: "BODY_TOO_LARGE", status: 413 });
  }

  const rl = checkRateLimit({
    request,
    key: "ai_ingest",
    limit: 180,
    windowMs: 60 * 1000,
  });

  if (!rl.ok) {
    return api.fail({
      message: "Too many ingestion requests.",
      code: "RATE_LIMITED",
      status: 429,
      retryAfterSec: rl.retryAfterSec,
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return api.fail({ message: "Invalid JSON body.", code: "INVALID_JSON", status: 400 });
  }

  const sessionId = asText(body?.sessionId).slice(0, 120);
  const source = asText(body?.source || "unknown").slice(0, 60);

  const result = ingestPolymorphicPayload(body || {});
  if (!result.ok) {
    return api.fail({
      message: result.error.message,
      code: result.error.code,
      status: 400,
    });
  }

  return api.ok({
    accepted: true,
    sessionId: sessionId || null,
    source,
    ingestion: result.data,
  });
}
