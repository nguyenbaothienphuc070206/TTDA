import { NextResponse } from "next/server";

import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";
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
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origin không hợp lệ." }, { status: 403 });
  }

  if (isBodyTooLarge(request, 4_096)) {
    return NextResponse.json({ error: "Body quá lớn." }, { status: 413 });
  }

  const rl = checkRateLimit({
    request,
    key: "auth_otp",
    limit: 5,
    windowMs: 10 * 60 * 1000,
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

  const email = String(body?.email || "").trim();
  const next = toSafeNextPath(body?.next, "/admin");

  if (!isLikelyEmail(email)) {
    return NextResponse.json({ error: "Email không hợp lệ." }, { status: 400 });
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

    const res = NextResponse.json({ ok: true });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch {
    const res = NextResponse.json({ error: "Không gửi được link đăng nhập." }, { status: 500 });
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
}
