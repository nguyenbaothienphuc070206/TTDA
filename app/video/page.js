import Link from "next/link";

import { VIDEOS } from "@/data/videos";

export const metadata = {
  title: "Video bài quyền",
};

function VideoCard({ video }) {
  return (
    <Link
      href={`/video/${video.id}`}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[var(--shadow-card)] transition will-change-transform hover:bg-white/10 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[var(--shadow-card-strong)] hover:border-blue-400/35 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
    >
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_55%)]" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-white">
              {video.title}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              {video.summary}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200">
                {video.minutes} phút
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
                RAG Q&A
              </span>
            </div>
          </div>

          <div className="h-10 w-10 shrink-0 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-400/15 to-blue-600/10" />
        </div>

        <div className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-4 text-sm font-semibold text-slate-950 transition group-hover:brightness-110">
          Xem video
        </div>
      </div>
    </Link>
  );
}

export default function VideosPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)] fade-in-up">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Video bài quyền
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Xem video và hỏi nhanh về kỹ thuật ngay trên trang bằng AI Coach (RAG).
          (Dữ liệu demo để minh hoạ).
        </p>
      </header>

      <div className="grid gap-3 lg:grid-cols-2 stagger-fade">
        {VIDEOS.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </div>
  );
}
