"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, ChevronLeft, Lock, Mic } from "lucide-react";
import { useLocale } from "next-intl";

import { TECHNIQUE_CATEGORIES, TECHNIQUES } from "@/data/wiki";
import { trackView } from "@/lib/analytics";
import { readProfile } from "@/lib/profile";

function matches(text, q) {
  const t = String(text || "").toLowerCase();
  const query = String(q || "").toLowerCase().trim();
  if (!query) return true;
  return t.includes(query);
}

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      difficultyText: {
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
        unknown: "-",
      },
      aiPromptMissing: (q) =>
        `I couldn't find technique "${q}" in the library. Could it be listed under another name? Suggest similar techniques and safe practice guidance.`,
      aiPromptGeneral:
        "I'm browsing the technique library but can't find a suitable item. Suggest a few beginner-friendly Vovinam techniques to practice at home with safety notes.",
      voiceUnsupported: "Your browser does not support voice search.",
      voiceNoInput: "No voice input detected. Please try again.",
      speechLang: "en-US",
      freeLabel: "Free",
      freeDesc: "Blue-belt fundamentals are free. Yellow/Red belt techniques are locked and require Premium.",
      unlockPremium: "Unlock Premium",
      searchLabel: "Search",
      searchPlaceholder: "Example: kick, stance, release, counter...",
      stopVoiceSearch: "Stop voice search",
      startVoiceSearch: "Start voice search",
      categoryLabel: "Technique group",
      all: "All",
      difficultyLabel: "Difficulty",
      foundCount: (count) =>
        `Found ${count} ${count === 1 ? "technique" : "techniques"}.`,
      resetFilters: "Reset filters",
      focusedNow: "Focused",
      focusedAll: "View all results",
      emptyState:
        "Could not find that technique. Check spelling or ask AI Coach for similar options.",
      askAiCoach: "Ask AI Coach",
      techniqueFallback: "Technique",
      difficultyPrefix: "Difficulty",
      premiumTag: "Premium",
      premiumHint: "Unlock Premium for detailed steps, common mistakes, and safety notes.",
      unlock: "Unlock",
      steps: "Steps",
      commonMistakes: "Common mistakes",
      safety: "Safety",
    };
  }

  if (id === "ja") {
    return {
      difficultyText: {
        easy: "やさしい",
        medium: "ふつう",
        hard: "難しい",
        unknown: "-",
      },
      aiPromptMissing: (q) =>
        `ライブラリで「${q}」という技術が見つかりませんでした。別名の可能性はありますか？近い技術と安全な練習方法を提案してください。`,
      aiPromptGeneral:
        "技術ライブラリを見ていますが、合う項目が見つかりません。自宅で練習しやすいVovinamの基本技術を安全上の注意付きで提案してください。",
      voiceUnsupported: "このブラウザは音声検索に対応していません。",
      voiceNoInput: "音声を認識できませんでした。もう一度お試しください。",
      speechLang: "ja-JP",
      freeLabel: "無料",
      freeDesc: "青帯の基礎は無料。黄帯/紅帯の技術はプレミアムで利用できます。",
      unlockPremium: "プレミアムを解除",
      searchLabel: "検索",
      searchPlaceholder: "例: 蹴り、立ち方、外し、反撃...",
      stopVoiceSearch: "音声検索を停止",
      startVoiceSearch: "音声検索を開始",
      categoryLabel: "技術カテゴリ",
      all: "すべて",
      difficultyLabel: "難易度",
      foundCount: (count) => `${count} 件の技術が見つかりました。`,
      resetFilters: "フィルターをリセット",
      focusedNow: "フォーカス中",
      focusedAll: "すべての結果を見る",
      emptyState:
        "この技術は見つかりませんでした。表記を確認するか、AI Coach に相談してください。",
      askAiCoach: "AI Coach に質問",
      techniqueFallback: "技術",
      difficultyPrefix: "難易度",
      premiumTag: "プレミアム",
      premiumHint: "プレミアムで詳細手順、よくあるミス、安全注意を確認できます。",
      unlock: "解除",
      steps: "手順",
      commonMistakes: "よくあるミス",
      safety: "安全",
    };
  }

  return {
    difficultyText: {
      easy: "Dễ",
      medium: "Vừa",
      hard: "Khó",
      unknown: "-",
    },
    aiPromptMissing: (q) =>
      `Mình tìm không thấy kỹ thuật "${q}" trong thư viện. Kỹ thuật này có thể còn tên gọi khác không? Hãy gợi ý kỹ thuật tương tự và hướng dẫn cách tập an toàn.`,
    aiPromptGeneral:
      "Mình đang xem thư viện kỹ thuật nhưng chưa thấy mục phù hợp. Hãy gợi ý vài kỹ thuật Vovinam dễ tập tại nhà, kèm lưu ý an toàn.",
    voiceUnsupported: "Trình duyệt chưa hỗ trợ tìm kiếm bằng giọng nói.",
    voiceNoInput: "Không nhận được giọng nói. Thử lại nhé.",
    speechLang: "vi-VN",
    freeLabel: "Free",
    freeDesc: "Hệ Lam đai mở miễn phí. Kỹ thuật Hoàng/Hồng đai sẽ khóa và cần Premium.",
    unlockPremium: "Mở khóa Premium",
    searchLabel: "Tìm kiếm",
    searchPlaceholder: "Ví dụ: đá, tấn, khóa gỡ, phản đòn...",
    stopVoiceSearch: "Dừng tìm bằng giọng nói",
    startVoiceSearch: "Tìm bằng giọng nói",
    categoryLabel: "Nhóm kỹ thuật",
    all: "Tất cả",
    difficultyLabel: "Độ khó",
    foundCount: (count) => `Tìm thấy ${count} kỹ thuật.`,
    resetFilters: "Reset lọc",
    focusedNow: "Đang tập trung",
    focusedAll: "Xem toàn bộ kết quả",
    emptyState:
      "Sư phụ chưa tìm thấy kỹ thuật này, bạn thử kiểm tra lại chính tả hoặc hỏi AI Coach nhé!",
    askAiCoach: "Hỏi AI Coach",
    techniqueFallback: "Kỹ thuật",
    difficultyPrefix: "Độ khó",
    premiumTag: "Premium",
    premiumHint: "Mở Premium để xem chi tiết các bước, lỗi thường gặp và an toàn.",
    unlock: "Mở khóa",
    steps: "Các bước",
    commonMistakes: "Lỗi thường gặp",
    safety: "An toàn",
  };
}

