import ProgressDashboard from "@/components/ProgressDashboard";
import { getLocale } from "next-intl/server";

export const metadata = {
  title: "Tiến độ học tập",
};

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      title: "Learning Progress",
      description:
        "Track completed lessons and see which content you view most often. (Stats are device-based in this demo because no DB is connected yet.)",
    };
  }

  if (id === "ja") {
    return {
      title: "学習進捗",
      description:
        "完了したレッスン数と、よく見るコンテンツを確認できます。（このデモではDB未接続のため、統計は端末単位です。）",
    };
  }

  return {
    title: "Tiến độ học tập",
    description:
      "Theo dõi số bài đã hoàn thành và thống kê xem bạn hay xem nội dung nào nhất. (Thống kê theo thiết bị vì bản demo chưa có DB.)",
  };
}

export default async function ProgressPage() {
  const locale = await getLocale();
  const copy = getCopy(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          {copy.description}
        </p>
      </header>

      <ProgressDashboard />
    </div>
  );
}
