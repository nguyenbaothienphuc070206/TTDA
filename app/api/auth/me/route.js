import { NextResponse } from "next/server";

import { sessionCookieName, verifySessionToken } from "@/lib/auth";

export async function GET(request) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Thiếu AUTH_SECRET." }, { status: 500 });
  }

  const token = request.cookies.get(sessionCookieName())?.value;
  const payload = await verifySessionToken(token, secret);

  if (!payload) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const res = NextResponse.json({ session: payload });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
