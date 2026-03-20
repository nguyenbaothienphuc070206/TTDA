"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";

function safeJsonParse(text, fallback) {
  try {
    const parsed = JSON.parse(text);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `m_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      defaultName: "Student",
      title: "Chat",
      withUser: "Chatting with",
      clearChat: "Clear chat",
      messageListAria: "Message list",
      emptyState: "No messages yet. Send a hello!",
      placeholder: "Type a message... (Enter to send, Shift+Enter for new line)",
      send: "Send",
      missingReceiver: "Missing recipient.",
      note: "Note: This is a demo chat (stored locally on this device). For real multi-user chat, add a messages table + RLS.",
      demoReplies: [
        "Got it!",
        "Looks good. Warm up well first.",
        "How far did you get in practice?",
        "I'm online for a bit, ping me.",
      ],
      timeLocale: "en-US",
    };
  }

  if (id === "ja") {
    return {
      defaultName: "学習者",
      title: "チャット",
      withUser: "チャット中:",
      clearChat: "チャットを消去",
      messageListAria: "メッセージ一覧",
      emptyState: "まだメッセージがありません。まずは挨拶を送ってみましょう。",
      placeholder: "メッセージを入力... (Enterで送信、Shift+Enterで改行)",
      send: "送信",
      missingReceiver: "受信者がありません。",
      note: "注: これはデモチャットです (この端末にローカル保存)。実際の複数人チャットには、messages テーブルと RLS の追加が必要です。",
      demoReplies: [
        "了解です!",
        "いいですね。しっかり準備運動しましょう。",
        "練習はどこまで進みましたか?",
        "少しの間オンラインです。気軽にどうぞ。",
      ],
      timeLocale: "ja-JP",
    };
  }

  return {
    defaultName: "Học viên",
    title: "Chat",
    withUser: "Đang chat với",
    clearChat: "Xóa chat",
    messageListAria: "Danh sách tin nhắn",
    emptyState: "Chưa có tin nhắn. Hãy gửi lời chào!",
    placeholder: "Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)",
    send: "Gửi",
    missingReceiver: "Thiếu người nhận.",
    note: "Ghi chú: Đây là chat demo (lưu cục bộ trên thiết bị). Để chat thật nhiều người, cần thêm bảng tin nhắn + RLS.",
    demoReplies: [
      "Ok bạn nhé!",
      "Chuẩn rồi - nhớ khởi động kỹ nha.",
      "Bạn tập tới đâu rồi?",
      "Mình đang online chút xíu, nhắn mình nha.",
    ],
    timeLocale: "vi-VN",
  };
}

function formatTime(ms, locale) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n <= 0) return "";
  return new Date(n).toLocaleTimeString(locale || "vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommunityChat({ toUserId, toName }) {
  const locale = useLocale();
  const copy = getCopy(locale);
  const toId = String(toUserId || "").trim();
  const name = String(toName || "").trim() || copy.defaultName;

  const storageKey = useMemo(() => {
    return toId ? `vovinam_dm_${toId}` : "";
  }, [toId]);

  const [messages, setMessages] = useState(() => {
    if (typeof window === "undefined") return [];
    if (!toId) return [];

    try {
      const raw = window.localStorage.getItem(`vovinam_dm_${toId}`);
      const parsed = safeJsonParse(raw, []);
      const list = Array.isArray(parsed) ? parsed : [];
      return list.slice(-200);
    } catch {
      return [];
    }
  });
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (!storageKey) return;

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(messages.slice(-200)));
    } catch {
      // ignore
    }
  }, [messages, storageKey]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const pushMessage = (msg) => {
    setMessages((prev) => {
      const next = [...prev, msg];
      return next.slice(-200);
    });
  };

  const send = () => {
    const text = String(draft || "").trim();
    if (!text) return;

    const now = Date.now();
    pushMessage({ id: makeId(), from: "me", text, at: now });
    setDraft("");

    // Demo reply to make the chat feel alive (local-only).
    const replies = copy.demoReplies;

    const pick = replies[Math.floor(Math.random() * replies.length)];

    window.setTimeout(() => {
      pushMessage({ id: makeId(), from: "them", text: pick, at: Date.now() });
    }, 650);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!toId) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="text-sm text-slate-300">{copy.missingReceiver}</div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">{copy.title}</h1>
          <p className="mt-1 text-sm text-slate-300">
            {copy.withUser} <span className="font-semibold text-white">{name}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMessages([])}
          className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
        >
          {copy.clearChat}
        </button>
      </div>

      <div
        ref={listRef}
        className="mt-4 h-[420px] overflow-auto rounded-2xl border border-white/10 bg-slate-950/30 p-3 ai-scrollbar"
        aria-label={copy.messageListAria}
      >
        {messages.length ? (
          <div className="grid gap-2">
            {messages.map((m, idx) => {
              const mine = m?.from === "me";
              const text = String(m?.text || "");
              const time = formatTime(m?.at, copy.timeLocale);
              const key = typeof m?.id === "string" && m.id ? m.id : `k_${m?.at || 0}_${idx}`;

              return (
                <div
                  key={key}
                  className={mine ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={
                      "max-w-[85%] rounded-2xl border px-3 py-2 text-sm leading-6 shadow-sm " +
                      (mine
                        ? "border-cyan-300/25 bg-gradient-to-r from-cyan-300/15 to-blue-500/10 text-white"
                        : "border-white/10 bg-white/5 text-slate-100")
                    }
                  >
                    <div className="whitespace-pre-wrap break-words">{text}</div>
                    {time ? (
                      <div className="mt-1 text-[11px] text-slate-300/80">{time}</div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-slate-300">{copy.emptyState}</div>
        )}
      </div>

      <div className="mt-3 grid gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={copy.placeholder}
          rows={3}
          className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
        />

        <button
          type="button"
          onClick={send}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
        >
          {copy.send}
        </button>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-300">
        {copy.note}
      </p>
    </div>
  );
}

