import { createSupabaseServerComponentClient } from "@/lib/supabase/serverComponentClient";

export const metadata = {
  title: "Coach Dashboard",
};

export default async function CoachDashboardPage() {
  const supabase = createSupabaseServerComponentClient();

  const [{ data: submissions }, { data: feedback }] = await Promise.all([
    supabase
      .from("video_submissions")
      .select("id,user_id,lesson_slug,status,created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("coach_feedback")
      .select("id,user_id,comment,score,created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-2xl font-semibold text-white">Coach Dashboard</h1>
        <p className="mt-2 text-sm text-slate-300">
          Review student videos, comment by timestamp, and score technique quality.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <h2 className="text-sm font-semibold text-white">Recent Video Submissions</h2>
            <div className="mt-3 grid gap-2 text-sm text-slate-200">
              {(submissions || []).map((item) => (
                <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-2">
                  <div>User: {item.user_id}</div>
                  <div>Status: {item.status}</div>
                  <div>Lesson: {item.lesson_slug || "-"}</div>
                </div>
              ))}
              {!submissions?.length ? <p className="text-slate-400">No submissions yet.</p> : null}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <h2 className="text-sm font-semibold text-white">Recent Coach Feedback</h2>
            <div className="mt-3 grid gap-2 text-sm text-slate-200">
              {(feedback || []).map((item) => (
                <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-2">
                  <div>User: {item.user_id}</div>
                  <div>Score: {item.score ?? "-"}</div>
                  <div className="line-clamp-2">{item.comment}</div>
                </div>
              ))}
              {!feedback?.length ? <p className="text-slate-400">No feedback yet.</p> : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
