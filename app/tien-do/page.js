import ProgressDashboard from "@/components/ProgressDashboard";

export const metadata = {
  title: "Tiến độ học tập",
};

export default function ProgressPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Tiến độ học tập
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Theo dõi số bài đã hoàn thành và thống kê xem bạn hay xem nội dung nào nhất.
          (Thống kê theo thiết bị vì bản demo chưa có DB.)
        </p>
      </header>

      <ProgressDashboard />
    </div>
  );
}
