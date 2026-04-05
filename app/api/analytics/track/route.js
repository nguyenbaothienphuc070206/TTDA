import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";
import { asSafeText, getRequestId, jsonError, jsonOk } from "@/lib/api/enterprise";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";

export async function POST(request) {
  const requestId = getRequestId(request);

  if (!isSameOrigin(request)) {
    return jsonError({ message: "Invalid origin.", code: "INVALID_ORIGIN" }, { status: 403, requestId });
  }

  if (isBodyTooLarge(request, 20_000)) {
    return jsonError({ message: "Request body too large.", code: "BODY_TOO_LARGE" }, { status: 413, requestId });
  }

  const rl = checkRateLimit({ request, key: "analytics_track_post", limit: 120, windowMs: 60 * 1000 });
  if (!rl.ok) {
    const res = jsonError({ message: "Too many requests.", code: "RATE_LIMITED" }, { status: 429, requestId });
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }

  const body = await request.json().catch(() => ({}));
  const event = asSafeText(body?.event, 100);
  const metadata = body?.metadata && typeof body.metadata === "object" ? body.metadata : {};

  if (!event) {
    return jsonError({ message: "Missing event.", code: "VALIDATION_ERROR" }, { status: 400, requestId });
  }

  const supabase = createSupabaseRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("analytics")
    .insert({
      user_id: user?.id || null,
      event,
      metadata,
    })
    .select("id,event,created_at")
    .single();

  if (error || !data) {
    return jsonError({ message: "Unable to track event.", code: "DB_WRITE_FAILED" }, { status: 500, requestId });
  }

  return jsonOk({ tracked: data }, { requestId });
}
