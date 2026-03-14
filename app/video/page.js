import VideoLibrary from "@/components/VideoLibrary";
import { VIDEOS } from "@/data/videos";

export const metadata = {
  title: "Video bài quyền",
};

export default function VideosPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)] fade-in-up">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Video bài quyền
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Xem video và hỏi nhanh về kỹ thuật ngay trên trang bằng AI Coach (RAG).
          Lam đai mở miễn phí; Hoàng/Huyền đai cần Premium. (Dữ liệu demo để minh hoạ).
        </p>
      </header>

      <VideoLibrary videos={VIDEOS} />
    </div>
  );
}
