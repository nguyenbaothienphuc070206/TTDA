import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";
import { createCompatResponder } from "@/lib/api/compatResponse";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";

function asText(value) {
  return String(value || "").trim();
}

function parseRating(value) {
  if (value === 1 || value === "1" || value === "up") return 1;
  if (value === -1 || value === "-1" || value === "down") return -1;
  return 0;
}

function isUuid(value) {
  const s = asText(value);
  // Minimal UUID v4-ish check (accepts any UUID variant).
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
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
    key: "ai_coach_feedback",
    limit: 30,
    windowMs: 5 * 60 * 1000,
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

  const messageId = asText(body?.messageId);
  const rating = parseRating(body?.rating);
  const note = asText(body?.note).slice(0, 500);

  if (!isUuid(messageId) || !rating) {
    return api.fail({ message: "Dữ liệu không hợp lệ.", code: "VALIDATION_ERROR", status: 400 });
  }

  try {
    const supabase = createSupabaseRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return api.fail({ message: "Bạn cần đăng nhập.", code: "UNAUTHORIZED", status: 401 });
    }

    const payload = {
      user_id: user.id,
      message_id: messageId,
      rating,
      note: note || null,
      meta: {
        pagePath: asText(body?.pagePath).slice(0, 200) || null,
      },
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("ai_chat_feedback")
      .upsert(payload, { onConflict: "user_id,message_id" });

    if (error) {
      return api.fail({ message: "Không lưu được phản hồi.", code: "INTERNAL_ERROR", status: 500 });
    }

    return api.ok({ ok: true });
  } catch {
    return api.fail({ message: "Không lưu được phản hồi.", code: "INTERNAL_ERROR", status: 500 });
  }
}
