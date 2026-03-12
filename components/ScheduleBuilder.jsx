"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { LEVELS, getLessonsByLevel } from "@/data/lessons";
import { readJson, writeJson } from "@/lib/storage";

const SCHEDULE_KEY = "vovinam_schedule_v1";

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

const PATTERN_BY_SESSIONS = {
  3: [0, 2, 4],
  4: [0, 1, 3, 5],
  5: [0, 1, 3, 4, 6],
  6: [0, 1, 2, 3, 4, 5],
};

function buildSchedule({ levelId, sessionsPerWeek, minutes }) {
  const activeIndexes = PATTERN_BY_SESSIONS[sessionsPerWeek] || PATTERN_BY_SESSIONS[3];
  const levelLessons = getLessonsByLevel(levelId);

  let lessonIndex = 0;

  return DAYS.map((day, dayIndex) => {
    if (!activeIndexes.includes(dayIndex)) {
      return { day, type: "nghi" };
    }

    const lesson = levelLessons[lessonIndex % levelLessons.length];
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
  const [levelId, setLevelId] = useState("co-ban");
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
      if (Array.isArray(saved) && saved.length === 7) {
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
  }, []);

  const onGenerate = () => {
    const next = buildSchedule({ levelId, sessionsPerWeek, minutes });
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
          <h2 className="text-xl font-semibold text-white">Tạo lịch tập 7 ngày</h2>
          <p className="mt-1 text-sm leading-6 text-slate-300">
            Chọn mục tiêu, số buổi/tuần và thời lượng. App sẽ gợi ý bài học phù hợp để bạn luyện đều.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onGenerate}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
          >
            Tạo lịch
          </button>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            Xóa
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <label className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="text-xs font-semibold text-slate-200">Mục tiêu</div>
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
          <div className="text-xs font-semibold text-slate-200">Số buổi/tuần</div>
          <select
            value={sessionsPerWeek}
            onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            {[3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} buổi
              </option>
            ))}
          </select>
          <div className="mt-2 text-xs text-slate-300">
            Gợi ý: 3 buổi nếu mới tập • 4–5 buổi nếu đã quen
          </div>
        </label>

        <label className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="text-xs font-semibold text-slate-200">Thời lượng/buổi</div>
          <select
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            {[15, 20, 30, 45, 60].map((n) => (
              <option key={n} value={n}>
                {n} phút
              </option>
            ))}
          </select>
          <div className="mt-2 text-xs text-slate-300">
            Nhớ khởi động 5–7 phút và giãn cơ 3–5 phút.
          </div>
        </label>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 overflow-hidden">
        <div className="grid grid-cols-1">
          {DAYS.map((day, idx) => {
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
                      Tập {item.minutes}′
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">
                      Nghỉ
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
                    <span>Giãn cơ nhẹ, đi bộ, thở đều</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-xs leading-5 text-slate-300">
        Mẹo: Nếu hôm nào quá mệt, hãy đổi “Tập” thành “Nghỉ”, rồi bù vào ngày khác.
      </div>
    </div>
  );
}
