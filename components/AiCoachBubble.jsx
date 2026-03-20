"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, ThumbsDown, ThumbsUp, X } from "lucide-react";

import { LESSONS, getLessonBySlug } from "@/data/lessons";
import { readDoneSlugs } from "@/lib/progress";
import { readProfile } from "@/lib/profile";
import MascotIcon from "@/components/MascotIcon";

const CHAT_STORE_KEY = "vovinam_ai_chat_v1";

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      feedbackHelpful: "Helpful feedback",
      feedbackNotHelpful: "Not helpful feedback",
      open: "Open",
      score: "score",
      helperRoadmap: (title, minutes) => `Today's suggestion: ${title} • ${minutes} min.`,
      helperVideo: "You are watching a video. Ask quick questions about techniques in this video (RAG).",
      helperLesson: (title) => `You are in lesson "${title}". Ask about common mistakes, fixes, and safety.`,
      helperLessonFallback: "You are in a lesson page. Ask about common mistakes, fixes, and safety.",
      helperDefault: "Ask about techniques, common mistakes, and safe training tips.",
      shortQuestion: "Please enter a slightly longer question.",
      cannotProcess: "Could not process this request.",
      cannotConnect: "Could not connect to API. Please try again.",
      nextTitle: "Next",
      nextLessonHint: "Open the lesson, practice slowly step by step for 10-15 minutes, then come back and mark complete.",
      nextRoadmapHint: (title) => `Do one more short lesson: ${title}.`,
      closeAria: "Close AI Coach",
      premiumTitle: "AI Coach is Premium",
      premiumDesc: "Upgrade to unlock AI Coach (RAG) and Yellow/Red belt content.",
      premiumFeature1: "Grounded answers from the knowledge base",
      premiumFeature2: "Mistake fixes and safety tips by belt level",
      premiumFeature3: "Advanced videos/techniques",
      upgrade: "Upgrade Premium",
      premiumDemo: "Demo: enable Premium in Profile.",
      emptyState: "Ask about techniques, common mistakes, and safe training tips.",
      openLesson: "Open lesson",
      demoVideos: "Demo videos",
      references: "References",
      inputPlaceholder: "Example: 'common errors in front push kick?'",
      ask: "Ask",
      answering: "Answering...",
      openCoachAria: "Open AI Coach",
    };
  }

  if (id === "ja") {
    return {
      feedbackHelpful: "役に立った",
      feedbackNotHelpful: "役に立たなかった",
      open: "開く",
      score: "スコア",
      helperRoadmap: (title, minutes) => `今日のおすすめ: ${title} • ${minutes}分。`,
      helperVideo: "動画を視聴中です。この動画の技術について素早く質問できます（RAG）。",
      helperLesson: (title) => `レッスン「${title}」を表示中です。よくあるミス、修正、安全面を質問できます。`,
      helperLessonFallback: "レッスンページです。よくあるミス、修正、安全面を質問できます。",
      helperDefault: "技術、よくあるミス、安全な練習のコツを質問してください。",
      shortQuestion: "もう少し長く質問を入力してください。",
      cannotProcess: "リクエストを処理できませんでした。",
      cannotConnect: "APIに接続できませんでした。もう一度お試しください。",
      nextTitle: "次へ",
      nextLessonHint: "レッスンを開き、10-15分ほど手順をゆっくり練習してから完了を記録しましょう。",
      nextRoadmapHint: (title) => `次に短いレッスンを1つ: ${title}。`,
      closeAria: "AIコーチを閉じる",
      premiumTitle: "AIコーチはプレミアム機能です",
      premiumDesc: "プレミアムでAIコーチ（RAG）と黄帯/紅帯コンテンツを開放できます。",
      premiumFeature1: "資料に基づく回答",
      premiumFeature2: "帯レベル別のミス修正と安全ガイド",
      premiumFeature3: "上級動画・技術",
      upgrade: "プレミアムにアップグレード",
      premiumDemo: "デモ: プロフィールでプレミアムを有効化できます。",
      emptyState: "技術、よくあるミス、安全な練習のコツを質問してください。",
      openLesson: "レッスンを開く",
      demoVideos: "参考動画",
      references: "参照元",
      inputPlaceholder: "例: 「前蹴りでよくあるミスは?」",
      ask: "質問",
      answering: "回答中...",
      openCoachAria: "AIコーチを開く",
    };
  }

  return {
    feedbackHelpful: "Phản hồi hữu ích",
    feedbackNotHelpful: "Phản hồi không hữu ích",
    open: "Mở",
    score: "score",
    helperRoadmap: (title, minutes) => `Gợi ý hôm nay: ${title} • ${minutes} phút.`,
    helperVideo: "Bạn đang xem video - hỏi nhanh về kỹ thuật trong video này (RAG).",
    helperLesson: (title) => `Bạn đang ở bài "${title}" - hỏi về lỗi thường gặp, cách sửa, an toàn...`,
    helperLessonFallback: "Bạn đang ở trang bài học - hỏi về lỗi thường gặp, cách sửa, an toàn...",
    helperDefault: "Hỏi về kỹ thuật, lỗi thường gặp, mẹo tập an toàn...",
    shortQuestion: "Bạn nhập câu hỏi dài hơn một chút nhé.",
    cannotProcess: "Không xử lý được yêu cầu.",
    cannotConnect: "Không kết nối được API. Vui lòng thử lại.",
    nextTitle: "Tiếp theo",
    nextLessonHint: "Mở bài, tập chậm theo từng bước 10-15 phút, rồi quay lại đánh dấu hoàn thành.",
    nextRoadmapHint: (title) => `Làm thêm 1 bài nhỏ: ${title}.`,
    closeAria: "Đóng AI Coach",
    premiumTitle: "AI Coach là Premium",
    premiumDesc: "Nâng cấp để mở khóa AI Coach (RAG) và nội dung Hoàng/Hồng đai.",
    premiumFeature1: "Trả lời grounded theo tài liệu",
    premiumFeature2: "Gợi ý sửa lỗi + an toàn theo cấp",
    premiumFeature3: "Video/kỹ thuật nâng cao",
    upgrade: "Nâng cấp Premium",
    premiumDemo: "Demo: bật Premium trong Hồ sơ.",
    emptyState: "Hỏi về kỹ thuật, lỗi thường gặp, mẹo tập an toàn...",
    openLesson: "Mở bài",
    demoVideos: "Video minh họa",
    references: "Nguồn tham chiếu",
    inputPlaceholder: "Ví dụ: 'đá tống trước sai thường gặp?'",
    ask: "Hỏi",
    answering: "Đang trả lời...",
    openCoachAria: "Mở AI Coach",
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
            role:
              m?.role === "assistant"
                ? "assistant"
                : m?.role === "user"
                  ? "user"
                  : "",
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

function MarkdownAnswer({ children, className = "" }) {
  const content = String(children || "");
  if (!content.trim()) return null;

  return (
    <div className={`text-sm leading-6 text-slate-200 ${className}`.trim()}>
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
          ol: ({ children: c }) => (
            <ol className="mt-2 grid gap-1 list-decimal pl-5">{c}</ol>
          ),
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
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-cyan-300/10 text-blue-100">
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
          <MarkdownAnswer className="mt-0">{content}</MarkdownAnswer>
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
              aria-label={copy.feedbackHelpful}
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

function SourceItem({ source, copy }) {
  const href = String(source?.url || "").trim();

  return (
    <li className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate">
            {source.title}
          </div>
          <div className="mt-0.5 text-xs text-slate-300">
            {source.type} • {copy.score} {source.score}
          </div>
        </div>
        {href ? (
          <Link
            href={href}
            className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            {copy.open}
          </Link>
        ) : null}
      </div>
    </li>
  );
}

function parseRouteContext(pathname) {
  const path = String(pathname || "/");

  if (path.startsWith("/video/")) {
    const id = path.split("/")[2] || "";
    return id ? { kind: "video", videoId: id } : { kind: "video" };
  }

  if (path.startsWith("/bai-hoc/")) {
    const slug = path.split("/")[2] || "";
    return slug ? { kind: "lesson", lessonSlug: slug } : { kind: "lesson" };
  }

  if (path === "/lo-trinh") return { kind: "roadmap" };

  return { kind: "page" };
}

export default function AiCoachBubble() {
  const locale = useLocale();
  const copy = getCopy(locale);
  const pathname = usePathname() || "/";
  const routeCtx = useMemo(() => parseRouteContext(pathname), [pathname]);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [sources, setSources] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [planId, setPlanId] = useState("free");
  const [activeContext, setActiveContext] = useState(null);
  const abortRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const stickToBottomRef = useRef(true);

  const isPremium = planId === "premium";

  const [doneSlugs, setDoneSlugs] = useState([]);

  useEffect(() => {
    const store = readChatStore();
    setSessionId(store.sessionId || "");
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

  const sendFeedback = async ({ messageId, rating }) => {
    const id = String(messageId || "").trim();
    const r = Number(rating);
    if (!id) return;
    if (r !== 1 && r !== -1) return;

    setChatHistory((prev) => {
      const next = (Array.isArray(prev) ? prev : []).map((m) =>
        String(m?.id || "") === id ? { ...m, feedback: r } : m
      );

      const store = readChatStore();
      writeChatStore({ history: next.slice(-8), sessionId: sessionId || store.sessionId || "" });
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

  const attachFeedbackHandler = (history) => {
    const list = Array.isArray(history) ? history : [];
    return list.map((m) => ({ ...m, onFeedback: sendFeedback }));
  };

  useEffect(() => {
    const sync = () => {
      const done = readDoneSlugs();
      setDoneSlugs(Array.isArray(done) ? done : []);
    };

    sync();
    window.addEventListener("vovinam-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vovinam-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const nextLesson = useMemo(() => {
    const done = new Set(doneSlugs);
    return LESSONS.find((l) => !done.has(l.slug)) || null;
  }, [doneSlugs]);

  const helperText = useMemo(() => {
    if (routeCtx.kind === "roadmap" && nextLesson) {
      return copy.helperRoadmap(nextLesson.title, nextLesson.minutes);
    }

    if (routeCtx.kind === "video" && routeCtx.videoId) {
      return copy.helperVideo;
    }

    if (routeCtx.kind === "lesson" && routeCtx.lessonSlug) {
      const l = getLessonBySlug(routeCtx.lessonSlug);
      return l
        ? copy.helperLesson(l.title)
        : copy.helperLessonFallback;
    }

    return copy.helperDefault;
  }, [copy, nextLesson, routeCtx.kind, routeCtx.lessonSlug, routeCtx.videoId]);

  const ask = async ({ q, contextOverride }) => {
    if (!isPremium) {
      setOpen(true);
      return;
    }

    const question = String(q || "").trim();
    if (question.length < 2) {
      setError(copy.shortQuestion);
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
        attachFeedbackHandler(
          [...history, { role: "user", content: question }, { role: "assistant", content: "" }].slice(
            -8
          )
        )
      );

      const mergedContext = {
        pagePath: pathname,
        ...(routeCtx || null),
        ...(contextOverride || null),
      };

      setActiveContext(mergedContext);

      const res = await fetch("/api/ai/coach", {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          query: question,
          context: mergedContext,
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
          const vids = Array.isArray(meta?.recommendedVideos)
            ? meta.recommendedVideos
            : [];
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

            if (evt === "meta") applyMeta(payload);
            if (evt === "delta") pushDelta(payload?.text);
            if (evt === "done") {
              const id = typeof payload?.assistantMessageId === "string" ? payload.assistantMessageId : "";
              if (id) finalAssistantMessageId = id;
              if (typeof payload?.sessionId === "string" && payload.sessionId) {
                activeSessionId = payload.sessionId;
                setSessionId(payload.sessionId);
              }
            }
            if (evt === "error") {
              setError(payload?.error || copy.cannotProcess);
            }
          }
        }

        const nextHistory = [
          ...history,
          { role: "user", content: question },
          { role: "assistant", content: finalAnswer, id: finalAssistantMessageId || "" },
        ].slice(-8);
        writeChatStore({ history: nextHistory, sessionId: activeSessionId });
        setChatHistory(attachFeedbackHandler(nextHistory));
        return;
      }

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || copy.cannotProcess);
        return;
      }

      setAnswer(String(data?.answer || ""));
      setSources(Array.isArray(data?.sources) ? data.sources : []);
      setRecommendedVideos(
        Array.isArray(data?.recommendedVideos) ? data.recommendedVideos : []
      );

      if (data?.sessionId && typeof data.sessionId === "string") {
        setSessionId(data.sessionId);
      }

      const nextHistory = [
        ...history,
        { role: "user", content: question },
        {
          role: "assistant",
          content: String(data?.answer || ""),
          id: typeof data?.assistantMessageId === "string" ? data.assistantMessageId : "",
        },
      ].slice(-8);
      writeChatStore({
        history: nextHistory,
        sessionId: String(data?.sessionId || sessionId || ""),
      });
      setChatHistory(attachFeedbackHandler(nextHistory));
    } catch {
      setError(copy.cannotConnect);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await ask({ q: query, contextOverride: null });
  };

  useEffect(() => {
    const onAskEvent = (evt) => {
      const detail = evt?.detail && typeof evt.detail === "object" ? evt.detail : {};
      const q = String(detail?.query || "");
      const ctx = detail?.context && typeof detail.context === "object" ? detail.context : null;

      const store = readChatStore();
      setChatHistory(attachFeedbackHandler(Array.isArray(store.history) ? store.history : []));

      setOpen(true);
      setQuery(q);

      if (!isPremium) return;

      // One-click quick actions should auto-submit.
      setTimeout(() => {
        ask({ q, contextOverride: ctx });
      }, 0);
    };

    window.addEventListener("vovinam-ai-ask", onAskEvent);
    return () => {
      window.removeEventListener("vovinam-ai-ask", onAskEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, routeCtx, sessionId, isPremium]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      inputRef.current?.focus?.();
    }, 0);
  }, [open]);

  const scrollToBottom = (behavior = "auto") => {
    const el = scrollRef.current;
    if (!el) return;

    try {
      el.scrollTo({ top: el.scrollHeight, behavior });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!open) return;
    stickToBottomRef.current = true;
    setTimeout(() => {
      scrollToBottom("auto");
    }, 0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!stickToBottomRef.current) return;
    scrollToBottom("smooth");
  }, [open, chatHistory.length, answer]);

  const nextStepHint = useMemo(() => {
    const lessonSlug = String(activeContext?.lessonSlug || "");

    if (lessonSlug) {
      return {
        title: copy.nextTitle,
        text: copy.nextLessonHint,
        href: `/bai-hoc/${lessonSlug}`,
      };
    }

    if (String(activeContext?.kind) === "roadmap" && nextLesson) {
      return {
        title: copy.nextTitle,
        text: copy.nextRoadmapHint(nextLesson.title),
        href: `/bai-hoc/${nextLesson.slug}`,
      };
    }

    return null;
  }, [copy, activeContext?.kind, activeContext?.lessonSlug, nextLesson]);

  const hasChat = useMemo(() => {
    return Array.isArray(chatHistory) && chatHistory.some((m) => String(m?.content || "").trim());
  }, [chatHistory]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-8 rounded-[2.75rem] bg-[radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.25),transparent_60%)] blur-2xl"
          />

          <div className="relative w-[20rem] sm:w-[22rem] max-w-[calc(100vw-2rem)] h-[30rem] max-h-[calc(100vh-6rem)] overflow-hidden rounded-[2rem] border border-white/10 bg-[color:var(--header-bg)] shadow-[var(--shadow-card-strong)] backdrop-blur flex flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-slate-950">
                  <MascotIcon className="h-6 w-6" />
                </span>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-white">AI Coach</div>
                  <div className="text-xs text-slate-300">{helperText}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-300/30"
                aria-label={copy.closeAria}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!isPremium ? (
              <div className="p-4 flex flex-col gap-3">
                <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 text-sm leading-6 text-slate-200">
                  <div className="text-xs font-semibold text-slate-300">{copy.premiumTitle}</div>
                  <p className="mt-2 text-slate-300">
                    {copy.premiumDesc}
                  </p>
                  <ul className="mt-3 grid gap-1 text-slate-300">
                    <li>• {copy.premiumFeature1}</li>
                    <li>• {copy.premiumFeature2}</li>
                    <li>• {copy.premiumFeature3}</li>
                  </ul>
                </div>

                <Link
                  href="/ho-so#goi-premium"
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-300/40"
                >
                  {copy.upgrade}
                </Link>
                <p className="text-xs leading-5 text-slate-400">{copy.premiumDemo}</p>
              </div>
            ) : (
              <div className="p-4 flex flex-col flex-1 min-h-0">
                <div
                  ref={scrollRef}
                  onScroll={() => {
                    const el = scrollRef.current;
                    if (!el) return;
                    const threshold = 48;
                    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
                    stickToBottomRef.current = distance <= threshold;
                  }}
                  className="ai-scrollbar flex-1 min-h-0 overflow-auto pr-1"
                >
                  {hasChat ? (
                    <div className="grid gap-2">
                      {chatHistory.map((m, idx) => (
                        <ChatMessage
                          // idx is OK here: history is append-only within the last 8 turns.
                          key={`${m.role}-${idx}`}
                          copy={copy}
                          message={m}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-slate-300">
                      {copy.emptyState}
                    </div>
                  )}

                  {error ? (
                    <div className="mt-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">
                      {error}
                    </div>
                  ) : null}

                  {nextStepHint && answer ? (
                    <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div className="text-xs font-semibold text-slate-300">{nextStepHint.title}</div>
                      <p className="mt-1 text-xs leading-5 text-slate-300">{nextStepHint.text}</p>
                      {nextStepHint.href ? (
                        <Link
                          href={nextStepHint.href}
                          className="mt-2 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-300/30"
                        >
                          {copy.openLesson}
                        </Link>
                      ) : null}
                    </div>
                  ) : null}

                  {Array.isArray(recommendedVideos) && recommendedVideos.length > 0 ? (
                    <div className="mt-3">
                      <div className="text-xs font-semibold text-slate-300">{copy.demoVideos}</div>
                      <div className="mt-2 grid gap-2">
                        {recommendedVideos.slice(0, 2).map((v) => (
                          <Link
                            key={v.id}
                            href={v.url || `/video/${v.id}`}
                            className="rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
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
                    <div className="mt-3">
                      <div className="text-xs font-semibold text-slate-300">{copy.references}</div>
                      <ul className="mt-2 grid gap-2">
                        {sources.slice(0, 3).map((s) => (
                          <SourceItem key={s.id} source={s} copy={copy} />
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>

                <form
                  onSubmit={onSubmit}
                  className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] shrink-0"
                >
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={copy.inputPlaceholder}
                    className="h-10 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-300/30"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-300/40"
                  >
                    <Sparkles className="h-4 w-4" />
                    {loading ? copy.answering : copy.ask}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            const store = readChatStore();
            setChatHistory(attachFeedbackHandler(Array.isArray(store.history) ? store.history : []));
            setOpen(true);
          }}
          className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-slate-950 shadow-[var(--shadow-card)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-300/40"
          aria-label={copy.openCoachAria}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-6 rounded-[1.75rem] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.35),transparent_60%)] blur-2xl"
          />
          <MascotIcon className="relative h-7 w-7" />
        </button>
      )}
    </div>
  );
}

