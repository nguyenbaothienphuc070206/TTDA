import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";
import { asSafeText, getRequestId, jsonError, jsonOk, isLikelyUserId } from "@/lib/api/enterprise";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";

function asInt(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export async function GET(request) {
  const requestId = getRequestId(request);
  const supabase = createSupabaseRouteHandlerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError({ message: "Unauthorized.", code: "UNAUTHORIZED" }, { status: 401, requestId });
  }

  const url = new URL(request.url);
  const targetUserId = asSafeText(url.searchParams.get("userId"), 120);

  let query = supabase
    .from("coach_feedback")
    .select("id,coach_id,user_id,video_id,video_url,timestamp_sec,comment,score,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (targetUserId) {
    query = query.eq("user_id", targetUserId);
  }

  const { data, error } = await query;

  if (error) {
    return jsonError({ message: "Unable to load coach feedback.", code: "DB_QUERY_FAILED" }, { status: 500, requestId });
  }

  return jsonOk({ feedback: data || [] }, { requestId });
}

export async function POST(request) {
  const requestId = getRequestId(request);

  if (!isSameOrigin(request)) {
    return jsonError({ message: "Invalid origin.", code: "INVALID_ORIGIN" }, { status: 403, requestId });
  }

  if (isBodyTooLarge(request, 14_000)) {
    return jsonError({ message: "Request body too large.", code: "BODY_TOO_LARGE" }, { status: 413, requestId });
  }

  const rl = checkRateLimit({
    request,
    key: "coach_feedback_post",
    limit: 30,
    windowMs: 60 * 1000,
  });

  if (!rl.ok) {
    const res = jsonError({ message: "Too many requests.", code: "RATE_LIMITED" }, { status: 429, requestId });
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }

  const supabase = createSupabaseRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError({ message: "Unauthorized.", code: "UNAUTHORIZED" }, { status: 401, requestId });
  }

  const body = await request.json().catch(() => ({}));
  const userId = asSafeText(body?.userId, 120);
  const videoId = asSafeText(body?.videoId, 120) || null;
  const videoUrl = asSafeText(body?.videoUrl, 500) || null;
  const comment = asSafeText(body?.comment, 1200);
  const timestampSec = asInt(body?.timestampSec);
  const score = asInt(body?.score);

  if (!isLikelyUserId(userId) || !comment) {
    return jsonError({ message: "Invalid payload.", code: "VALIDATION_ERROR" }, { status: 400, requestId });
  }

  const { data, error } = await supabase
    .from("coach_feedback")
    .insert({
      coach_id: user.id,
      user_id: userId,
      video_id: videoId,
      video_url: videoUrl,
      timestamp_sec: timestampSec,
      comment,
      score,
    })
    .select("id,coach_id,user_id,video_id,video_url,timestamp_sec,comment,score,created_at")
    .single();

  if (error || !data) {
    return jsonError({ message: "Unable to create feedback.", code: "DB_WRITE_FAILED" }, { status: 500, requestId });
  }

  return jsonOk({ feedback: data }, { requestId });
}
