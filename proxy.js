import { NextResponse } from "next/server";

import { roles, sessionCookieName, verifySessionToken } from "@/lib/auth";

export async function proxy(request) {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("reason", "missing_secret");
    return NextResponse.redirect(url);
  }

  const token = request.cookies.get(sessionCookieName())?.value;
  const payload = await verifySessionToken(token, secret);

  if (!payload) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("reason", "unauthorized");
    return NextResponse.redirect(url);
  }

  const r = roles();
  const okRole = payload.role === r.ADMIN || payload.role === r.COACH;

  if (!okRole) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("reason", "forbidden");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};