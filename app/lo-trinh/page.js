import Link from "next/link";

import LessonCard from "@/components/LessonCard";
import { LEVELS, getLessonsByLevel } from "@/data/lessons";

export const metadata = {
  title: "Lộ trình",
};

export default function RoadmapPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Lộ trình luyện Vovinam
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Chọn bài theo cấp độ. Bạn có thể bấm “Đánh dấu hoàn thành” để lưu
              tiến độ (tự lưu trên máy).
            </p>
          </div>
          <Link
            href="/lich-tap"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            Tạo lịch tập 7 ngày
          </Link>
        </div>
      </header>

      <div className="mt-8 space-y-10">
        {LEVELS.map((level) => {
          const lessons = getLessonsByLevel(level.id);

          return (
            <section
              key={level.id}
              id={level.id}
              className="space-y-4 scroll-mt-28"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {level.title}
                    <span className="ml-2 text-sm font-semibold text-slate-400">
                      ({level.short})
                    </span>
                  </h2>
                  <p className="mt-1 text-sm text-slate-300">{level.description}</p>
                </div>

                <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                  {lessons.length} bài
                </span>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                {lessons.map((lesson) => (
                  <LessonCard key={lesson.slug} lesson={lesson} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
