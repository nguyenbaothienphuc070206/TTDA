import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";
import { asSafeText, getRequestId, jsonError, jsonOk } from "@/lib/api/enterprise";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";

export async function POST(request) {
  const requestId = getRequestId(request);

  if (!isSameOrigin(request)) {
    return jsonError({ message: "Invalid origin.", code: "INVALID_ORIGIN" }, { status: 403, requestId });
  }

  if (isBodyTooLarge(request, 8_000)) {
    return jsonError({ message: "Request body too large.", code: "BODY_TOO_LARGE" }, { status: 413, requestId });
  }

  const rl = checkRateLimit({ request, key: "lessons_complete_post", limit: 60, windowMs: 60 * 1000 });
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
  const lessonId = asSafeText(body?.lesson_id || body?.lessonId, 120);
  const timeSpent = Number(body?.time_spent || body?.timeSpent || 0);

  if (!lessonId) {
    return jsonError({ message: "Missing lesson_id.", code: "VALIDATION_ERROR" }, { status: 400, requestId });
  }

  const payload = {
    user_id: user.id,
    lesson_id: lessonId,
    completed: true,
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    time_spent: Number.isFinite(timeSpent) ? Math.max(0, Math.round(timeSpent)) : 0,
  };

  const { data, error } = await supabase
    .from("progress")
    .upsert(payload, { onConflict: "user_id,lesson_id" })
    .select("id,user_id,lesson_id,completed,completed_at,time_spent,updated_at")
    .single();

  if (error || !data) {
    return jsonError({ message: "Unable to complete lesson.", code: "DB_WRITE_FAILED" }, { status: 500, requestId });
  }

  return jsonOk({ progress: data }, { requestId });
}
