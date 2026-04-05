import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";
import { asSafeText, getRequestId, jsonError, jsonOk } from "@/lib/api/enterprise";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";

function toTextArray(value, maxLen = 80) {
  const list = Array.isArray(value) ? value : [];
  return list
    .map((x) => asSafeText(x, maxLen))
    .filter(Boolean)
    .slice(0, 20);
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

  const { data, error } = await supabase
    .from("ai_user_memory")
    .select("id,user_id,weakness,history,last_updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return jsonError({ message: "Unable to load memory.", code: "DB_QUERY_FAILED" }, { status: 500, requestId });
  }

  return jsonOk({ memory: data || null }, { requestId });
}

export async function POST(request) {
  const requestId = getRequestId(request);

  if (!isSameOrigin(request)) {
    return jsonError({ message: "Invalid origin.", code: "INVALID_ORIGIN" }, { status: 403, requestId });
  }

  if (isBodyTooLarge(request, 16_000)) {
    return jsonError({ message: "Request body too large.", code: "BODY_TOO_LARGE" }, { status: 413, requestId });
  }

  const rl = checkRateLimit({ request, key: "ai_memory_post", limit: 40, windowMs: 60 * 1000 });
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
  const weakness = toTextArray(body?.weakness);
  const history = toTextArray(body?.history, 160);

  const { data, error } = await supabase
    .from("ai_user_memory")
    .upsert({
      user_id: user.id,
      weakness,
      history,
      last_updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" })
    .select("id,user_id,weakness,history,last_updated_at")
    .single();

  if (error || !data) {
    return jsonError({ message: "Unable to save memory.", code: "DB_WRITE_FAILED" }, { status: 500, requestId });
  }

  return jsonOk({ memory: data }, { requestId });
}
