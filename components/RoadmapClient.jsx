"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";

import { BELTS } from "@/data/belts";
import { getLessonsByBeltId } from "@/data/lessons";
import { readDoneSlugs, toggleLessonDone } from "@/lib/progress";
import { readProfile } from "@/lib/profile";

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      heading: "Training Roadmap",
      description: "Progress step by step, from fundamentals to advanced.",
      progressLabel: "completed",
      progressHint: "Start small. Stay consistent.",
      todayTitle: "Suggested today",
      duration: "Duration",
      note: "Train slowly. Keep alignment and rhythm before speed.",
      start: "Start",
      markDone: "Mark complete",
      askAi: "Ask AI",
      nextLevel: "Next level",
      lockNote: "Unlock after finishing your current level.",
    };
  }

  if (id === "ja") {
    return {
      heading: "トレーニングロードマップ",
      description: "基礎から上級まで、段階的に進みます。",
      progressLabel: "完了",
      progressHint: "小さく始めて、継続しましょう。",
      todayTitle: "今日の提案",
      duration: "時間",
      note: "ゆっくり練習し、速度より軸とリズムを優先。",
      start: "開始",
      markDone: "完了を記録",
      askAi: "AIに相談",
      nextLevel: "次のレベル",
      lockNote: "現在レベル完了後に解放されます。",
    };
  }

  return {
    heading: "Lộ trình luyện tập",
    description: "Tiến bộ theo từng bước, từ nền tảng đến nâng cao.",
    progressLabel: "bài đã hoàn thành",
    progressHint: "Bắt đầu nhỏ. Duy trì đều.",
    todayTitle: "Gợi ý hôm nay",
    duration: "Thời lượng",
    note: "Tập chậm, giữ trục và nhịp trước khi tăng tốc.",
    start: "Bắt đầu",
    markDone: "Đánh dấu hoàn thành",
    askAi: "Hỏi AI",
    nextLevel: "Level tiếp theo",
    lockNote: "Mở khóa sau khi hoàn thành cấp hiện tại.",
  };
}

function getLessonDisplayTitle(lesson) {
  const slug = String(lesson?.slug || "");
  if (slug.endsWith("-quyen")) return "Quyền cơ bản";
  return String(lesson?.title || "Bài cơ bản");
}

export default function RoadmapClient() {
  const locale = useLocale();
  const copy = getCopy(locale);

  const [doneSlugs, setDoneSlugs] = useState([]);
  const [beltId, setBeltId] = useState(BELTS[0]?.id || "");

  useEffect(() => {
    const sync = () => {
      const done = readDoneSlugs();
      setDoneSlugs(Array.isArray(done) ? done : []);

      const profile = readProfile();
      const profileBeltId = String(profile?.beltId || "").trim();
      if (profileBeltId && BELTS.some((b) => b.id === profileBeltId)) {
        setBeltId(profileBeltId);
      }
    };

    sync();
    window.addEventListener("vovinam-progress", sync);
    window.addEventListener("vovinam-profile", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("vovinam-progress", sync);
      window.removeEventListener("vovinam-profile", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const doneSet = useMemo(() => new Set(doneSlugs), [doneSlugs]);

  const blocks = useMemo(() => {
    return BELTS.map((belt) => {
      const lessons = getLessonsByBeltId(belt.id);
      const done = lessons.filter((l) => doneSet.has(l.slug)).length;
      const next = lessons.find((l) => !doneSet.has(l.slug)) || lessons[0] || null;
      return {
        belt,
        lessons,
        done,
        total: lessons.length,
        next,
      };
    });
  }, [doneSet]);

  const currentIndex = useMemo(() => {
    const idxByProfile = BELTS.findIndex((b) => b.id === beltId);
    if (idxByProfile >= 0) return idxByProfile;
    const firstUnfinished = blocks.findIndex((x) => x.done < x.total);
    return firstUnfinished >= 0 ? firstUnfinished : 0;
  }, [blocks, beltId]);

  const current = blocks[currentIndex] || blocks[0] || null;
  const nextLevel = blocks[currentIndex + 1] || null;

  const totalLessons = useMemo(() => blocks.reduce((sum, b) => sum + b.total, 0), [blocks]);
  const totalDone = useMemo(() => blocks.reduce((sum, b) => sum + b.done, 0), [blocks]);

  const onToggleDone = () => {
    const slug = String(current?.next?.slug || "");
    if (!slug) return;
    const next = toggleLessonDone(slug);
    setDoneSlugs(Array.isArray(next) ? next : []);
  };

  const onAskAi = () => {
    if (typeof window === "undefined") return;

    const beltTitle = String(current?.belt?.title || "Lam đai tự vệ");
    const lessonTitle = String(current?.next?.title || "Quyền cơ bản");

    try {
      window.dispatchEvent(
        new CustomEvent("vovinam-ai-ask", {
          detail: {
            query: `Tôi đang ở ${beltTitle}. Hãy hướng dẫn buổi tập hôm nay theo bài ${lessonTitle}, tập trung kỹ thuật đúng và an toàn.`,
            context: { kind: "roadmap" },
          },
        })
      );
    } catch {
      // ignore
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)]">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{copy.heading}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{copy.description}</p>

        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          <div className="text-sm font-semibold text-white">
            {totalDone} / {totalLessons} {copy.progressLabel}
          </div>
          <p className="mt-1 text-sm text-slate-300">{copy.progressHint}</p>
        </div>
      </header>

      {current ? (
        <section className="mt-6 rounded-3xl border border-cyan-300/25 bg-cyan-300/10 p-6 shadow-[var(--shadow-card)]">
          <div className="text-xs font-semibold uppercase tracking-wide text-cyan-100">{copy.todayTitle}</div>
          <h2 className="mt-1 text-xl font-semibold text-white">{current.belt.title}</h2>
          <p className="mt-1 text-sm text-slate-200">Bài: {getLessonDisplayTitle(current.next)}</p>
          <p className="mt-1 text-sm text-slate-200">{copy.duration}: {current.next?.minutes || 18} phút</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{copy.note}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/bai-hoc/${current.next?.slug || "lam-dai-tu-ve-quyen"}`}
              className="cta-primary inline-flex h-10 items-center justify-center rounded-2xl px-4 text-sm font-semibold"
            >
              {copy.start}
            </Link>
            <button
              type="button"
              onClick={onToggleDone}
              className="cta-secondary inline-flex h-10 items-center justify-center rounded-2xl px-4 text-sm font-semibold text-white"
            >
              {copy.markDone}
            </button>
            <button
              type="button"
              onClick={onAskAi}
              className="cta-secondary inline-flex h-10 items-center justify-center rounded-2xl px-4 text-sm font-semibold text-white"
            >
              {copy.askAi}
            </button>
          </div>
        </section>
      ) : null}

      {nextLevel ? (
        <section className="mt-4 rounded-3xl border border-white/10 bg-slate-950/30 p-5 opacity-75">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-300">{copy.nextLevel}</div>
          <h3 className="mt-1 text-lg font-semibold text-white">{nextLevel.belt.title}</h3>
          <p className="mt-1 text-sm text-slate-300">{copy.lockNote}</p>
        </section>
      ) : null}
    </div>
  );
}
