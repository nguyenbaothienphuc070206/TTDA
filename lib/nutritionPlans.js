import { TRAINING_STAGES } from "@/lib/nutrition";

export const MEAL_PLAN_DURATIONS = [7, 14, 21, 30];

function calorieTier(calories) {
  const c = Number(calories) || 0;
  if (c <= 1800) return "low";
  if (c <= 2300) return "mid";
  return "high";
}

const MEALS = {
  breakfast: [
    "Yến mạch + sữa chua không đường + 1 quả chuối",
    "Bánh mì + 2 trứng + rau",
    "Khoai lang + trứng + trái cây",
    "Phở/bún (phần vừa) + thêm rau",
  ],
  lunch: [
    "Cơm + ức gà/cá + rau luộc + canh",
    "Cơm + thịt nạc + rau + canh",
    "Bún/phở (phần vừa) + thêm rau",
    "Cơm + đậu hũ + rau + canh",
  ],
  dinner: [
    "Cơm vừa + cá + rau",
    "Khoai lang + ức gà + salad",
    "Cơm vừa + đậu hũ/thịt nạc + rau",
    "Salad + protein (gà/cá/đậu hũ) + 1 trái cây",
  ],
  snack: [
    "Trái cây + sữa chua",
    "2 trứng luộc",
    "1 ly sữa + 1 nắm hạt (ít muối)",
    "Chuối + bơ đậu phộng (ít) (nếu hợp)",
  ],
};

function portionHintByTier(tier) {
  if (tier === "low") {
    return {
      carb: "Carb: ~ 1/2 chén cơm hoặc 1 củ khoai vừa/bữa",
      protein: "Protein: 1–1.5 lòng bàn tay/bữa",
      veg: "Rau: 2 nắm tay/bữa",
      water: "Nước: 1.5–2L/ngày",
    };
  }

  if (tier === "mid") {
    return {
      carb: "Carb: ~ 1 chén cơm hoặc 2 củ khoai nhỏ/bữa",
      protein: "Protein: 1.5 lòng bàn tay/bữa",
      veg: "Rau: 2–3 nắm tay/bữa",
      water: "Nước: 2–2.5L/ngày",
    };
  }

  return {
    carb: "Carb: ~ 1–1.5 chén cơm hoặc 2 củ khoai vừa/bữa",
    protein: "Protein: 1.5–2 lòng bàn tay/bữa",
    veg: "Rau: 2–3 nắm tay/bữa",
    water: "Nước: 2.5–3L/ngày",
  };
}

function stageNote(stageId) {
  const s = TRAINING_STAGES.find((x) => x.id === stageId);
  if (!s) return "";

  if (stageId === "lau") {
    return "Mức tập cao: ưu tiên ăn đủ năng lượng, thêm carb quanh giờ tập để phục hồi.";
  }

  if (stageId === "vua") {
    return "Mức tập vừa: giữ đều 3 bữa chính + 1 snack để không hụt sức.";
  }

  return "Mới tập: ưu tiên thói quen ăn đủ chất, đừng siết quá gắt tuần đầu.";
}

function pick(arr, index) {
  return arr[index % arr.length];
}

export function generateMealPlan({ days, calories, stageId }) {
  const totalDays = Number(days);
  const safeDays = Number.isFinite(totalDays) ? Math.max(1, Math.round(totalDays)) : 7;
  const tier = calorieTier(calories);

  const items = Array.from({ length: safeDays }, (_, i) => {
    const day = i + 1;

    return {
      day,
      meals: {
        breakfast: pick(MEALS.breakfast, i),
        lunch: pick(MEALS.lunch, i + 1),
        dinner: pick(MEALS.dinner, i + 2),
        snack: pick(MEALS.snack, i + 3),
      },
      note:
        stageId === "lau"
          ? "Nếu tập nặng: thêm 1 snack trước/hoặc sau tập (chuối/sữa chua)."
          : stageId === "vua"
          ? "Nếu đói: thêm 1 trái cây vào buổi xế."
          : "Ưu tiên ngủ đủ 7–8h để hồi phục.",
    };
  });

  return {
    days: safeDays,
    tier,
    portionHints: portionHintByTier(tier),
    stageNote: stageNote(stageId),
    items,
  };
}
