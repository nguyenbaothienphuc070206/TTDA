"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { readProfile } from "@/lib/profile";

const CHAT_STORE_KEY = "vovinam_ai_chat_v1";

function readChatStore() {
  if (typeof window === "undefined") return { history: [], sessionId: "" };

  try {
    const raw = window.localStorage.getItem(CHAT_STORE_KEY);
    if (!raw) return { history: [], sessionId: "" };
    const data = JSON.parse(raw);

    const history = Array.isArray(data?.history)
      ? data.history
          .map((m) => ({
            role: m?.role === "assistant" ? "assistant" : m?.role === "user" ? "user" : "",
            content: String(m?.content || "").trim(),
          }))
          .filter((m) => m.role && m.content)
      : [];

    const sessionId = typeof data?.sessionId === "string" ? data.sessionId : "";
    return { history: history.slice(-8), sessionId };
  } catch {
    return { history: [], sessionId: "" };
  }
}

function writeChatStore(next) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CHAT_STORE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function MarkdownAnswer({ children }) {
  const content = String(children || "");
  if (!content.trim()) return null;

  return (
    <div className="mt-2 text-sm leading-6 text-slate-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children: c }) => (
            <h2 className="mt-4 text-base font-semibold text-white">{c}</h2>
          ),
          h3: ({ children: c }) => (
            <h3 className="mt-3 text-sm font-semibold text-white">{c}</h3>
          ),
          p: ({ children: c }) => <p className="mt-2">{c}</p>,
          ul: ({ children: c }) => <ul className="mt-2 grid gap-1">{c}</ul>,
          ol: ({ children: c }) => <ol className="mt-2 grid gap-1 list-decimal pl-5">{c}</ol>,
          li: ({ children: c }) => <li className="text-slate-200">{c}</li>,
          a: ({ href, children: c }) => (
            <a
              href={href}
              className="text-cyan-200 underline underline-offset-4 hover:text-cyan-100"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noreferrer" : undefined}
            >
              {c}
            </a>
          ),
          code: ({ children: c }) => (
            <code className="rounded bg-white/10 px-1 py-0.5 text-xs">{c}</code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function SourceItem({ source }) {
  const href = String(source?.url || "").trim();

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
        {href ? (
          <Link
            href={href}
            className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            Mở
          </Link>
        ) : null}
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
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const abortRef = useRef(null);

  useEffect(() => {
    const store = readChatStore();
    setSessionId(store.sessionId || "");
  }, []);

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
    setAnswer("");
    setSources([]);
    setRecommendedVideos([]);

    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch {
        // ignore
      }
    }

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const profile = readProfile();
      const beltId = String(profile?.beltId || "lam-dai");
      const name = String(profile?.name || "");

      const store = readChatStore();
      const history = Array.isArray(store.history) ? store.history : [];
      let activeSessionId = sessionId || store.sessionId || "";

      const res = await fetch("/api/ai/coach", {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          query: q,
          context: context || null,
          stream: true,
          history,
          beltId,
          name,
          sessionId: activeSessionId,
        }),
      });

      const ct = res.headers.get("content-type") || "";

      if (ct.includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let finalAnswer = "";

        const applyMeta = (meta) => {
          const s = Array.isArray(meta?.sources) ? meta.sources : [];
          setSources(s);
          const vids = Array.isArray(meta?.recommendedVideos) ? meta.recommendedVideos : [];
          setRecommendedVideos(vids);
          if (meta?.sessionId && typeof meta.sessionId === "string") {
            activeSessionId = meta.sessionId;
            setSessionId(meta.sessionId);
          }
        };

        const pushDelta = (text) => {
          const t = String(text || "");
          if (!t) return;
          finalAnswer += t;
          setAnswer(finalAnswer);
        };

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            const lines = part.split("\n");
            let evt = "message";
            const dataLines = [];

            for (const line of lines) {
              if (line.startsWith("event:")) {
                evt = line.slice("event:".length).trim();
              } else if (line.startsWith("data:")) {
                dataLines.push(line.slice("data:".length).trim());
              }
            }

            const dataRaw = dataLines.join("\n");
            if (!dataRaw) continue;

            let payload;
            try {
              payload = JSON.parse(dataRaw);
            } catch {
              payload = null;
            }

            if (evt === "meta") {
              applyMeta(payload);
            }

            if (evt === "delta") {
              pushDelta(payload?.text);
            }

            if (evt === "error") {
              setError(payload?.error || "Không xử lý được yêu cầu.");
            }
          }
        }

        // Update local history after streaming completes.
        const nextHistory = [...history, { role: "user", content: q }, { role: "assistant", content: finalAnswer }].slice(-8);
        writeChatStore({ history: nextHistory, sessionId: activeSessionId });
        return;
      }

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Không xử lý được yêu cầu.");
        return;
      }

      setAnswer(String(data?.answer || ""));
      setSources(Array.isArray(data?.sources) ? data.sources : []);
      setRecommendedVideos(Array.isArray(data?.recommendedVideos) ? data.recommendedVideos : []);

      if (data?.sessionId && typeof data.sessionId === "string") {
        setSessionId(data.sessionId);
      }

      const nextHistory = [...history, { role: "user", content: q }, { role: "assistant", content: String(data?.answer || "") }].slice(-8);
      writeChatStore({ history: nextHistory, sessionId: String(data?.sessionId || sessionId || "") });
    } catch {
      setError("Không kết nối được API. Vui lòng thử lại.");
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
          <MarkdownAnswer>{answer}</MarkdownAnswer>
        </div>
      ) : null}

      {Array.isArray(recommendedVideos) && recommendedVideos.length > 0 ? (
        <div className="mt-4">
          <div className="text-xs font-semibold text-slate-300">Video minh hoạ</div>
          <div className="mt-2 grid gap-2">
            {recommendedVideos.slice(0, 2).map((v) => (
              <Link
                key={v.id}
                href={v.url || `/video/${v.id}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <div className="text-sm font-semibold text-white">{v.title}</div>
                {v.summary ? (
                  <div className="mt-1 text-xs leading-5 text-slate-300">{v.summary}</div>
                ) : null}
              </Link>
            ))}
          </div>
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
