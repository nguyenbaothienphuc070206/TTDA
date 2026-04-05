import { checkRateLimit, isSameOrigin } from "@/lib/apiGuards";
import { asSafeText, getRequestId, jsonError, jsonOk } from "@/lib/api/enterprise";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";
import { buildInactiveReminder } from "@/services/notification.service";

export async function POST(request) {
  const requestId = getRequestId(request);

  if (!isSameOrigin(request)) {
    return jsonError({ message: "Invalid origin.", code: "INVALID_ORIGIN" }, { status: 403, requestId });
  }

  const rl = checkRateLimit({
    request,
    key: "notification_reminder_post",
    limit: 20,
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
  const daysInactive = Number(body?.daysInactive || 0);
  const type = asSafeText(body?.type, 80) || "inactive_reminder";

  const message = buildInactiveReminder(daysInactive);

  const { data, error } = await supabase
    .from("notification_events")
    .insert({
      user_id: user.id,
      type,
      payload: {
        daysInactive,
        message,
      },
      status: "pending",
    })
    .select("id,user_id,type,payload,status,created_at")
    .single();

  if (error || !data) {
    return jsonError({ message: "Unable to create notification event.", code: "DB_WRITE_FAILED" }, { status: 500, requestId });
  }

  return jsonOk({ event: data }, { requestId });
}
