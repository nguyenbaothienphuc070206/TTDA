"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";

import { readProfile } from "@/lib/profile";
import MascotIcon from "@/components/MascotIcon";

const CHAT_STORE_KEY = "vovinam_ai_chat_v1";

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      feedbackHelpful: "Helpful feedback",
      feedbackNotHelpful: "Not helpful feedback",
      thinkingAria: "AI is thinking",
      thinkingSr: "AI is thinking...",
      open: "Open",
      helperVideo: "Quick questions about techniques in this video (RAG).",
      helperDefault: "Ask about techniques, common mistakes, and safe training tips.",
      needLongerQuestion: "Please enter a slightly longer question.",
      requestError: "Could not process the request.",
      apiError: "Cannot connect to API. Please try again.",
      premiumTitle: "AI Coach (Premium)",
      premiumDesc:
        "This feature is part of Premium. Upgrade to unlock AI Coach (RAG) and Yellow/Red belt techniques.",
      premiumUnlock: "Premium unlocks",
      premiumFeat1: "Ask common mistakes + fixes grounded in learning materials",
      premiumFeat2: "Safe practice suggestions by belt level",
      premiumFeat3: "Unlock advanced videos/techniques",
      upgrade: "Upgrade Premium",
      demoNote: "Demo: you can enable Premium in Profile.",
      emptyState:
        "Ask about techniques, common mistakes, and safe practice tips. AI answers based on available learning sources.",
      recommendedVideos: "Suggested videos",
      sources: "References",
      inputPlaceholder: "Example: 'common mistakes in front push kick?'",
      answering: "Answering...",
      ask: "Ask",
    };
  }

  if (id === "ja") {
    return {
      feedbackHelpful: "役に立ったフィードバック",
      feedbackNotHelpful: "役に立たなかったフィードバック",
      thinkingAria: "AIが考えています",
      thinkingSr: "AIが考えています...",
      open: "開く",
      helperVideo: "この動画の技術についてすぐ質問できます（RAG）。",
      helperDefault: "技術、よくあるミス、安全な練習のコツを質問できます。",
      needLongerQuestion: "もう少し長く質問を入力してください。",
      requestError: "リクエストを処理できませんでした。",
      apiError: "APIに接続できません。しばらくして再試行してください。",
      premiumTitle: "AIコーチ（プレミアム）",
      premiumDesc:
        "この機能はプレミアム対象です。アップグレードすると AIコーチ（RAG）と黄帯・紅帯技術を利用できます。",
      premiumUnlock: "プレミアムで開放",
      premiumFeat1: "教材に基づく、よくあるミスと修正方法の質問",
      premiumFeat2: "帯レベルに応じた安全な練習提案",
      premiumFeat3: "上級動画・技術を開放",
      upgrade: "プレミアムへアップグレード",
      demoNote: "デモ: プロフィールでプレミアムを有効化できます。",
      emptyState:
        "技術、よくあるミス、安全な練習のコツを質問してください。AIが利用可能な資料に基づいて回答します。",
      recommendedVideos: "おすすめ動画",
      sources: "参照ソース",
      inputPlaceholder: "例: 「前蹴りのよくあるミスは？」",
      answering: "回答中...",
      ask: "質問",
    };
  }

  return {
    feedbackHelpful: "Phản hồi hữu ích",
    feedbackNotHelpful: "Phản hồi không hữu ích",
    thinkingAria: "AI đang suy nghĩ",
    thinkingSr: "AI đang suy nghĩ...",
    open: "Mở",
    helperVideo: "Hỏi nhanh về kỹ thuật trong video này (RAG).",
    helperDefault: "Hỏi về kỹ thuật, lỗi thường gặp, mẹo tập an toàn…",
    needLongerQuestion: "Bạn nhập câu hỏi dài hơn một chút nhé.",
    requestError: "Không xử lý được yêu cầu.",
    apiError: "Không kết nối được API. Vui lòng thử lại.",
    premiumTitle: "AI Coach (Premium)",
    premiumDesc:
      "Tính năng này thuộc gói Premium. Nâng cấp để mở khóa AI Coach (RAG) và kỹ thuật Hoàng/Hồng đai.",
    premiumUnlock: "Premium mở khóa",
    premiumFeat1: "Hỏi lỗi thường gặp + cách sửa theo tài liệu",
    premiumFeat2: "Gợi ý bài tập an toàn theo cấp đai",
    premiumFeat3: "Mở khóa video/kỹ thuật nâng cao",
    upgrade: "Nâng cấp Premium",
    demoNote: "Demo: bạn có thể bật Premium trong Hồ sơ.",
    emptyState: "Hỏi về kỹ thuật, lỗi thường gặp, mẹo tập an toàn… AI sẽ trả lời theo tài liệu có sẵn.",
    recommendedVideos: "Video minh hoạ",
    sources: "Nguồn tham chiếu",
    inputPlaceholder: "Ví dụ: 'đá tống trước sai thường gặp?'",
    answering: "Đang trả lời…",
    ask: "Hỏi",
  };
}

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
              className="text-amber-200 underline underline-offset-4 hover:text-amber-100"
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

