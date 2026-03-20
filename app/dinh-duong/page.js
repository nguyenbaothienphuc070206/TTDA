import CalorieCalculator from "@/components/CalorieCalculator";
import { getLocale } from "next-intl/server";

export const metadata = {
  title: "Dinh dưỡng",
};

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      title: "Nutrition & Calories",
      description:
        "Estimate daily calories and meal suggestions based on weight, height, age, and training level (new/intermediate/advanced). Includes sample plans for 7/14/21/30 days.",
    };
  }

  if (id === "ja") {
    return {
      title: "栄養とカロリー",
      description:
        "体重・身長・年齢・練習レベル（初心者/中級/上級）から1日のカロリーと食事案を推定。7/14/21/30日のサンプルプランも用意しています。",
    };
  }

  return {
    title: "Dinh dưỡng & calories",
    description:
      "Tính calories/ngày và gợi ý món ăn dựa theo cân nặng, chiều cao, tuổi và mức tập (mới/vừa/lâu). Có kèm chuỗi ăn mẫu 7/14/21/30 ngày để bạn tham khảo.",
  };
}

export default async function NutritionPage() {
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

      <CalorieCalculator />
    </div>
  );
}
