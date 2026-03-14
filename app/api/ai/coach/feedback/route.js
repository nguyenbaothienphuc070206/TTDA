import { NextResponse } from "next/server";

import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";
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
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origin không hợp lệ." }, { status: 403 });
  }

  if (isBodyTooLarge(request, 4_096)) {
    return NextResponse.json({ error: "Body quá lớn." }, { status: 413 });
  }

  const rl = checkRateLimit({
    request,
    key: "ai_coach_feedback",
    limit: 30,
    windowMs: 5 * 60 * 1000,
  });

  if (!rl.ok) {
    const res = NextResponse.json(
      { error: "Thao tác quá nhanh. Vui lòng thử lại sau." },
      { status: 429 }
    );
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON không hợp lệ." }, { status: 400 });
  }

  const messageId = asText(body?.messageId);
  const rating = parseRating(body?.rating);
  const note = asText(body?.note).slice(0, 500);

  if (!isUuid(messageId) || !rating) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const res = NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
      res.headers.set("Cache-Control", "no-store");
      return res;
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
      const res = NextResponse.json({ error: "Không lưu được phản hồi." }, { status: 500 });
      res.headers.set("Cache-Control", "no-store");
      return res;
    }

    const res = NextResponse.json({ ok: true });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch {
    const res = NextResponse.json({ error: "Không lưu được phản hồi." }, { status: 500 });
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
}
