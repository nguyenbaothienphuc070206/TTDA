import { checkRateLimit, isSameOrigin } from "@/lib/apiGuards";
import { getRequestId, jsonError, jsonOk } from "@/lib/api/enterprise";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";

function sameDay(a, b) {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate();
}

export async function POST(request) {
  const requestId = getRequestId(request);

  if (!isSameOrigin(request)) {
    return jsonError({ message: "Invalid origin.", code: "INVALID_ORIGIN" }, { status: 403, requestId });
  }

  const rl = checkRateLimit({ request, key: "progress_checkin_post", limit: 24, windowMs: 60 * 1000 });
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

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("user_id,streak_days,last_check_in_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileErr) {
    return jsonError({ message: "Unable to load profile.", code: "DB_QUERY_FAILED" }, { status: 500, requestId });
  }

  const now = new Date();
  const last = profile?.last_check_in_at ? new Date(profile.last_check_in_at) : null;
  let streak = Number(profile?.streak_days || 0);

  if (!last) {
    streak = 1;
  } else if (sameDay(last, now)) {
    streak = Math.max(1, streak);
  } else {
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (24 * 60 * 60 * 1000));
    streak = diffDays === 1 ? streak + 1 : 1;
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: user.id,
        streak_days: streak,
        last_check_in_at: now.toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select("user_id,streak_days,last_check_in_at")
    .single();

  if (error || !data) {
    return jsonError({ message: "Unable to update streak.", code: "DB_WRITE_FAILED" }, { status: 500, requestId });
  }

  return jsonOk({ streak: data }, { requestId });
}
