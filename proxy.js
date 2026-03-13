import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";

import { APP_ROLES, getAppRoleForUserId } from "./lib/supabase/roles";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  localePrefix: "never",
});

function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (String(key || "").startsWith("sb_secret_")) {
    return { url, key: "" };
  }

  return { url, key };
}

function redirectToLogin(request, reason) {
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("reason", reason);
  return NextResponse.redirect(url);
}

export async function proxy(request) {
  const intlResponse = intlMiddleware(request);
  const { url, key } = getSupabasePublicEnv();
  const pathname = request.nextUrl.pathname;

  // Only enforce auth on /admin routes.
  if (!pathname.startsWith("/admin")) {
    return intlResponse;
  }

  // Allow the login page itself.
  if (pathname === "/admin/login") {
    return intlResponse;
  }

  if (!url || !key) {
    return redirectToLogin(request, "missing_supabase_env");
  }

  let response = intlResponse;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectToLogin(request, "unauthorized");
  }

  const role = await getAppRoleForUserId(supabase, user.id);

  if (role !== APP_ROLES.ADMIN && role !== APP_ROLES.COACH) {
    return redirectToLogin(request, "forbidden");
  }

  // Admin-only modules.
  if (pathname.startsWith("/admin/tai-chinh") && role !== APP_ROLES.ADMIN) {
    return redirectToLogin(request, "admin_only");
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
