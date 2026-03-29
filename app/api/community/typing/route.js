import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";
import { getRequestId, isLikelyUserId, jsonError, jsonOk } from "@/lib/api/enterprise";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";

function asText(value) {
  return String(value || "").trim();
}

export async function PUT(request) {
  const requestId = getRequestId(request);

  if (!isSameOrigin(request)) {
    return jsonError({ message: "Invalid origin.", code: "INVALID_ORIGIN" }, { status: 403, requestId });
  }

  if (isBodyTooLarge(request, 4_096)) {
    return jsonError({ message: "Request body too large.", code: "BODY_TOO_LARGE" }, { status: 413, requestId });
  }

  const rl = checkRateLimit({
    request,
    key: "community_typing_put",
    limit: 120,
    windowMs: 60 * 1000,
  });

  if (!rl.ok) {
    const res = jsonError(
      { message: "Too many requests. Please retry shortly.", code: "RATE_LIMITED" },
      { status: 429, requestId }
    );
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError({ message: "Invalid JSON body.", code: "INVALID_JSON" }, { status: 400, requestId });
  }

  const toUserId = asText(body?.toUserId);
  if (!isLikelyUserId(toUserId)) {
    return jsonError({ message: "Invalid recipient.", code: "VALIDATION_ERROR" }, { status: 400, requestId });
  }

  try {
    const supabase = createSupabaseRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonError({ message: "Unauthorized.", code: "UNAUTHORIZED" }, { status: 401, requestId });
    }

    if (user.id === toUserId) {
      return jsonError({ message: "Invalid recipient.", code: "VALIDATION_ERROR" }, { status: 400, requestId });
    }

    const nowIso = new Date().toISOString();

    const { error } = await supabase
      .from("community_typing_state")
      .upsert(
        {
          sender_id: user.id,
          recipient_id: toUserId,
          updated_at: nowIso,
        },
        { onConflict: "sender_id,recipient_id" }
      );

    if (error) {
      return jsonError({ message: "Unable to publish typing state.", code: "DB_WRITE_FAILED" }, { status: 500, requestId });
    }

    return jsonOk({ updatedAt: nowIso }, { requestId });
  } catch {
    return jsonError({ message: "Unable to publish typing state.", code: "INTERNAL_ERROR" }, { status: 500, requestId });
  }
}
