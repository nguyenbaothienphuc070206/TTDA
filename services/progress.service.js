import { supabase } from "@/lib/supabase";

export async function markLessonComplete(userId, lessonId, score = null) {
  const safeUserId = String(userId || "").trim();
  const safeLessonId = String(lessonId || "").trim();

  if (!safeUserId || !safeLessonId) {
    throw new Error("Missing userId or lessonId");
  }

  const payload = {
    user_id: safeUserId,
    lesson_id: safeLessonId,
    completed: true,
    score: Number.isFinite(Number(score)) ? Number(score) : null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("progress")
    .upsert(payload, { onConflict: "user_id,lesson_id" })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getProgressByUser(userId) {
  const safeUserId = String(userId || "").trim();
  if (!safeUserId) return [];

  const { data, error } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", safeUserId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function syncProgress(localData) {
  const rows = Array.isArray(localData) ? localData : [];
  if (!rows.length) return { synced: 0 };

  const { error } = await supabase.from("progress").upsert(rows, {
    onConflict: "user_id,lesson_id",
  });

  if (error) throw error;
  return { synced: rows.length };
}
