import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";
import { getRequestId, jsonError, jsonOk } from "@/lib/api/enterprise";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";

function sanitizeRows(rows, userId) {
  const list = Array.isArray(rows) ? rows : [];

  return list
    .map((item) => ({
      user_id: userId,
      lesson_id: String(item?.lesson_id || item?.lessonId || "").trim(),
      completed: Boolean(item?.completed),
      score: Number.isFinite(Number(item?.score)) ? Number(item.score) : null,
      time_spent: Number.isFinite(Number(item?.time_spent || item?.timeSpent))
        ? Math.max(0, Math.round(Number(item?.time_spent || item?.timeSpent)))
        : 0,
      completed_at: item?.completed_at || item?.completedAt || null,
      updated_at: new Date().toISOString(),
    }))
    .filter((x) => x.lesson_id)
    .slice(0, 500);
}

export async function POST(request) {
  const requestId = getRequestId(request);

  if (!isSameOrigin(request)) {
    return jsonError({ message: "Invalid origin.", code: "INVALID_ORIGIN" }, { status: 403, requestId });
  }

  if (isBodyTooLarge(request, 1_000_000)) {
    return jsonError({ message: "Request body too large.", code: "BODY_TOO_LARGE" }, { status: 413, requestId });
  }

  const rl = checkRateLimit({ request, key: "progress_sync_post", limit: 10, windowMs: 60 * 1000 });
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
  const rows = sanitizeRows(body?.progress || body?.rows, user.id);

  if (!rows.length) {
    return jsonOk({ synced: 0 }, { requestId });
  }

  const { error } = await supabase.from("progress").upsert(rows, {
    onConflict: "user_id,lesson_id",
  });

  if (error) {
    return jsonError({ message: "Unable to sync progress.", code: "DB_WRITE_FAILED" }, { status: 500, requestId });
  }

  return jsonOk({ synced: rows.length }, { requestId });
}
