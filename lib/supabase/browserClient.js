import { createBrowserClient } from "@supabase/ssr";

function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  if (String(key).startsWith("sb_secret_")) {
    throw new Error(
      "Invalid Supabase key: secret key must never be used in the browser. Use the publishable/anon key."
    );
  }

  return { url, key };
}

export function createSupabaseBrowserClient() {
  const { url, key } = getSupabasePublicEnv();
  return createBrowserClient(url, key);
}
