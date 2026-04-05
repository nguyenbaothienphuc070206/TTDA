import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";
import { asSafeText, getRequestId, jsonError, jsonOk } from "@/lib/api/enterprise";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";

function asLimit(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 50;
  return Math.min(200, Math.max(1, Math.round(n)));
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
  const beltGroup = asSafeText(url.searchParams.get("belt_group") || url.searchParams.get("beltGroup"), 80);
  const limit = asLimit(url.searchParams.get("limit"));

  let query = supabase
    .from("messages")
    .select("id,user_id,content,belt_group,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (beltGroup) {
    query = query.eq("belt_group", beltGroup);
  }

  const { data, error } = await query;

  if (error) {
    return jsonError({ message: "Unable to load messages.", code: "DB_QUERY_FAILED" }, { status: 500, requestId });
  }

  return jsonOk({ messages: (data || []).reverse() }, { requestId });
}

export async function POST(request) {
  const requestId = getRequestId(request);

  if (!isSameOrigin(request)) {
    return jsonError({ message: "Invalid origin.", code: "INVALID_ORIGIN" }, { status: 403, requestId });
  }

  if (isBodyTooLarge(request, 12_000)) {
    return jsonError({ message: "Request body too large.", code: "BODY_TOO_LARGE" }, { status: 413, requestId });
  }

  const rl = checkRateLimit({ request, key: "community_post", limit: 30, windowMs: 60 * 1000 });
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
  const content = asSafeText(body?.content, 1200);
  const beltGroup = asSafeText(body?.belt_group || body?.beltGroup, 80) || "all";

  if (!content) {
    return jsonError({ message: "Missing content.", code: "VALIDATION_ERROR" }, { status: 400, requestId });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      user_id: user.id,
      content,
      belt_group: beltGroup,
    })
    .select("id,user_id,content,belt_group,created_at")
    .single();

  if (error || !data) {
    return jsonError({ message: "Unable to send message.", code: "DB_WRITE_FAILED" }, { status: 500, requestId });
  }

  return jsonOk({ message: data }, { requestId });
}
