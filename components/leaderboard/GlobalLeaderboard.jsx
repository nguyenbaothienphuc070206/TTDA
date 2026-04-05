"use client";

import { useEffect, useMemo, useState } from "react";

import { subscribeLeaderboard } from "@/lib/leaderboard/realtime";

export default function GlobalLeaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/leaderboard", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error?.message || "Unable to load leaderboard");
      }
      setRows(Array.isArray(json?.data?.leaderboard) ? json.data.leaderboard : []);
    } catch {
      setError("Unable to load leaderboard right now.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const unsubscribe = subscribeLeaderboard(() => {
      load();
    });

    return unsubscribe;
  }, []);

  const topRows = useMemo(() => rows.slice(0, 20), [rows]);

  if (loading) {
    return <p className="text-sm text-slate-300">Loading leaderboard...</p>;
  }

  if (error) {
    return <p className="text-sm text-amber-200">{error}</p>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/30">
      <table className="min-w-full text-sm">
        <thead className="bg-white/5 text-slate-200">
          <tr>
            <th className="px-3 py-2 text-left">#</th>
            <th className="px-3 py-2 text-left">Athlete</th>
            <th className="px-3 py-2 text-left">Streak</th>
            <th className="px-3 py-2 text-left">Technique</th>
            <th className="px-3 py-2 text-left">Completed</th>
            <th className="px-3 py-2 text-left">Points</th>
          </tr>
        </thead>
        <tbody>
          {topRows.map((row, idx) => (
            <tr key={row.user_id || idx} className="border-t border-white/10 text-slate-200">
              <td className="px-3 py-2">{idx + 1}</td>
              <td className="px-3 py-2">{row.display_name || "Athlete"}</td>
              <td className="px-3 py-2">{row.streak_days || 0}</td>
              <td className="px-3 py-2">{Math.round(Number(row.technique_score_avg || 0))}</td>
              <td className="px-3 py-2">{row.completed_lessons || 0}</td>
              <td className="px-3 py-2 font-semibold text-cyan-100">{Math.round(Number(row.rank_points || 0))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
