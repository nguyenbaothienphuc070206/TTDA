"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";

import { LESSONS, LEVELS, getLessonsByLevel } from "@/data/lessons";
import { readJson, writeJson } from "@/lib/storage";

const SCHEDULE_KEY = "vovinam_schedule_v1";

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      title: "Build a 7-day training plan",
      description:
        "Pick your target, sessions per week, and duration. The app suggests suitable lessons to keep training consistent.",
      generate: "Generate",
      clear: "Clear",
      goal: "Goal",
      sessionsPerWeek: "Sessions per week",
      sessionOption: (n) => `${n} sessions`,
      sessionsHint: "Suggestion: 3 sessions for beginners; 4-5 sessions if you already train consistently.",
      durationPerSession: "Duration per session",
      minuteOption: (n) => `${n} min`,
      durationHint: "Remember to warm up 5-7 min and stretch 3-5 min.",
      trainBadge: (minutes) => `Train ${minutes}'`,
      restBadge: "Rest",
      restText: "Light stretching, walking, and steady breathing",
      tip: "Tip: If you are too tired on a day, switch \"Train\" to \"Rest\" and make up on another day.",
    };
  }

  if (id === "ja") {
    return {
      days: ["月", "火", "水", "木", "金", "土", "日"],
      title: "7日間の練習計画を作成",
      description: "目標、週の回数、時間を選ぶと、継続しやすいレッスンを提案します。",
      generate: "計画を作成",
      clear: "クリア",
      goal: "目標",
      sessionsPerWeek: "週の練習回数",
      sessionOption: (n) => `${n}回`,
      sessionsHint: "目安: 初心者は週3回、慣れたら週4-5回。",
      durationPerSession: "1回の時間",
      minuteOption: (n) => `${n}分`,
      durationHint: "ウォームアップ5-7分、クールダウン3-5分を目安に。",
      trainBadge: (minutes) => `${minutes}分 練習`,
      restBadge: "休み",
      restText: "軽いストレッチ、散歩、呼吸を整える",
      tip: "ヒント: 疲れが強い日は\"練習\"を\"休み\"に切り替え、別日に調整しましょう。",
    };
  }

  return {
    days: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
    title: "Tạo lịch tập 7 ngày",
    description:
      "Chọn mục tiêu, số buổi/tuần và thời lượng. App sẽ gợi ý bài học phù hợp để bạn luyện đều.",
    generate: "Tạo lịch",
    clear: "Xóa",
    goal: "Mục tiêu",
    sessionsPerWeek: "Số buổi/tuần",
    sessionOption: (n) => `${n} buổi`,
    sessionsHint: "Gợi ý: 3 buổi nếu mới tập; 4-5 buổi nếu đã quen.",
    durationPerSession: "Thời lượng/buổi",
    minuteOption: (n) => `${n} phút`,
    durationHint: "Nhớ khởi động 5-7 phút và giãn cơ 3-5 phút.",
    trainBadge: (minutes) => `Tập ${minutes}'`,
    restBadge: "Nghỉ",
    restText: "Giãn cơ nhẹ, đi bộ, thở đều",
    tip: "Mẹo: Nếu hôm nào quá mệt, hãy đổi \"Tập\" thành \"Nghỉ\", rồi bù vào ngày khác.",
  };
}

const DEFAULT_LEVEL_ID = LEVELS[0]?.id || "";

const PATTERN_BY_SESSIONS = {
  3: [0, 2, 4],
  4: [0, 1, 3, 5],
  5: [0, 1, 3, 4, 6],
  6: [0, 1, 2, 3, 4, 5],
};

function buildSchedule({ levelId, sessionsPerWeek, minutes, days }) {
  const activeIndexes = PATTERN_BY_SESSIONS[sessionsPerWeek] || PATTERN_BY_SESSIONS[3];
  const levelLessons = getLessonsByLevel(levelId);
  const pool = levelLessons.length > 0 ? levelLessons : LESSONS;

  let lessonIndex = 0;

  return days.map((day, dayIndex) => {
    if (!activeIndexes.includes(dayIndex)) {
      return { day, type: "nghi" };
    }

    const lesson = pool[lessonIndex % pool.length];
    lessonIndex += 1;

    return {
      day,
      type: "tap",
      minutes,
      slug: lesson.slug,
      title: lesson.title,
    };
  });
}

export default function ScheduleBuilder() {
  const locale = useLocale();
  const copy = useMemo(() => getCopy(locale), [locale]);
  const days = copy.days;
  const [levelId, setLevelId] = useState(DEFAULT_LEVEL_ID);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
  const [minutes, setMinutes] = useState(30);
  const [schedule, setSchedule] = useState([]);

  const level = useMemo(
    () => LEVELS.find((l) => l.id === levelId) || LEVELS[0],
    [levelId]
  );

  useEffect(() => {
    const sync = () => {
      const saved = readJson(SCHEDULE_KEY, []);
      if (Array.isArray(saved) && saved.length === days.length) {
        setSchedule(saved);
      } else {
        setSchedule([]);
      }
    };

    sync();
    window.addEventListener("vovinam-schedule", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vovinam-schedule", sync);
      window.removeEventListener("storage", sync);
    };
  }, [days.length]);

  const onGenerate = () => {
    const next = buildSchedule({ levelId, sessionsPerWeek, minutes, days });
    setSchedule(next);
    writeJson(SCHEDULE_KEY, next);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("vovinam-schedule"));
    }
  };

  const onClear = () => {
    setSchedule([]);
    writeJson(SCHEDULE_KEY, []);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("vovinam-schedule"));
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-white">{copy.title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-300">
            {copy.description}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onGenerate}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
          >
            {copy.generate}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            {copy.clear}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <label className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="text-xs font-semibold text-slate-200">{copy.goal}</div>
          <select
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            {LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title} ({l.short})
              </option>
            ))}
          </select>
          <div className="mt-2 text-xs text-slate-300">{level.description}</div>
        </label>

        <label className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="text-xs font-semibold text-slate-200">{copy.sessionsPerWeek}</div>
          <select
            value={sessionsPerWeek}
            onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            {[3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {copy.sessionOption(n)}
              </option>
            ))}
          </select>
          <div className="mt-2 text-xs text-slate-300">
            {copy.sessionsHint}
          </div>
        </label>

        <label className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="text-xs font-semibold text-slate-200">{copy.durationPerSession}</div>
          <select
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            {[15, 20, 30, 45, 60].map((n) => (
              <option key={n} value={n}>
                {copy.minuteOption(n)}
              </option>
            ))}
          </select>
          <div className="mt-2 text-xs text-slate-300">
            {copy.durationHint}
          </div>
        </label>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 overflow-hidden">
        <div className="grid grid-cols-1">
          {days.map((day, idx) => {
            const item = schedule[idx];

            return (
              <div
                key={day}
                className="flex flex-col gap-2 border-t border-white/10 bg-slate-950/30 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center justify-between gap-3 sm:justify-start">
                  <div className="text-sm font-semibold text-white">{day}</div>
                  {item?.type === "tap" ? (
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                      {copy.trainBadge(item.minutes)}
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">
                      {copy.restBadge}
                    </span>
                  )}
                </div>

                <div className="text-sm text-slate-300">
                  {item?.type === "tap" ? (
                    <Link
                      href={`/bai-hoc/${item.slug}`}
                      className="underline decoration-white/20 underline-offset-4 hover:text-white"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <span>{copy.restText}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-xs leading-5 text-slate-300">
        {copy.tip}
      </div>
    </div>
  );
}

