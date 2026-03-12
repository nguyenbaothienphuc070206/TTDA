import Link from "next/link";

import { LEVELS, LESSONS, getLessonsByLevel } from "@/data/lessons";

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold text-slate-300">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
        {value}
      </div>
    </div>
  );
}

function LevelPreview({ level }) {
  const lessons = getLessonsByLevel(level.id);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10">
      <div className="absolute inset-0 opacity-0 transition-opacity hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_55%)]" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">{level.title}</h3>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">
            {lessons.length} bài
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {level.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {lessons.slice(0, 2).map((l) => (
            <span
              key={l.slug}
              className="rounded-full border border-white/10 bg-slate-950/40 px-2.5 py-1 text-xs text-slate-200"
            >
              {l.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-16">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/5 p-7 sm:p-12">
        <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_55%)]" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
            Lộ trình rõ ràng • Từng bước dễ tập • Lưu tiến độ
          </p>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Học Vovinam từ cơ bản đến nâng cao
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Mỗi bài có mục tiêu, hướng dẫn từng bước, lỗi thường gặp và gợi ý tự
            luyện. Bạn có thể đánh dấu hoàn thành để theo dõi tiến độ.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/lo-trinh"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
            >
              Bắt đầu học
            </Link>
            <Link
              href="/lich-tap"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
            >
              Tạo lịch tập 7 ngày
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Stat label="Tổng bài học" value={LESSONS.length} />
            <Stat label="Cấp độ" value={LEVELS.length} />
            <Stat label="Mục tiêu" value="Đúng kỹ thuật" />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Lộ trình theo cấp độ</h2>
            <p className="mt-1 text-sm text-slate-300">
              Bắt đầu từ “Cơ bản”, khi ổn thì lên “Trung cấp”, rồi “Nâng cao”.
            </p>
          </div>
          <Link
            href="/lo-trinh"
            className="text-sm font-semibold text-cyan-200 hover:text-white transition"
          >
            Xem toàn bộ lộ trình →
          </Link>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {LEVELS.map((level) => (
            <LevelPreview key={level.id} level={level} />
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white">Nguyên tắc tập an toàn</h2>
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300 sm:grid-cols-2">
          <li>Khởi động 5–10 phút (cổ chân, gối, hông, vai).</li>
          <li>Tập chậm – đúng kỹ thuật trước khi tăng tốc.</li>
          <li>Đau nhói/choáng: dừng lại và nghỉ, không cố.</li>
          <li>Kỹ thuật khó: nên có HLV hoặc bạn tập quan sát.</li>
        </ul>
      </section>
    </div>
  );
}
