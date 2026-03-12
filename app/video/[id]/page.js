import { notFound } from "next/navigation";

import AiCoachChat from "@/components/AiCoachChat";
import TrackView from "@/components/TrackView";
import { getVideoById } from "@/data/videos";

export function generateMetadata({ params }) {
  const video = getVideoById(params.id);
  if (!video) return { title: "Video" };

  return {
    title: video.title,
    description: video.summary,
  };
}

export default function VideoDetailPage({ params }) {
  const video = getVideoById(params.id);
  if (!video) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <TrackView type="video" id={video.id} />

      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {video.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          {video.summary}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
          <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
            <iframe
              className="h-full w-full"
              src={video.embedUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <div className="text-xs font-semibold text-slate-300">Transcript (demo)</div>
            <ul className="mt-2 grid gap-2 text-sm leading-6 text-slate-300">
              {video.transcript.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <AiCoachChat context={{ videoId: video.id }} />
      </div>
    </div>
  );
}
