import { NextResponse } from "next/server";

import { createSessionToken, roles, sessionCookieName } from "@/lib/auth";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request) {
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
  const password = String(body?.password || "");

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

  if (password !== expectedPassword) {
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
