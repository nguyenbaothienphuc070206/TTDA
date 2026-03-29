"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { fetchCommunityConversations } from "@/lib/community/messagesApi";

function asText(value) {
  return String(value || "").trim();
}

function initialFromName(name) {
  const safe = asText(name);
  if (!safe) return "V";
  return safe.slice(0, 1).toUpperCase();
}

function formatDateTime(isoText, locale) {
  const value = asText(isoText);
  if (!value) return "";

  const ts = Date.parse(value);
  if (!Number.isFinite(ts)) return "";

  return new Date(ts).toLocaleString(locale || "vi-VN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommunityInbox() {
  const t = useTranslations("community.inbox");
  const locale = useLocale();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchCommunityConversations({ limit: 50 });
      setItems(Array.isArray(data?.conversations) ? data.conversations : []);
    } catch (e) {
      setError(asText(e?.message) || t("genericError"));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 shadow-[var(--shadow-card)]">
        {t("loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-400/25 bg-rose-500/10 p-6 text-sm text-rose-100">
        <div>{error}</div>
        <button
          type="button"
          onClick={load}
          className="mt-3 inline-flex h-9 items-center justify-center rounded-2xl border border-rose-200/30 bg-rose-300/10 px-4 text-xs font-semibold text-rose-50 transition hover:bg-rose-300/20"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 shadow-[var(--shadow-card)]">
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[var(--shadow-card-strong)] sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-white">{t("title")}</h1>
        <button
          type="button"
          onClick={load}
          className="inline-flex h-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white transition hover:bg-white/10"
        >
          {t("refresh")}
        </button>
      </div>

      <div className="grid gap-2">
        {items.map((item) => {
          const partnerId = asText(item?.partnerId);
          const partnerName = asText(item?.partnerName) || t("fallbackName");
          const unreadCount = Math.max(0, Number(item?.unreadCount) || 0);
          const lastFromMe = Boolean(item?.lastFromMe);
          const preview = asText(item?.lastMessage);
          const when = formatDateTime(item?.lastMessageAt, locale);
          const avatarUrl = asText(item?.avatarUrl);

          return (
            <Link
              key={partnerId}
              href={`/cong-dong/chat?to=${encodeURIComponent(partnerId)}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/30 p-3 transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-slate-950/20"
            >
              <div className="flex min-w-0 items-center gap-3">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-10 w-10 rounded-2xl border border-white/10 object-cover"
                  />
                ) : (
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/30 text-sm font-extrabold text-cyan-200">
                    {initialFromName(partnerName)}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{partnerName}</div>
                  <div className="truncate text-xs text-slate-300">
                    {lastFromMe ? `${t("youPrefix")} ${preview}` : preview}
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-[11px] text-slate-300">{when}</div>
                {unreadCount > 0 ? (
                  <div className="mt-1 inline-flex min-w-6 items-center justify-center rounded-full bg-rose-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
                    {unreadCount}
                  </div>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
