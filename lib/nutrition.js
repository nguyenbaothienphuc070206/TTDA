export const TRAINING_STAGES = [
  {
    id: "moi",
    title: "Mới học",
    description: "Ưu tiên làm quen kỹ thuật, tăng dần nhẹ nhàng.",
  },
  {
    id: "vua",
    title: "Học vừa",
    description: "Tập đều, có phối hợp bài và tăng sức bền.",
  },
  {
    id: "lau",
    title: "Học lâu",
    description: "Tập nhiều, cường độ cao hơn, cần phục hồi tốt.",
  },
];

export function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function roundTo(value, step) {
  const n = Number(value);
  const s = Number(step);
  if (!Number.isFinite(n) || !Number.isFinite(s) || s <= 0) return Math.round(n);
  return Math.round(n / s) * s;
}

export function activityFactor(stageId) {
  if (stageId === "moi") return 1.4;
  if (stageId === "vua") return 1.55;
  if (stageId === "lau") return 1.7;
  return 1.4;
}

export function proteinFactor(stageId) {
  if (stageId === "moi") return 1.6;
  if (stageId === "vua") return 1.8;
  if (stageId === "lau") return 2.0;
  return 1.6;
}

export function calculateBmr({ sex, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === "female") return base - 161;
  return base + 5;
}

export function calculateBmi({ weightKg, heightCm }) {
  const h = heightCm / 100;
  if (!h) return 0;
  return weightKg / (h * h);
}

export function calorieTargets(tdee) {
  const maintain = Math.round(tdee);

  return {
    maintain,
    cut: Math.max(1200, Math.round(tdee - 400)),
    bulk: Math.round(tdee + 250),
  };
}

export function calculateMacros({ calories, weightKg, stageId }) {
  const safeCalories = Math.max(0, Number(calories) || 0);
  const proteinMin = weightKg * 1.2;
  const fatMin = weightKg * 0.6;

  let protein = weightKg * proteinFactor(stageId);
  let fat = weightKg * 0.8;

  // round to easier numbers
  protein = roundTo(protein, 5);
  fat = roundTo(fat, 5);

  const kProtein = protein * 4;
  const kFat = fat * 9;

  let remaining = safeCalories - kProtein - kFat;

  if (remaining < 0) {
    fat = roundTo(Math.max(0, fatMin), 5);
    remaining = safeCalories - kProtein - fat * 9;
  }

  if (remaining < 0) {
    protein = roundTo(Math.max(0, proteinMin), 5);
    remaining = safeCalories - protein * 4 - fat * 9;
  }

  const carbs = Math.max(0, remaining / 4);

  return {
    proteinG: Math.max(0, Math.round(protein)),
    fatG: Math.max(0, Math.round(fat)),
    carbsG: Math.max(0, Math.round(carbs)),
  };
}

export function estimateNutrition({ sex, age, heightCm, weightKg, stageId }) {
  const bmr = calculateBmr({ sex, age, heightCm, weightKg });
  const tdee = bmr * activityFactor(stageId);
  const targets = calorieTargets(tdee);
  const macros = calculateMacros({
    calories: targets.maintain,
    weightKg,
    stageId,
  });
  const bmi = calculateBmi({ weightKg, heightCm });

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targets,
    macros,
    bmi: Number.isFinite(bmi) ? Math.round(bmi * 10) / 10 : 0,
  };
}

function portionByCalories(calories) {
  if (calories <= 1800) {
    return {
      carb: "Carb/bữa: ~ 1/2 chén cơm hoặc 1 củ khoai vừa",
      snack: "Snack: 1 trái cây hoặc 1 hũ sữa chua",
      water: "Nước: 1.5–2L/ngày",
    };
  }

  if (calories <= 2300) {
    return {
      carb: "Carb/bữa: ~ 1 chén cơm hoặc 2 củ khoai nhỏ",
      snack: "Snack: trái cây + sữa chua hoặc 2 trứng luộc",
      water: "Nước: 2–2.5L/ngày",
    };
  }

  return {
    carb: "Carb/bữa: ~ 1–1.5 chén cơm hoặc 2 củ khoai vừa",
    snack: "Snack: trái cây + sữa chua + thêm 1 nắm hạt",
    water: "Nước: 2.5–3L/ngày",
  };
}

export function mealSuggestions({ calories, weightKg, stageId, macros }) {
  const portion = portionByCalories(calories);
  const proteinPerMeal = Math.round((macros.proteinG / 3) * 10) / 10;

  const stageNote =
    stageId === "lau"
      ? "Bạn tập lâu: ưu tiên ăn đủ năng lượng, đặc biệt carb quanh giờ tập để phục hồi tốt."
      : stageId === "vua"
      ? "Bạn tập vừa: giữ đều 3 bữa chính, thêm 1 snack để không hụt sức."
      : "Bạn mới học: ưu tiên thói quen ăn đủ chất, không cần siết quá gắt.";

  const menu = [
    {
      name: "Sáng",
      items: [
        "Yến mạch + sữa chua không đường + 1 quả chuối",
        "hoặc bánh mì + 2 trứng + rau",
      ],
    },
    {
      name: "Trưa",
      items: [
        "Cơm + ức gà/cá + rau luộc + canh",
        "hoặc bún/phở (phần vừa) + thêm rau",
      ],
    },
    {
      name: "Tối",
      items: [
        "Cơm vừa + đậu hũ/thịt nạc + rau",
        "hoặc khoai lang + cá + salad",
      ],
    },
    {
      name: "Snack",
      items: [
        "Trái cây + sữa chua",
        "hoặc 2 trứng luộc",
        "hoặc 1 ly sữa + 1 nắm hạt (ít muối)",
      ],
    },
  ];

  const lists = {
    protein: [
      "Ức gà/đùi gà bỏ da",
      "Cá (cá thu, cá basa, cá hồi…)",
      "Thịt nạc (bò nạc/heo nạc)",
      "Trứng",
      "Đậu hũ/đậu nành",
      "Sữa chua (ít đường/không đường)",
    ],
    carb: [
      "Cơm (trắng/gạo lứt)",
      "Khoai lang/khoai tây",
      "Yến mạch",
      "Bún/phở (phần vừa)",
      "Bánh mì nguyên cám",
    ],
    veg: [
      "Rau lá xanh (cải, rau muống, xà lách…)",
      "Bông cải, cà rốt, đậu que",
      "Dưa leo, cà chua",
      "Trái cây (chuối, cam, táo…)",
    ],
    fat: [
      "Hạt (hạnh nhân/điều) – ăn vừa",
      "Bơ (avocado)",
      "Dầu oliu/dầu mè (1–2 muỗng nhỏ)",
    ],
  };

  return {
    stageNote,
    portion,
    proteinPerMeal,
    menu,
    lists,
  };
}
