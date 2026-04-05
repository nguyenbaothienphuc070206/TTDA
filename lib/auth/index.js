import { supabase } from "@/lib/supabase";

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined,
    },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}
