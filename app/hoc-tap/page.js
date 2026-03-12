import LearningDashboard from "@/components/LearningDashboard";

export const metadata = {
  title: "Khóa học",
};

export default function LearningDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Khóa học (Learning Dashboard)
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Phân chia theo cấp đai (Lam/Hoàng/Huyền) và tự động tính tiến độ dựa
          trên bài học bạn đã đánh dấu hoàn thành.
        </p>
      </header>

      <LearningDashboard />
    </div>
  );
}
