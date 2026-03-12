import { NextResponse } from "next/server";

import { createSessionToken, roles, sessionCookieName } from "@/lib/auth";
import { checkRateLimit, constantTimeEqual, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origin không hợp lệ." }, { status: 403 });
  }

  if (isBodyTooLarge(request, 4_096)) {
    return NextResponse.json({ error: "Body quá lớn." }, { status: 413 });
  }

  const rl = checkRateLimit({
    request,
    key: "auth_login",
    limit: 10,
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

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Thiếu AUTH_SECRET." }, { status: 500 });
  }

  const role = body?.role;
  const password = String(body?.password || "").slice(0, 128);

  const r = roles();
  const isAdmin = role === r.ADMIN || role === "admin";
  const isCoach = role === r.COACH || role === "coach";

  if (!isAdmin && !isCoach) {
    return NextResponse.json({ error: "Role không hợp lệ." }, { status: 400 });
  }

  const expectedPassword = isAdmin
    ? process.env.ADMIN_PASSWORD
    : process.env.COACH_PASSWORD;

  if (!expectedPassword) {
    return NextResponse.json(
      {
        error: isAdmin
          ? "Thiếu ADMIN_PASSWORD trong env."
          : "Thiếu COACH_PASSWORD trong env.",
      },
      { status: 500 }
    );
  }

  if (!constantTimeEqual(password, expectedPassword)) {
    return NextResponse.json({ error: "Sai mật khẩu." }, { status: 401 });
  }

  const token = await createSessionToken({
    role: isAdmin ? r.ADMIN : r.COACH,
    subject: isAdmin ? "admin" : "coach",
    expiresAt: Date.now() + ONE_WEEK_MS,
    secret,
  });

  const res = NextResponse.json({ ok: true, role: isAdmin ? r.ADMIN : r.COACH });
  res.headers.set("Cache-Control", "no-store");

  res.cookies.set({
    name: sessionCookieName(),
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(ONE_WEEK_MS / 1000),
  });

  return res;
}
