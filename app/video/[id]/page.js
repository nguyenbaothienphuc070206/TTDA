import { notFound } from "next/navigation";

import AiCoachChat from "@/components/AiCoachChat";
import JsonLd from "@/components/JsonLd";
import TrackView from "@/components/TrackView";
import VideoPlayerPanel from "@/components/VideoPlayerPanel";
import { getVideoById } from "@/data/videos";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const video = getVideoById(id);
  if (!video) return { title: "Video" };

  return {
    title: video.title,
    description: video.summary,
    openGraph: {
      title: video.title,
      description: video.summary,
      type: "video.other",
    },
    twitter: {
      card: "summary",
      title: video.title,
      description: video.summary,
    },
  };
}

export default async function VideoDetailPage({ params }) {
  const { id } = await params;
  const video = getVideoById(id);
  if (!video) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.summary,
    duration: `PT${Math.max(1, Number(video.minutes) || 0)}M`,
    url: `/video/${video.id}`,
    ...(video.hlsUrl ? { contentUrl: video.hlsUrl } : {}),
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <TrackView type="video" id={video.id} />
      <JsonLd data={jsonLd} />

      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)] fade-in-up">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {video.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          {video.summary}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:items-start stagger-fade">
        <VideoPlayerPanel video={video} />

        <AiCoachChat context={{ videoId: video.id }} />
      </div>
    </div>
  );
}