function difficultyLabel(d, copy) {
  if (d === "easy") return copy.difficultyText.easy;
  if (d === "medium") return copy.difficultyText.medium;
  if (d === "hard") return copy.difficultyText.hard;
  return copy.difficultyText.unknown;
}

export default function TechniqueLibrary() {
  const locale = useLocale();
  const copy = useMemo(() => getCopy(locale), [locale]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [focusedSlug, setFocusedSlug] = useState("");
  const [planId, setPlanId] = useState("free");

  const [voiceNotice, setVoiceNotice] = useState("");
  const [listening, setListening] = useState(false);
  const voiceRef = useRef(null);

  const isPremium = planId === "premium";

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
    const t = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      window.clearTimeout(t);
    };
  }, [query]);

  useEffect(() => {
    return () => {
      const rec = voiceRef.current;
      if (!rec) return;
      try {
        rec.abort?.();
      } catch {
        // ignore
      }
      try {
        rec.stop?.();
      } catch {
        // ignore
      }
      voiceRef.current = null;
    };
  }, []);

  const onAskAi = () => {
    const q = String(query || "").trim();
    const prompt = q ? copy.aiPromptMissing(q) : copy.aiPromptGeneral;

    window.dispatchEvent(
      new CustomEvent("vovinam-ai-ask", {
        detail: {
          query: prompt,
          context: {
            kind: "wiki",
            userQuery: q || null,
            categoryId,
            difficulty,
          },
        },
      })
    );
  };

  const filtered = useMemo(() => {
    return TECHNIQUES.filter((t) => {
      if (categoryId !== "all" && t.categoryId !== categoryId) return false;
      if (difficulty !== "all" && t.difficulty !== difficulty) return false;

      const hay = [t.title, t.summary, ...(t.tags || [])].join(" ");
      return matches(hay, debouncedQuery);
    });
  }, [debouncedQuery, categoryId, difficulty]);

  const focusedTechnique = useMemo(() => {
    if (!focusedSlug) return null;
    return filtered.find((item) => item.slug === focusedSlug) || null;
  }, [filtered, focusedSlug]);

  const visibleTechniques = useMemo(() => {
    if (!focusedTechnique) return filtered;
    return [focusedTechnique];
  }, [filtered, focusedTechnique]);

  const onReset = () => {
    setQuery("");
    setDebouncedQuery("");
    setCategoryId("all");
    setDifficulty("all");
    setFocusedSlug("");
  };

  const onVoiceSearch = () => {
    setVoiceNotice("");

    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceNotice(copy.voiceUnsupported);
      return;
    }

    if (listening) {
      try {
        voiceRef.current?.stop?.();
      } catch {
        // ignore
      }
      return;
    }

    const rec = new SpeechRecognition();
    voiceRef.current = rec;
    rec.lang = copy.speechLang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      const transcript = String(event?.results?.[0]?.[0]?.transcript || "").trim();
      if (!transcript) return;
      setFocusedSlug("");
      setQuery(transcript);
      setDebouncedQuery(transcript);
    };

    rec.onerror = () => {
      setVoiceNotice(copy.voiceNoInput);
    };

    rec.onend = () => {
      setListening(false);
      voiceRef.current = null;
    };

    try {
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
      voiceRef.current = null;
    }
  };

  return (
    <div className="grid gap-4">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)] fade-in-up">
        {!isPremium ? (
          <div className="mb-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <div className="text-sm font-semibold text-white">{copy.freeLabel}</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              {copy.freeDesc}
            </p>
            <div className="mt-3">
              <Link
                href="/ho-so#goi-premium"
                className="inline-flex h-10 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                {copy.unlockPremium}
              </Link>
            </div>
          </div>
        ) : null}

        <div className="grid gap-3 lg:grid-cols-4">
          <label className="block lg:col-span-2">
            <div className="text-xs font-semibold text-slate-200">{copy.searchLabel}</div>
            <div className="mt-2 flex gap-2">
              <input
                value={query}
                onChange={(e) => {
                  setFocusedSlug("");
                  setQuery(e.target.value);
                }}
                placeholder={copy.searchPlaceholder}
                className="h-11 w-full flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none focus:ring-2 focus:ring-blue-400/30"
              />

              <button
                type="button"
                onClick={onVoiceSearch}
                className={
                  "inline-flex h-11 w-11 items-center justify-center rounded-2xl border text-slate-200 transition focus:outline-none focus:ring-2 " +
                  (listening
                    ? "border-blue-400/30 bg-blue-500/15 text-blue-100 hover:bg-blue-500/20 focus:ring-blue-400/40"
                    : "border-white/10 bg-white/5 hover:bg-white/10 hover:text-white focus:ring-blue-400/30")
                }
                aria-label={listening ? copy.stopVoiceSearch : copy.startVoiceSearch}
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>

            {voiceNotice ? (
              <div className="mt-2 text-xs text-slate-300">{voiceNotice}</div>
            ) : null}
          </label>

          <label className="block">
            <div className="text-xs font-semibold text-slate-200">{copy.categoryLabel}</div>
            <select
              value={categoryId}
              onChange={(e) => {
                setFocusedSlug("");
                setCategoryId(e.target.value);
              }}
              className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-400/30"
            >
              <option value="all">{copy.all}</option>
              {TECHNIQUE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="text-xs font-semibold text-slate-200">{copy.difficultyLabel}</div>
            <select
              value={difficulty}
              onChange={(e) => {
                setFocusedSlug("");
                setDifficulty(e.target.value);
              }}
              className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-400/30"
            >
              <option value="all">{copy.all}</option>
              <option value="easy">{copy.difficultyText.easy}</option>
              <option value="medium">{copy.difficultyText.medium}</option>
              <option value="hard">{copy.difficultyText.hard}</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-300">
            {copy.foundCount(filtered.length)}
          </p>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            {copy.resetFilters}
          </button>
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-2 stagger-fade">
        {focusedTechnique ? (
          <section className="lg:col-span-2 rounded-3xl border border-blue-400/30 bg-blue-500/10 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-blue-100">{copy.focusedNow}</p>
                <p className="mt-1 text-sm font-semibold text-white">{focusedTechnique.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setFocusedSlug("")}
                className="inline-flex h-10 items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              >
                <ChevronLeft className="h-4 w-4" />
                {copy.focusedAll}
              </button>
            </div>
          </section>
        ) : null}

        {visibleTechniques.length === 0 ? (
          <section className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)]">
            <p className="text-sm leading-6 text-slate-300">
              {copy.emptyState}
            </p>

            <div className="mt-4">
              <button
                type="button"
                onClick={onAskAi}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                {copy.askAiCoach}
              </button>
            </div>
          </section>
        ) : null}

        {visibleTechniques.map((t) => {
          const cat = TECHNIQUE_CATEGORIES.find((c) => c.id === t.categoryId);
          const isLocked = (t.difficulty === "medium" || t.difficulty === "hard") && !isPremium;

          if (isLocked) {
            return (
              <div
                key={t.slug}
                className="group rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-white">
                      {t.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      {t.summary}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200">
                        {cat?.title || copy.techniqueFallback}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
                        {copy.difficultyPrefix}: {difficultyLabel(t.difficulty, copy)}
                      </span>
                      <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-blue-100">
                        {copy.premiumTag}
                      </span>
                    </div>
                  </div>

                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-blue-400/10 to-blue-600/5 text-blue-100">
                    <Lock className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-slate-400">
                    {copy.premiumHint}
                  </p>
                  <Link
                    href="/ho-so#goi-premium"
                    className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  >
                    {copy.unlock}
                  </Link>
                </div>
              </div>
            );
          }

          return (
            <details
              key={t.slug}
              open={focusedSlug === t.slug}
              id={t.slug}
              className="group rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[var(--shadow-card)] transition will-change-transform hover:bg-white/10 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[var(--shadow-card-strong)] hover:border-blue-400/35 open:bg-white/10 open:border-blue-400/30"
              onToggle={(e) => {
                if (e.currentTarget.open) {
                  setFocusedSlug(t.slug);
                  trackView({ type: "technique", id: t.slug });
                  return;
                }

                if (focusedSlug === t.slug) {
                  setFocusedSlug("");
                }
              }}
            >
              <summary className="cursor-pointer list-none">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-white">
                      {t.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      {t.summary}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200">
                        {cat?.title || copy.techniqueFallback}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
                        {copy.difficultyPrefix}: {difficultyLabel(t.difficulty, copy)}
                      </span>
                      {(t.tags || []).slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-blue-400/15 to-blue-600/10 text-blue-100">
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>
              </summary>

              <div className="mt-4 grid gap-3">
                <section className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <div className="text-xs font-semibold text-slate-300">{copy.steps}</div>
                  <ol className="mt-2 grid gap-2 text-sm leading-6 text-slate-300">
                    {t.steps.map((s, idx) => (
                      <li key={s} className="flex gap-3">
                        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xs font-semibold text-white">
                          {idx + 1}
                        </span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </section>

                <div className="grid gap-3 sm:grid-cols-2">
                  <section className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <div className="text-xs font-semibold text-slate-300">{copy.commonMistakes}</div>
                    <ul className="mt-2 grid gap-2 text-sm leading-6 text-slate-300">
                      {t.mistakes.map((m) => (
                        <li key={m} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300/80" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <div className="text-xs font-semibold text-slate-300">{copy.safety}</div>
                    <ul className="mt-2 grid gap-2 text-sm leading-6 text-slate-300">
                      {t.safety.map((m) => (
                        <li key={m} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300/80" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
