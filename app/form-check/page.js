import PoseCoach from "@/components/PoseCoach";

export const metadata = {
  title: "Chấm chữa kỹ thuật",
};

export default function FormCheckPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="stagger-fade grid gap-6">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-(--shadow-card) sm:p-8">
        <div className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
          Chấm chữa kỹ thuật
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Chấm chữa kỹ thuật theo thời gian thực
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Dùng camera để tự kiểm tra kỹ thuật và nhận góp ý ngay khi tập. Bạn biết mình sai ở đâu để sửa nhanh và tập đúng hơn.
        </p>

        <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-slate-200">
          <p className="font-semibold text-cyan-100">Bạn nhận được gì?</p>
          <ul className="mt-2 grid gap-1">
            <li>• Phát hiện lỗi kỹ thuật cơ bản ngay lúc tập</li>
            <li>• Gợi ý sửa ngắn gọn, dễ làm theo</li>
            <li>• Theo dõi tiến bộ qua từng lần luyện tập</li>
          </ul>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-(--shadow-card)">
        <PoseCoach />
      </section>
      </div>
    </div>
  );
}
