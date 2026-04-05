import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";
import { asSafeText, getRequestId, jsonError, jsonOk } from "@/lib/api/enterprise";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";

export async function POST(request) {
  const requestId = getRequestId(request);

  if (!isSameOrigin(request)) {
    return jsonError({ message: "Invalid origin.", code: "INVALID_ORIGIN" }, { status: 403, requestId });
  }

  if (isBodyTooLarge(request, 6_000)) {
    return jsonError({ message: "Request body too large.", code: "BODY_TOO_LARGE" }, { status: 413, requestId });
  }

  const rl = checkRateLimit({ request, key: "auth_login_post", limit: 12, windowMs: 60 * 1000 });
  if (!rl.ok) {
    const res = jsonError({ message: "Too many requests.", code: "RATE_LIMITED" }, { status: 429, requestId });
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }

  const body = await request.json().catch(() => ({}));
  const email = asSafeText(body?.email, 200).toLowerCase();

  if (!email || !email.includes("@")) {
    return jsonError({ message: "Invalid email.", code: "VALIDATION_ERROR" }, { status: 400, requestId });
  }

  const supabase = createSupabaseRouteHandlerClient();
  const redirectTo = asSafeText(body?.redirectTo, 300) || `${new URL(request.url).origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) {
    return jsonError({ message: error.message || "Unable to send login email.", code: "AUTH_FAILED" }, { status: 400, requestId });
  }

  return jsonOk({ data }, { requestId });
}
