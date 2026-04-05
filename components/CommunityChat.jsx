"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import {
  fetchCommunityMessages,
  markConversationRead,
  sendTypingPing,
  sendCommunityMessage,
} from "@/lib/community/messagesApi";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";

const PAGE_SIZE = 30;

function asText(value) {
  return String(value || "").trim();
}

function formatTime(isoText, locale) {
  const value = asText(isoText);
  if (!value) return "";

  const ts = Date.parse(value);
  if (!Number.isFinite(ts)) return "";

  return new Date(ts).toLocaleTimeString(locale || "vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toTimeValue(isoText) {
  const ts = Date.parse(asText(isoText));
  return Number.isFinite(ts) ? ts : 0;
}

function mergeMessages(listA, listB) {
  const map = new Map();

  for (const item of [...(Array.isArray(listA) ? listA : []), ...(Array.isArray(listB) ? listB : [])]) {
    const id = asText(item?.id);
    if (!id) continue;
    map.set(id, item);
  }

  return Array.from(map.values()).sort((a, b) => toTimeValue(a?.createdAt) - toTimeValue(b?.createdAt));
}

export default function CommunityChat({ toUserId, toName }) {
  const t = useTranslations("community.chat");
  const locale = useLocale();
  const toId = asText(toUserId);
  const name = asText(toName) || t("defaultName");

  const [viewerId, setViewerId] = useState("");
  const [messages, setMessages] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [isThemTyping, setIsThemTyping] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");

  const listRef = useRef(null);
  const channelRef = useRef(null);
  const typingTimerRef = useRef(null);
  const lastTypingPingMsRef = useRef(0);

  const loadMessages = useCallback(
    async ({ cursor = "", append = false, silent = false } = {}) => {
      if (!toId) return;

      if (!silent) {
        if (append) {
          setLoadingMore(true);
        } else if (!hasLoaded) {
          setLoadingInitial(true);
        }
      }

      try {
        setError("");
        const data = await fetchCommunityMessages({
          toUserId: toId,
          cursor,
          limit: PAGE_SIZE,
        });

        const incoming = Array.isArray(data?.messages) ? data.messages : [];

        if (data?.viewerId) {
          setViewerId(asText(data.viewerId));
        }

        setMessages((prev) => {
          if (append) {
            return mergeMessages(prev, incoming);
          }
          return hasLoaded ? mergeMessages(prev, incoming) : incoming;
        });

        setNextCursor(asText(data?.nextCursor));
        setHasLoaded(true);

        const hasUnreadIncoming = incoming.some((m) => !m?.isMine && !m?.readAt);
        if (hasUnreadIncoming) {
          await markConversationRead({ toUserId: toId }).catch(() => null);
          setMessages((prev) =>
            prev.map((m) => {
              if (m?.isMine || m?.readAt) return m;
              return { ...m, readAt: new Date().toISOString() };
            })
          );
        }
      } catch (e) {
        void e;
        setError(t("genericError"));
      } finally {
        if (!silent) {
          setLoadingInitial(false);
          setLoadingMore(false);
        }
      }
    },
    [hasLoaded, t, toId]
  );

  useEffect(() => {
    setViewerId("");
    setMessages([]);
    setNextCursor("");
    setHasLoaded(false);
    setError("");

    if (!toId) return;
    loadMessages({ append: false });
  }, [toId, loadMessages]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    if (channelRef.current) {
      createSupabaseBrowserClient().removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (!viewerId || !toId) return;

    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`community-dm-${viewerId}-${toId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "community_messages",
          filter: `recipient_id=eq.${viewerId}`,
        },
        (payload) => {
          const senderId = asText(payload?.new?.sender_id);
          if (senderId !== toId) return;
          loadMessages({ append: false, silent: true });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "community_messages",
          filter: `sender_id=eq.${viewerId}`,
        },
        (payload) => {
          const recipientId = asText(payload?.new?.recipient_id);
          if (recipientId !== toId) return;
          loadMessages({ append: false, silent: true });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "community_typing_state",
          filter: `recipient_id=eq.${viewerId}`,
        },
        (payload) => {
          const senderId = asText(payload?.new?.sender_id);
          if (senderId !== toId) return;

          setIsThemTyping(true);

          if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
          }

          typingTimerRef.current = window.setTimeout(() => {
            setIsThemTyping(false);
            typingTimerRef.current = null;
          }, 6_500);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;

      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, [viewerId, toId, loadMessages]);

  useEffect(() => {
    if (!viewerId || !toId) return;
    const text = asText(draft);
    if (!text) return;

    const now = Date.now();
    if (now - lastTypingPingMsRef.current < 2_000) {
      return;
    }

    lastTypingPingMsRef.current = now;
    sendTypingPing({ toUserId: toId }).catch(() => null);
  }, [draft, viewerId, toId]);

  const send = async () => {
    const text = asText(draft);
    if (!text || sending) return;

    setSending(true);
    setError("");

    try {
      const sent = await sendCommunityMessage({ toUserId: toId, body: text });
      setDraft("");

      if (sent && sent.id) {
        setMessages((prev) => mergeMessages(prev, [sent]));
      }

      await loadMessages({ append: false, silent: true });
    } catch (e) {
      void e;
      setError(t("genericError"));
    } finally {
      setSending(false);
    }
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
        <div className="text-sm text-slate-300">{t("missingReceiver")}</div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-card-strong)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-300">
            {t("withUser")} <span className="font-semibold text-white">{name}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadMessages({ append: false })}
          className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
        >
          {t("refresh")}
        </button>
      </div>

      {error ? (
        <div className="mt-3 rounded-2xl border border-rose-400/25 bg-rose-500/10 p-3 text-sm text-rose-100">
          <div>{error}</div>
          <button
            type="button"
            onClick={() => loadMessages({ append: false })}
            className="mt-2 inline-flex h-8 items-center justify-center rounded-xl border border-rose-300/30 bg-rose-400/10 px-3 text-xs font-semibold text-rose-50 transition hover:bg-rose-400/20"
          >
            {t("retry")}
          </button>
        </div>
      ) : null}

      {isThemTyping ? (
        <div className="mt-2 text-xs font-semibold text-cyan-200">{t("typing")}</div>
      ) : null}

      <div
        ref={listRef}
        className="mt-4 h-105 overflow-auto rounded-2xl border border-white/10 bg-slate-950/35 p-3 ai-scrollbar"
        aria-label={t("messageListAria")}
      >
        {loadingInitial ? (
          <div className="text-sm text-slate-300">{t("loading")}</div>
        ) : messages.length ? (
          <div className="grid gap-2">
            {messages.map((m, idx) => {
              const mine = Boolean(m?.isMine);
              const text = asText(m?.body);
              const time = formatTime(m?.createdAt, locale);
              const key = asText(m?.id) || `k_${idx}`;
              const status = mine ? (m?.readAt ? t("read") : t("sent")) : "";

              return (
                <div key={key} className={mine ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      "max-w-[85%] rounded-2xl border px-3 py-2 text-sm leading-6 shadow-[var(--shadow-card)] " +
                      (mine
                        ? "border-cyan-300/30 bg-linear-to-r from-cyan-300/20 to-blue-500/15 text-white"
                        : "border-white/10 bg-slate-950/30 text-slate-100")
                    }
                  >
                    <div className="whitespace-pre-wrap wrap-break-word">{text}</div>
                    <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-slate-300/80">
                      <span>{time}</span>
                      {status ? <span>{status}</span> : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-slate-300">{t("emptyState")}</div>
        )}
      </div>

      {nextCursor ? (
        <button
          type="button"
          onClick={() => loadMessages({ cursor: nextCursor, append: true })}
          disabled={loadingMore}
          className="mt-3 inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
        >
          {loadingMore ? t("loadingMore") : t("loadOlder")}
        </button>
      ) : null}

      <div className="mt-3 grid gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("placeholder")}
          rows={3}
          className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
        />

        <button
          type="button"
          onClick={send}
          disabled={sending || !asText(draft)}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-linear-to-r from-cyan-300 to-blue-500 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50 disabled:opacity-60"
        >
          {sending ? t("sending") : t("send")}
        </button>
      </div>
    </div>
  );
}
