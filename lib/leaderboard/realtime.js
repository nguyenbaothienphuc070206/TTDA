import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";

export function subscribeLeaderboard(onChange) {
  const supabase = createSupabaseBrowserClient();
  const callback = typeof onChange === "function" ? onChange : () => {};

  const channel = supabase
    .channel("leaderboard")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "user_streak_stats" },
      (payload) => callback(payload)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
