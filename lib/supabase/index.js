import { createClient } from "@supabase/supabase-js";

let browserClient = null;

function getPublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)."
    );
  }

  return { url, key };
}

export function getSupabaseClient() {
  if (browserClient) return browserClient;

  const { url, key } = getPublicEnv();
  browserClient = createClient(url, key);
  return browserClient;
}

export const supabase = getSupabaseClient();
