import CalorieCalculator from "@/components/CalorieCalculator";

export const metadata = {
  title: "Dinh dưỡng",
};

export default function NutritionPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Dinh dưỡng & calories
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Tính calories/ngày và gợi ý món ăn dựa theo cân nặng, chiều cao, tuổi
          và mức tập (mới/vừa/lâu). Có kèm chuỗi ăn mẫu 7/14/21/30 ngày để bạn
          tham khảo.
        </p>
      </header>

      <CalorieCalculator />
    </div>
  );
}
