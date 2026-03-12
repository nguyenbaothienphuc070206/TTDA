import { NextResponse } from "next/server";

import { sessionCookieName } from "@/lib/auth";
import { isSameOrigin } from "@/lib/apiGuards";

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origin không hợp lệ." }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", "no-store");

  res.cookies.set({
    name: sessionCookieName(),
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}
