import { createClient } from "@supabase/supabase-js";

function getSupabaseServiceEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase service env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)."
    );
  }

  if (!String(key).startsWith("sb_secret_")) {
    // Defense-in-depth: this client is intended for server-only privileged access.
    throw new Error(
      "Invalid Supabase service key. Expected a secret/service-role key (sb_secret_*)."
    );
  }

  return { url, key };
}

export function createSupabaseServiceClient() {
  const { url, key } = getSupabaseServiceEnv();

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
