import GlobalLeaderboard from "@/components/leaderboard/GlobalLeaderboard";

export const metadata = {
  title: "Global Leaderboard",
};

export default function LeaderboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-2xl font-semibold text-white">Global Leaderboard (Realtime)</h1>
        <p className="mt-2 text-sm text-slate-300">
          Rank by streak, technique score, and completed lessons.
        </p>

        <div className="mt-4">
          <GlobalLeaderboard />
        </div>
      </section>
    </div>
  );
}
