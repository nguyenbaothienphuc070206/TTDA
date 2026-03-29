import { NextResponse } from "next/server";

import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";
import { asSafeText, getRequestId, isLikelyUserId, jsonError, jsonOk } from "@/lib/api/enterprise";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";

function asText(value) {
  return String(value || "").trim();
}

function sanitizeLimit(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 30;
  return Math.min(50, Math.max(1, Math.round(n)));
}

function normalizeMessage(row, viewerId) {
  const senderId = asText(row?.sender_id);
  const recipientId = asText(row?.recipient_id);
  const createdAt = asText(row?.created_at);
  const readAt = asText(row?.read_at);

  return {
    id: asText(row?.id),
    senderId,
    recipientId,
    body: asText(row?.body),
    createdAt,
    readAt: readAt || null,
    isMine: senderId === viewerId,
  };
}

export async function GET(request) {
  const requestId = getRequestId(request);
  const rl = checkRateLimit({
    request,
    key: "community_messages_get",
    limit: 90,
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

  try {
    const supabase = createSupabaseRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonError({ message: "Unauthorized.", code: "UNAUTHORIZED" }, { status: 401, requestId });
    }

    const url = new URL(request.url);
    const toUserId = asText(url.searchParams.get("to"));
    const cursor = asText(url.searchParams.get("cursor"));
    const limit = sanitizeLimit(url.searchParams.get("limit"));

    if (!isLikelyUserId(toUserId)) {
      return jsonError({ message: "Invalid recipient.", code: "VALIDATION_ERROR" }, { status: 400, requestId });
    }

    let query = supabase
      .from("community_messages")
      .select("id,sender_id,recipient_id,body,created_at,read_at")
      .or(
        `and(sender_id.eq.${user.id},recipient_id.eq.${toUserId}),and(sender_id.eq.${toUserId},recipient_id.eq.${user.id})`
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data, error } = await query;
    if (error) {
      return jsonError({ message: "Unable to load messages.", code: "DB_QUERY_FAILED" }, { status: 500, requestId });
    }

    const rows = Array.isArray(data) ? data : [];
    const hasMore = rows.length > limit;
    const windowRows = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? asText(rows[limit]?.created_at) : "";

    const messages = windowRows
      .map((row) => normalizeMessage(row, user.id))
      .reverse();

    return jsonOk(
      {
        viewerId: user.id,
        messages,
        nextCursor: nextCursor || null,
      },
      { requestId }
    );
  } catch {
    return jsonError({ message: "Unable to load messages.", code: "INTERNAL_ERROR" }, { status: 500, requestId });
  }
}

export async function POST(request) {
  const requestId = getRequestId(request);
  if (!isSameOrigin(request)) {
    return jsonError({ message: "Invalid origin.", code: "INVALID_ORIGIN" }, { status: 403, requestId });
  }

  if (isBodyTooLarge(request, 16_000)) {
    return jsonError({ message: "Request body too large.", code: "BODY_TOO_LARGE" }, { status: 413, requestId });
  }

  const rl = checkRateLimit({
    request,
    key: "community_messages_post",
    limit: 40,
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
  const messageBody = asSafeText(body?.body, 1200);

  if (!isLikelyUserId(toUserId)) {
    return jsonError({ message: "Invalid recipient.", code: "VALIDATION_ERROR" }, { status: 400, requestId });
  }

  if (!messageBody) {
    return jsonError({ message: "Message cannot be empty.", code: "VALIDATION_ERROR" }, { status: 400, requestId });
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
      return jsonError({ message: "Cannot message yourself.", code: "VALIDATION_ERROR" }, { status: 400, requestId });
    }

    const { data, error } = await supabase
      .from("community_messages")
      .insert({
        sender_id: user.id,
        recipient_id: toUserId,
        body: messageBody,
      })
      .select("id,sender_id,recipient_id,body,created_at,read_at")
      .single();

    if (error || !data) {
      return jsonError({ message: "Unable to send message.", code: "DB_WRITE_FAILED" }, { status: 500, requestId });
    }

    return jsonOk(
      {
        message: normalizeMessage(data, user.id),
      },
      { requestId }
    );
  } catch {
    return jsonError({ message: "Unable to send message.", code: "INTERNAL_ERROR" }, { status: 500, requestId });
  }
}
