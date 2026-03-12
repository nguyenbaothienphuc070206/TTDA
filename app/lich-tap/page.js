import ScheduleBuilder from "@/components/ScheduleBuilder";

export const metadata = {
  title: "Lịch tập",
};

export default function SchedulePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Lịch tập
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Tạo lịch tập 7 ngày đơn giản để luyện đều. Lịch sẽ tự lưu trên máy
          (localStorage).
        </p>
      </header>

      <ScheduleBuilder />
    </div>
  );
}
