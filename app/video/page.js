import VideoLibrary from "@/components/VideoLibrary";
import { VIDEOS } from "@/data/videos";
import { getLocale } from "next-intl/server";

export const metadata = {
  title: "Video bài quyền",
};

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      title: "Technique Videos",
      description:
        "Videos are grouped by Blue, Yellow, Red systems and belt levels for easier tracking. Blue is free; Yellow/Red require Premium.",
    };
  }

  if (id === "ja") {
    return {
      title: "技術動画",
      description:
        "動画は青帯・黄帯・紅帯システムと帯レベルごとに整理されています。青帯は無料、黄帯/紅帯は Premium が必要です。",
    };
  }

  return {
    title: "Video bài quyền",
    description:
      "Video được chia theo hệ Lam, Hoàng, Hồng và từng cấp đai để dễ theo dõi. Hệ Lam đai mở miễn phí; hệ Hoàng/Hồng đai cần Premium.",
  };
}

export default async function VideosPage() {
  const locale = await getLocale();
  const copy = getCopy(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)] fade-in-up">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          {copy.description}
        </p>
      </header>

      <VideoLibrary videos={VIDEOS} />
    </div>
  );
}
