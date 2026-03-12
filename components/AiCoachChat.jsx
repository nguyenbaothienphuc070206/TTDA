"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

function SourceItem({ source }) {
  return (
    <li className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate">
            {source.title}
          </div>
          <div className="mt-0.5 text-xs text-slate-300">
            {source.type} • score {source.score}
          </div>
        </div>
        <Link
          href={source.url}
          className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
        >
          Mở
        </Link>
      </div>

      {Array.isArray(source.highlights) && source.highlights.length > 0 ? (
        <ul className="mt-2 grid gap-1 text-xs leading-5 text-slate-300">
          {source.highlights.map((h) => (
            <li key={h}>• {h}</li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function AiCoachChat({ context }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);

  const helperText = useMemo(() => {
    if (context?.videoId) {
      return "Hỏi nhanh về kỹ thuật trong video này (RAG).";
    }

    return "Hỏi về kỹ thuật, lỗi thường gặp, mẹo tập an toàn…";
  }, [context?.videoId]);

  const onAsk = async (e) => {
    e.preventDefault();

    const q = String(query || "").trim();
    if (q.length < 2) {
      setError("Bạn nhập câu hỏi dài hơn một chút nhé.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, context: context || null }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Không xử lý được yêu cầu.");
        setAnswer("");
        setSources([]);
        return;
      }

      setAnswer(String(data?.answer || ""));
      setSources(Array.isArray(data?.sources) ? data.sources : []);
    } catch {
      setError("Không kết nối được API. Vui lòng thử lại.");
      setAnswer("");
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-white">AI Coach (RAG)</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{helperText}</p>

      <form onSubmit={onAsk} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ví dụ: 'đá tống trước sai thường gặp?'"
          className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
        />

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
        >
          {loading ? "Đang trả lời…" : "Hỏi"}
        </button>
      </form>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {answer ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          <div className="text-xs font-semibold text-slate-300">Trả lời</div>
          <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200">
            {answer}
          </pre>
        </div>
      ) : null}

      {Array.isArray(sources) && sources.length > 0 ? (
        <div className="mt-4">
          <div className="text-xs font-semibold text-slate-300">Nguồn tham chiếu</div>
          <ul className="mt-2 grid gap-2">
            {sources.slice(0, 5).map((s) => (
              <SourceItem key={s.id} source={s} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
