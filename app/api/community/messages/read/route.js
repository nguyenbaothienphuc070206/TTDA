import { NextResponse } from "next/server";

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

  if (isBodyTooLarge(request, 8_192)) {
    return jsonError({ message: "Request body too large.", code: "BODY_TOO_LARGE" }, { status: 413, requestId });
  }

  const rl = checkRateLimit({
    request,
    key: "community_messages_read",
    limit: 60,
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

    const nowIso = new Date().toISOString();

    const { error, count } = await supabase
      .from("community_messages")
      .update({ read_at: nowIso })
      .eq("sender_id", toUserId)
      .eq("recipient_id", user.id)
      .is("read_at", null)
      .select("id", { count: "exact", head: true });

    if (error) {
      return jsonError({ message: "Unable to mark messages as read.", code: "DB_WRITE_FAILED" }, { status: 500, requestId });
    }

    return jsonOk(
      {
        updatedCount: Number(count || 0),
      },
      { requestId }
    );
  } catch {
    return jsonError({ message: "Unable to mark messages as read.", code: "INTERNAL_ERROR" }, { status: 500, requestId });
  }
}