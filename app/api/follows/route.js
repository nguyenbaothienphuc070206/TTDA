import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";
import { asSafeText, getRequestId, isLikelyUserId, jsonError, jsonOk } from "@/lib/api/enterprise";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";

export async function GET(request) {
  const requestId = getRequestId(request);
  const supabase = createSupabaseRouteHandlerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError({ message: "Unauthorized.", code: "UNAUTHORIZED" }, { status: 401, requestId });
  }

  const { data, error } = await supabase
    .from("follows")
    .select("id,follower_id,following_id,created_at")
    .eq("follower_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return jsonError({ message: "Unable to load follows.", code: "DB_QUERY_FAILED" }, { status: 500, requestId });
  }

  return jsonOk({ follows: data || [] }, { requestId });
}

export async function POST(request) {
  const requestId = getRequestId(request);

  if (!isSameOrigin(request)) {
    return jsonError({ message: "Invalid origin.", code: "INVALID_ORIGIN" }, { status: 403, requestId });
  }

  if (isBodyTooLarge(request, 6_000)) {
    return jsonError({ message: "Request body too large.", code: "BODY_TOO_LARGE" }, { status: 413, requestId });
  }

  const rl = checkRateLimit({ request, key: "follows_post", limit: 40, windowMs: 60 * 1000 });
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
  const followingId = asSafeText(body?.following_id || body?.followingId, 120);

  if (!isLikelyUserId(followingId) || followingId === user.id) {
    return jsonError({ message: "Invalid following user.", code: "VALIDATION_ERROR" }, { status: 400, requestId });
  }

  const { data, error } = await supabase
    .from("follows")
    .insert({
      follower_id: user.id,
      following_id: followingId,
    })
    .select("id,follower_id,following_id,created_at")
    .single();

  if (error || !data) {
    return jsonError({ message: "Unable to follow user.", code: "DB_WRITE_FAILED" }, { status: 500, requestId });
  }

  return jsonOk({ follow: data }, { requestId });
}
