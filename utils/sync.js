import { supabase } from "@/lib/supabase";

export async function syncProgress(localData) {
  const rows = Array.isArray(localData) ? localData : [];
  if (!rows.length) return { synced: 0 };

  const { error } = await supabase.from("progress").upsert(rows, {
    onConflict: "user_id,lesson_id",
  });

  if (error) throw error;
  return { synced: rows.length };
}
