"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";

import { readProfile } from "@/lib/profile";
import MascotIcon from "@/components/MascotIcon";

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
            id: typeof m?.id === "string" ? m.id : "",
            role: m?.role === "assistant" ? "assistant" : m?.role === "user" ? "user" : "",
            content: String(m?.content || "").trim(),
            feedback: m?.feedback === 1 || m?.feedback === -1 ? m.feedback : 0,
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
              className="text-blue-200 underline underline-offset-4 hover:text-blue-100"
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

function ChatMessage({ message }) {
  const role = message?.role;
  const content = String(message?.content || "");
  if (!content.trim()) return null;

  const isUser = role === "user";
  const messageId = typeof message?.id === "string" ? message.id : "";
  const feedback = message?.feedback === 1 || message?.feedback === -1 ? message.feedback : 0;

  return (
    <div className={"flex gap-2 " + (isUser ? "justify-end" : "justify-start")}>
      {!isUser ? (
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-blue-600/10 text-blue-100">
          <MascotIcon className="h-5 w-5" />
        </span>
      ) : null}

      <div
        className={
          "max-w-[82%] rounded-3xl border p-3 " +
          (isUser
            ? "border-blue-400/25 bg-blue-500/15 text-slate-100"
            : "border-white/10 bg-white/5 text-slate-200")
        }
      >
        {isUser ? (
          <p className="text-sm leading-6">{content}</p>
        ) : (
          <MarkdownAnswer>{content}</MarkdownAnswer>
        )}

        {!isUser && messageId ? (
          <div className="mt-2 flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => message?.onFeedback?.({ messageId, rating: 1 })}
              className={
                "inline-flex h-8 w-8 items-center justify-center rounded-xl border text-slate-200 transition focus:outline-none focus:ring-2 focus:ring-blue-400/30 " +
                (feedback === 1
                  ? "border-blue-400/30 bg-blue-500/15 text-blue-100"
                  : "border-white/10 bg-white/5 hover:bg-white/10 hover:text-white")
              }
              aria-label="Phản hồi hữu ích"
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => message?.onFeedback?.({ messageId, rating: -1 })}
              className={
                "inline-flex h-8 w-8 items-center justify-center rounded-xl border text-slate-200 transition focus:outline-none focus:ring-2 focus:ring-blue-400/30 " +
                (feedback === -1
                  ? "border-blue-400/30 bg-blue-500/15 text-blue-100"
                  : "border-white/10 bg-white/5 hover:bg-white/10 hover:text-white")
              }
              aria-label="Phản hồi không hữu ích"
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
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
            className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30"
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
  const pathname = usePathname() || "";
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [sources, setSources] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [planId, setPlanId] = useState("free");
  const abortRef = useRef(null);
  const scrollRef = useRef(null);

  const isPremium = planId === "premium";

  const sendFeedback = async ({ messageId, rating }) => {
    const id = String(messageId || "").trim();
    const r = Number(rating);
    if (!id) return;
    if (r !== 1 && r !== -1) return;

    setChatHistory((prev) => {
      const next = (Array.isArray(prev) ? prev : []).map((m) =>
        String(m?.id || "") === id ? { ...m, feedback: r } : m
      );
      writeChatStore({ history: next.slice(-8), sessionId: sessionId || "" });
      return next;
    });

    try {
      await fetch("/api/ai/coach/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: id, rating: r, pagePath: pathname }),
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const store = readChatStore();
    setSessionId(store.sessionId || "");
    setChatHistory(Array.isArray(store.history) ? store.history : []);
  }, []);

  useEffect(() => {
    const sync = () => {
      const p = readProfile();
      setPlanId(p?.planId === "premium" ? "premium" : "free");
    };

    sync();
    window.addEventListener("vovinam-profile", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vovinam-profile", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    try {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } catch {
      // ignore
    }
  }, [chatHistory.length, answer]);

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

      // Optimistic UI: show bubbles immediately.
      setChatHistory(
        [...history, { role: "user", content: q }, { role: "assistant", content: "" }].slice(-8)
      );

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
        let finalAssistantMessageId = "";

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

          setChatHistory((prev) => {
            const list = Array.isArray(prev) ? prev.slice() : [];
            for (let i = list.length - 1; i >= 0; i -= 1) {
              if (list[i]?.role === "assistant") {
                const prevContent = String(list[i]?.content || "");
                list[i] = { ...list[i], content: prevContent + t };
                break;
              }
            }
            return list;
          });
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

            if (evt === "done") {
              const id = typeof payload?.assistantMessageId === "string" ? payload.assistantMessageId : "";
              if (id) finalAssistantMessageId = id;
              if (typeof payload?.sessionId === "string" && payload.sessionId) {
                activeSessionId = payload.sessionId;
                setSessionId(payload.sessionId);
              }
            }

            if (evt === "error") {
              setError(payload?.error || "Không xử lý được yêu cầu.");
            }
          }
        }

        // Update local history after streaming completes.
        const nextHistory = [
          ...history,
          { role: "user", content: q },
          { role: "assistant", content: finalAnswer, id: finalAssistantMessageId || "" },
        ].slice(-8);

        // Attach feedback handler for rendering.
        const nextUiHistory = nextHistory.map((m) => ({ ...m, onFeedback: sendFeedback }));
        writeChatStore({ history: nextHistory, sessionId: activeSessionId });
        setChatHistory(nextUiHistory);
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

      const nextHistory = [
        ...history,
        { role: "user", content: q },
        {
          role: "assistant",
          content: String(data?.answer || ""),
          id: typeof data?.assistantMessageId === "string" ? data.assistantMessageId : "",
        },
      ].slice(-8);
      const nextUiHistory = nextHistory.map((m) => ({ ...m, onFeedback: sendFeedback }));
      writeChatStore({ history: nextHistory, sessionId: String(data?.sessionId || sessionId || "") });
      setChatHistory(nextUiHistory);
    } catch {
      setError("Không kết nối được API. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const hasChat = useMemo(() => {
    return Array.isArray(chatHistory) && chatHistory.some((m) => String(m?.content || "").trim());
  }, [chatHistory]);

  useEffect(() => {
    // Ensure stored history has feedback handler attached (non-serializable).
    setChatHistory((prev) => (Array.isArray(prev) ? prev.map((m) => ({ ...m, onFeedback: sendFeedback })) : []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    !isPremium ? (
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[var(--shadow-card)] flex flex-col h-[calc(100vh-5rem)] lg:sticky lg:top-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-8 rounded-[2.75rem] bg-[radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_60%)] blur-2xl"
        />

        <div className="relative flex flex-col h-full p-6 sm:p-8">
          <div className="flex items-start gap-3 shrink-0">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-slate-950">
              <MascotIcon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-white">AI Coach (Premium)</h2>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                Tính năng này thuộc gói Premium. Nâng cấp để mở khóa AI Coach (RAG) và kỹ thuật Hoàng/Huyền đai.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/30 p-5 text-sm leading-6 text-slate-200">
            <div className="text-xs font-semibold text-slate-300">Premium mở khóa</div>
            <ul className="mt-2 grid gap-1">
              <li>• Hỏi lỗi thường gặp + cách sửa theo tài liệu</li>
              <li>• Gợi ý bài tập an toàn theo cấp đai</li>
              <li>• Mở khóa video/kỹ thuật nâng cao</li>
            </ul>
          </div>

          <div className="mt-auto pt-4">
            <Link
              href="/ho-so"
              className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
            >
              Nâng cấp Premium
            </Link>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Demo: bạn có thể bật Premium trong Hồ sơ.
            </p>
          </div>
        </div>
      </div>
    ) : (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[var(--shadow-card)] flex flex-col h-[calc(100vh-5rem)] lg:sticky lg:top-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 rounded-[2.75rem] bg-[radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_60%)] blur-2xl"
      />

      <div className="relative flex flex-col h-full p-6 sm:p-8">
        <div className="flex items-start gap-3 shrink-0">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-slate-950">
            <MascotIcon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-white">AI Coach</h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">{helperText}</p>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="ai-scrollbar mt-4 flex-1 min-h-0 overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/30 p-4"
        >
          {hasChat ? (
            <div className="grid gap-3">
              {chatHistory.map((m, idx) => (
                <ChatMessage key={`${m.role}-${idx}`} message={m} />
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-3 text-slate-300">
              <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-100">
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="text-sm leading-6">
                Hỏi về kỹ thuật, lỗi thường gặp, mẹo tập an toàn… AI sẽ trả lời theo tài liệu có sẵn.
              </div>
            </div>
          )}

          {Array.isArray(recommendedVideos) && recommendedVideos.length > 0 ? (
            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-300">Video minh hoạ</div>
              <div className="mt-2 grid gap-2">
                {recommendedVideos.slice(0, 2).map((v) => (
                  <Link
                    key={v.id}
                    href={v.url || `/video/${v.id}`}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-blue-400/20 hover:bg-white/10"
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

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100 shrink-0">
            {error}
          </div>
        ) : null}

        <form onSubmit={onAsk} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ví dụ: 'đá tống trước sai thường gặp?'"
            className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none focus:ring-2 focus:ring-blue-400/30"
          />

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
          >
            {loading ? "Đang trả lời…" : "Hỏi"}
          </button>
        </form>
      </div>
    </div>
    )
  );
}
