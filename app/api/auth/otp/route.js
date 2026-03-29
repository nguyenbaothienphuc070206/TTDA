import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";
import { createCompatResponder } from "@/lib/api/compatResponse";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";

function isLikelyEmail(value) {
  const s = String(value || "").trim();
  if (!s) return false;
  if (s.length > 254) return false;
  // Minimal sanity check (avoid heavy regex).
  const at = s.indexOf("@");
  if (at <= 0 || at !== s.lastIndexOf("@")) return false;
  if (at === s.length - 1) return false;
  return true;
}

function toSafeNextPath(value, fallback) {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  if (raw.includes("\\")) return fallback;
  return raw;
}

export async function POST(request) {
  const api = createCompatResponder(request);
  if (!isSameOrigin(request)) {
    return api.fail({ message: "Origin không hợp lệ.", code: "INVALID_ORIGIN", status: 403 });
  }

  if (isBodyTooLarge(request, 4_096)) {
    return api.fail({ message: "Body quá lớn.", code: "BODY_TOO_LARGE", status: 413 });
  }

  const rl = checkRateLimit({
    request,
    key: "auth_otp",
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!rl.ok) {
    return api.fail({
      message: "Thao tác quá nhanh. Vui lòng thử lại sau.",
      code: "RATE_LIMITED",
      status: 429,
      retryAfterSec: rl.retryAfterSec,
    });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return api.fail({ message: "Body JSON không hợp lệ.", code: "INVALID_JSON", status: 400 });
  }

  const email = String(body?.email || "").trim();
  const next = toSafeNextPath(body?.next, "/admin");

  if (!isLikelyEmail(email)) {
    return api.fail({ message: "Email không hợp lệ.", code: "VALIDATION_ERROR", status: 400 });
  }

  const origin = request.nextUrl?.origin || "";
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

  try {
    const supabase = createSupabaseRouteHandlerClient();

    // Always respond with a generic message to avoid email enumeration.
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    return api.ok({ ok: true });
  } catch {
    return api.fail({ message: "Không gửi được link đăng nhập.", code: "INTERNAL_ERROR", status: 500 });
  }
}