function ChatMessage({ message, copy }) {
  const role = message?.role;
  const content = String(message?.content || "");
  if (!content.trim()) return null;

  const isUser = role === "user";
  const messageId = typeof message?.id === "string" ? message.id : "";
  const feedback = message?.feedback === 1 || message?.feedback === -1 ? message.feedback : 0;

  return (
    <div className={"flex gap-2 " + (isUser ? "justify-end" : "justify-start")}>
      {!isUser ? (
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-amber-400/20 to-amber-500/10 text-amber-100">
          <MascotIcon className="h-5 w-5" />
        </span>
      ) : null}

      <div
        className={
          "max-w-[82%] rounded-3xl border p-3 " +
          (isUser
            ? "border-amber-300/25 bg-amber-400/10 text-white"
            : "border-white/10 bg-slate-950/30 backdrop-blur-xl text-slate-200")
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
                "inline-flex h-8 w-8 items-center justify-center rounded-xl border text-slate-200 transition focus:outline-none focus:ring-2 focus:ring-amber-300/30 " +
                (feedback === 1
                  ? "border-amber-300/30 bg-amber-400/10 text-amber-100"
                  : "border-white/10 bg-white/5 hover:bg-white/10 hover:text-white")
              }
              aria-label={copy.feedbackHelpful}
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => message?.onFeedback?.({ messageId, rating: -1 })}
              className={
                "inline-flex h-8 w-8 items-center justify-center rounded-xl border text-slate-200 transition focus:outline-none focus:ring-2 focus:ring-amber-300/30 " +
                (feedback === -1
                  ? "border-amber-300/30 bg-amber-400/10 text-amber-100"
                  : "border-white/10 bg-white/5 hover:bg-white/10 hover:text-white")
              }
              aria-label={copy.feedbackNotHelpful}
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AssistantThinkingSkeleton({ copy }) {
  return (
    <div
      className="flex gap-2 justify-start"
      role="status"
      aria-live="polite"
      aria-label={copy.thinkingAria}
    >
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-amber-400/20 to-amber-500/10 text-amber-100">
        <MascotIcon className="h-5 w-5" />
      </span>

      <div className="max-w-[82%] rounded-3xl border border-blue-400/20 bg-blue-500/10 p-3">
        <span className="sr-only">{copy.thinkingSr}</span>
        <div className="grid gap-2 animate-pulse">
          <div className="h-3 w-44 rounded-full bg-blue-300/20" />
          <div className="h-3 w-64 max-w-full rounded-full bg-blue-300/20" />
          <div className="h-3 w-36 rounded-full bg-blue-300/20" />
        </div>
      </div>
    </div>
  );
}

function SourceItem({ source, copy }) {
  const href = String(source?.url || "").trim();

  return (
    <li className="rounded-2xl border border-white/10 bg-slate-950/30 backdrop-blur-xl p-3">
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
            className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white hover:border-amber-300/20 focus:outline-none focus:ring-2 focus:ring-amber-300/30"
          >
            {copy.open}
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
  const locale = useLocale();
  const copy = getCopy(locale);

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
  const stickToBottomRef = useRef(true);

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

    if (!stickToBottomRef.current) return;

    try {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } catch {
      // ignore
    }
  }, [chatHistory.length, answer]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 64;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distance <= threshold;
  };

  const helperText = useMemo(() => {
    if (context?.videoId) {
      return copy.helperVideo;
    }

    return copy.helperDefault;
  }, [context?.videoId, copy.helperDefault, copy.helperVideo]);

  const onAsk = async (e) => {
    e.preventDefault();

    const q = String(query || "").trim();
    if (q.length < 2) {
      setError(copy.needLongerQuestion);
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");
    setSources([]);
    setRecommendedVideos([]);
    stickToBottomRef.current = true;

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
              setError(payload?.error || copy.requestError);
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
        setError(data?.error || copy.requestError);
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
      setError(copy.apiError);
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
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/30 backdrop-blur-xl shadow-[var(--shadow-card)] flex flex-col h-[calc(100vh-theme(spacing.16))] lg:sticky lg:top-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-8 rounded-[2.75rem] bg-[radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.16),transparent_60%)] blur-2xl"
        />

        <div className="relative flex flex-col h-full p-6 sm:p-8">
          <div className="flex items-start gap-3 shrink-0">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950">
              <MascotIcon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-white">{copy.premiumTitle}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                {copy.premiumDesc}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/30 p-5 text-sm leading-6 text-slate-200">
            <div className="text-xs font-semibold text-slate-300">{copy.premiumUnlock}</div>
            <ul className="mt-2 grid gap-1">
              <li>• {copy.premiumFeat1}</li>
              <li>• {copy.premiumFeat2}</li>
              <li>• {copy.premiumFeat3}</li>
            </ul>
          </div>

          <div className="mt-auto pt-4">
            <Link
              href="/ho-so#goi-premium"
              className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-300 to-amber-500 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
            >
              {copy.upgrade}
            </Link>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              {copy.demoNote}
            </p>
          </div>
        </div>
      </div>
    ) : (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/30 backdrop-blur-xl shadow-[var(--shadow-card)] flex flex-col h-[calc(100vh-theme(spacing.16))] lg:sticky lg:top-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 rounded-[2.75rem] bg-[radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.16),transparent_60%)] blur-2xl"
      />

      <div className="relative flex flex-col h-full p-6 sm:p-8">
        <div className="flex items-start gap-3 shrink-0">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950">
            <MascotIcon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-white">AI Coach</h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">{helperText}</p>
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="ai-scrollbar mt-4 flex-1 min-h-0 overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/30 p-4"
        >
          {hasChat ? (
            <div className="grid gap-3">
              {chatHistory.map((m, idx) => (
                <ChatMessage key={`${m.role}-${idx}`} message={m} copy={copy} />
              ))}

              {loading && !String(answer || "").trim() ? <AssistantThinkingSkeleton copy={copy} /> : null}
            </div>
          ) : (
            <div className="flex items-start gap-3 text-slate-300">
              <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-amber-100">
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="text-sm leading-6">
                {copy.emptyState}
              </div>
            </div>
          )}

          {Array.isArray(recommendedVideos) && recommendedVideos.length > 0 ? (
            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-300">{copy.recommendedVideos}</div>
              <div className="mt-2 grid gap-2">
                {recommendedVideos.slice(0, 2).map((v) => (
                  <Link
                    key={v.id}
                    href={v.url || `/video/${v.id}`}
                    className="rounded-2xl border border-white/10 bg-slate-950/30 backdrop-blur-xl p-4 transition hover:border-amber-300/25 hover:bg-slate-950/20"
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
              <div className="text-xs font-semibold text-slate-300">{copy.sources}</div>
              <ul className="mt-2 grid gap-2">
                {sources.slice(0, 5).map((s) => (
                  <SourceItem key={s.id} source={s} copy={copy} />
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
            placeholder={copy.inputPlaceholder}
            className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none focus:ring-2 focus:ring-amber-300/30"
          />

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-300 to-amber-500 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
          >
            {loading ? copy.answering : copy.ask}
          </button>
        </form>
      </div>
    </div>
    )
  );
}
