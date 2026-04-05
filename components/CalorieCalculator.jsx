"use client";

import { useEffect, useMemo, useState } from "react";

import { readJson, writeJson } from "@/lib/storage";
import {
  TRAINING_STAGES,
  clampNumber,
  estimateNutrition,
  mealSuggestions,
} from "@/lib/nutrition";
import { MEAL_PLAN_DURATIONS, generateMealPlan } from "@/lib/nutritionPlans";

const NUTRITION_KEY = "vovinam_nutrition_v1";
const SCHEDULE_KEY = "vovinam_schedule_v1";

const DEFAULT_FORM = {
  sex: "male",
  age: 22,
  heightCm: 170,
  weightKg: 60,
  stageId: "moi",
};

function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function toPct(n) {
  const v = Math.round(Number(n) || 0);
  return Math.max(0, Math.min(100, v));
}

function formatLitersFromMl(ml) {
  const n = Number(ml) || 0;
  if (n <= 0) return "0L";
  const liters = Math.round((n / 1000) * 10) / 10;
  return `${liters}L`;
}

function bmiInsightLine(bmi) {
  const v = Number(bmi);
  if (!Number.isFinite(v) || v <= 0) return "";

  if (v < 18.5) {
    return "BMI hơi thấp; tăng nhẹ Calo và ưu tiên đạm để phục hồi cơ, lên lực chắc hơn.";
  }

  if (v < 25) {
    return "Chỉ số BMI của bạn rất đẹp, hãy giữ mức Calo này để duy trì sự nhanh nhẹn khi xuất đòn.";
  }

  if (v < 30) {
    return "BMI hơi cao; giảm nhẹ Calo (không cắt gắt), giữ protein để vẫn mạnh và linh hoạt.";
  }

  return "BMI cao; ưu tiên an toàn khớp gối/hông, giảm nhẹ Calo và tăng vận động đều đặn.";
}

function macroPcts(macros) {
  const proteinG = Number(macros?.proteinG) || 0;
  const carbsG = Number(macros?.carbsG) || 0;
  const fatG = Number(macros?.fatG) || 0;

  const proteinK = proteinG * 4;
  const carbsK = carbsG * 4;
  const fatK = fatG * 9;
  const total = proteinK + carbsK + fatK;

  const proteinPct = total > 0 ? toPct((proteinK / total) * 100) : 0;
  const carbsPct = total > 0 ? toPct((carbsK / total) * 100) : 0;
  const fatPct = total > 0 ? toPct(100 - proteinPct - carbsPct) : 0;

  return { proteinPct, carbsPct, fatPct };
}

function MacroDonutMini({ macros }) {
  const { proteinPct, carbsPct, fatPct } = macroPcts(macros);
  const segments = [
    { key: "protein", pct: proteinPct, className: "text-cyan-300" },
    { key: "carbs", pct: carbsPct, className: "text-blue-500" },
    { key: "fat", pct: fatPct, className: "text-amber-300" },
  ];

  let offset = 0;

  return (
    <svg
      viewBox="0 0 42 42"
      className="h-16 w-16 origin-center -rotate-90"
      aria-label="Donut chart Macro"
      role="img"
    >
      <circle
        cx="21"
        cy="21"
        r="15.915"
        fill="transparent"
        className="text-white/10"
        stroke="currentColor"
        strokeWidth="8"
      />

      {segments.map((seg) => {
        const dashoffset = -offset;
        offset += seg.pct;

        return (
          <circle
            key={seg.key}
            cx="21"
            cy="21"
            r="15.915"
            fill="transparent"
            className={seg.className}
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${seg.pct} ${Math.max(0, 100 - seg.pct)}`}
            strokeDashoffset={dashoffset}
            strokeLinecap="butt"
          />
        );
      })}

      <circle cx="21" cy="21" r="11" className="text-[color:var(--app-bg)]" fill="currentColor" />
    </svg>
  );
}

function TodayMenuWidget({ calories, macros }) {
  const cal = Math.max(0, Math.round(Number(calories) || 0));

  const proteinG = cal < 1800 ? 140 : cal < 2300 ? 170 : 210;
  const carbG = cal < 1800 ? 160 : cal < 2300 ? 220 : 280;
  const saladHint = cal < 1800 ? "1 tô nhỏ" : cal < 2300 ? "1 tô" : "1 tô + dầu olive nhẹ";

  const items = [
    { name: "Ức gà áp chảo", hint: `${proteinG}g (ước lượng)` },
    { name: "Khoai lang luộc", hint: `${carbG}g (ước lượng)` },
    { name: "Salad rau xanh", hint: saladHint },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <MacroDonutMini macros={macros} />
        </div>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-white">Thực đơn hôm nay</div>
          <div className="mt-1 text-xs text-slate-300">
            Dựa trên mục tiêu <span className="font-semibold text-white">{cal} kcal/ngày</span>.
          </div>

          <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
            {items.map((it) => (
              <li key={it.name} className="flex items-start justify-between gap-3">
                <span className="text-slate-200">• {it.name}</span>
                <span className="text-xs text-slate-400">{it.hint}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function getTodayScheduleIndex(nowMs) {
  const ts = Number(nowMs);
  const now = new Date(Number.isFinite(ts) && ts > 0 ? ts : Date.now());
  const dow = now.getDay();
  // ScheduleBuilder uses Monday-first index.
  if (dow === 0) return 6;
  return Math.max(0, Math.min(6, dow - 1));
}

function estimateTrainingMet(stageId) {
  const id = String(stageId || "").trim();
  if (id === "lau") return 8.5;
  if (id === "vua") return 7.5;
  return 6.5;
}

function RealtimeEnergyWidget({ schedule, nowMs, weightKg, stageId, baseCalories, macros }) {
  const dayIndex = getTodayScheduleIndex(nowMs);
  const item =
    Array.isArray(schedule) && schedule.length === 7 ? schedule[dayIndex] : null;

  const dayLabel = String(item?.day || "").trim() || [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ][dayIndex];

  const type = String(item?.type || "").trim();
  const isTraining = type === "tap";
  const minutes = isTraining
    ? clampNumber(item?.minutes, 10, 180, 0)
    : 0;

  const base = Math.max(0, Math.round(Number(baseCalories) || 0));

  if (!isTraining) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Thanh năng lượng thời gian thực</div>
            <div className="mt-1 text-xs text-slate-300">{dayLabel} • Hôm nay nghỉ</div>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">
            Nghỉ
          </span>
        </div>

        {base > 0 ? (
          <>
            <div className="mt-4 grid gap-2 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-200">Mục tiêu năng lượng gợi ý</span>
                <span className="font-semibold text-white">{base} kcal</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-200">Buổi tập hôm nay</span>
                <span className="font-semibold text-white">0 kcal</span>
              </div>
            </div>

            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10 flex">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                style={{ width: "100%" }}
              />
            </div>
          </>
        ) : null}

        <p className="mt-3 text-sm leading-6 text-slate-300">
          Gợi ý: đi bộ nhẹ 10-20 phút, giãn cơ và uống đủ nước để phục hồi.
        </p>
      </div>
    );
  }

  const met = estimateTrainingMet(stageId);
  const safeW = clampNumber(weightKg, 30, 200, 60);
  const trainingKcal = Math.round((met * safeW * minutes) / 60);

  const total = base > 0 ? base + trainingKcal : trainingKcal;
  const basePct = total > 0 && base > 0 ? toPct((base / total) * 100) : 0;
  const extraPct = Math.max(0, 100 - basePct);

  const extraProteinKcal = Math.round(Math.min(220, Math.max(60, trainingKcal * 0.35)));
  const extraProteinG = Math.max(0, Math.round(extraProteinKcal / 4));
  const baseProteinG = Math.max(0, Math.round(Number(macros?.proteinG) || 0));

  const quickSuggestion = extraProteinG >= 16
    ? "1 quả trứng + 1 hộp sữa chua"
    : extraProteinG >= 10
      ? "1 quả trứng + 1 ly sữa"
      : "1 quả trứng";

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">Thanh năng lượng thời gian thực</div>
          <div className="mt-1 text-xs text-slate-300">
            {dayLabel} • Buổi tập {minutes}′
            {item?.title ? ` • ${String(item.title).trim()}` : ""}
          </div>
        </div>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
          Tập
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-300">
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-200">Buổi tập hôm nay (ước tính)</span>
          <span className="font-semibold text-white">~{trainingKcal} kcal</span>
        </div>
        {base > 0 ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-200">Tổng năng lượng gợi ý</span>
            <span className="font-semibold text-white">{total} kcal</span>
          </div>
        ) : null}
      </div>

      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10 flex">
        {base > 0 ? (
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
            style={{ width: `${basePct}%` }}
          />
        ) : null}
        <div
          className="h-full bg-gradient-to-r from-amber-300 to-yellow-400"
          style={{ width: `${base > 0 ? extraPct : 100}%` }}
        />
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs font-semibold text-slate-300">AI cảnh báo (demo)</div>
        <p className="mt-2 text-sm leading-6 text-slate-200">
          Buổi tập hôm nay cần khoảng <span className="font-semibold text-white">{trainingKcal} kcal</span>. Để phục hồi,
          nên bổ sung thêm <span className="font-semibold text-white">~{extraProteinKcal} kcal</span> từ đạm
          (~{extraProteinG}g).
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Gợi ý nhanh: <span className="font-semibold text-white">{quickSuggestion}</span>.
          {baseProteinG ? (
            <span>
              {" "}Mục tiêu protein: {baseProteinG}g → {baseProteinG + extraProteinG}g (ngày tập).
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );
}

function MacroPie({ macros }) {
  const proteinG = Number(macros?.proteinG) || 0;
  const carbsG = Number(macros?.carbsG) || 0;
  const fatG = Number(macros?.fatG) || 0;

  const proteinK = proteinG * 4;
  const carbsK = carbsG * 4;
  const fatK = fatG * 9;
  const total = proteinK + carbsK + fatK;

  const proteinPct = total > 0 ? toPct((proteinK / total) * 100) : 0;
  const carbsPct = total > 0 ? toPct((carbsK / total) * 100) : 0;
  const fatPct = total > 0 ? toPct(100 - proteinPct - carbsPct) : 0;

  const segments = [
    { key: "protein", label: "Đạm", pct: proteinPct, className: "text-cyan-300", dotClassName: "bg-cyan-300" },
    { key: "carbs", label: "Đường", pct: carbsPct, className: "text-blue-500", dotClassName: "bg-blue-500" },
    { key: "fat", label: "Béo", pct: fatPct, className: "text-amber-300", dotClassName: "bg-amber-300" },
  ];

  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg
        viewBox="0 0 42 42"
        className="h-28 w-28 origin-center -rotate-90"
        aria-label="Biểu đồ tỷ lệ Macro"
        role="img"
      >
        <circle
          cx="21"
          cy="21"
          r="15.915"
          fill="transparent"
          className="text-white/10"
          stroke="currentColor"
          strokeWidth="8"
        />

        {segments.map((seg) => {
          const dashoffset = -offset;
          offset += seg.pct;

          return (
            <circle
              key={seg.key}
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              className={seg.className}
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${seg.pct} ${Math.max(0, 100 - seg.pct)}`}
              strokeDashoffset={dashoffset}
              strokeLinecap="butt"
            />
          );
        })}

        <circle cx="21" cy="21" r="10" className="text-[color:var(--app-bg)]" fill="currentColor" />
      </svg>

      <div className="min-w-0">
        <div className="text-sm font-semibold text-white">Tỷ lệ Macro mục tiêu</div>
        <div className="mt-2 grid gap-1 text-xs text-slate-300">
          {segments.map((seg) => (
            <div key={seg.key} className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${seg.dotClassName}`} />
                <span className="text-slate-200">{seg.label}</span>
              </span>
              <span className="font-semibold text-white">{seg.pct}%</span>
            </div>
          ))}
        </div>

        <div className="mt-2 text-xs text-slate-400">
          (Tính theo kcal từ Macro: đạm 4kcal/g, đường 4kcal/g, béo 9kcal/g)
        </div>
      </div>
    </div>
  );
}

function WaterClock({ weightKg, nowMs }) {
  const safeW = Number(weightKg);
  const targetMlRaw = Number.isFinite(safeW) && safeW > 0 ? safeW * 35 : 0;
  const targetMl = Math.round(Math.max(1200, Math.min(4500, targetMlRaw || 0)));

  const ts = Number(nowMs);
  const now = new Date(Number.isFinite(ts) && ts > 0 ? ts : 0);
  const start = new Date(now);
  start.setHours(6, 0, 0, 0);
  const end = new Date(now);
  end.setHours(22, 0, 0, 0);

  const frac = clamp01((now.getTime() - start.getTime()) / Math.max(1, end.getTime() - start.getTime()));
  const expectedMl = Math.round(targetMl * frac);

  const r = 50;
  const c = 2 * Math.PI * r;
  const dash = c;
  const offset = dash * (1 - frac);

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 120" className="h-28 w-28" role="img" aria-label="Đồng hồ uống nước">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="10"
          className="text-white/10"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray={dash}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-cyan-300"
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="55" textAnchor="middle" className="fill-white text-sm font-semibold">
          {Math.round(frac * 100)}%
        </text>
        <text x="60" y="74" textAnchor="middle" className="fill-slate-300 text-[10px]">
          mốc hôm nay
        </text>
      </svg>

      <div className="min-w-0">
        <div className="text-sm font-semibold text-white">Đồng hồ uống nước</div>
        <p className="mt-1 text-xs leading-5 text-slate-300">
          Mục tiêu theo cân nặng (~35ml/kg): <span className="font-semibold text-white">{formatLitersFromMl(targetMl)}</span>/ngày
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-300">
          Tới giờ này nên đạt khoảng <span className="font-semibold text-white">{formatLitersFromMl(expectedMl)}</span>.
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Mẹo: chia đều từ 6h-22h, mỗi 60-90 phút uống 200-300ml.
        </p>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs font-semibold text-slate-200">{label}</div>
      <div className="mt-2">{children}</div>
      {hint ? <div className="mt-2 text-xs text-slate-300">{hint}</div> : null}
    </label>
  );
}

function ResultCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold text-slate-300">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
        {value}
      </div>
      {sub ? <div className="mt-1 text-xs text-slate-300">{sub}</div> : null}
    </div>
  );
}

function DotList({ items }) {
  return (
    <ul className="grid gap-2 text-sm leading-6 text-slate-300">
      {items.map((t, idx) => (
        <li key={idx} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export default function CalorieCalculator() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [planDays, setPlanDays] = useState(7);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [schedule, setSchedule] = useState(() => readJson(SCHEDULE_KEY, []));

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const sync = () => {
      const saved = readJson(SCHEDULE_KEY, []);
      if (Array.isArray(saved) && saved.length === 7) {
        setSchedule(saved);
      } else {
        setSchedule([]);
      }
    };

    sync();
    window.addEventListener("vovinam-schedule", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vovinam-schedule", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const sync = () => {
      const saved = readJson(NUTRITION_KEY, null);
      if (!saved || typeof saved !== "object") return;

      setForm((current) => {
        const next = {
          ...current,
          sex: saved.sex === "female" ? "female" : "male",
          age: clampNumber(saved.age, 10, 80, current.age),
          heightCm: clampNumber(saved.heightCm, 120, 230, current.heightCm),
          weightKg: clampNumber(saved.weightKg, 30, 200, current.weightKg),
          stageId:
            saved.stageId === "vua" || saved.stageId === "lau" ? saved.stageId : "moi",
        };

        return next;
      });
    };

    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    writeJson(NUTRITION_KEY, form);
  }, [form]);

  const age = Number(form.age);
  const heightCm = Number(form.heightCm);
  const weightKg = Number(form.weightKg);

  const safeAge = clampNumber(age, 10, 80, DEFAULT_FORM.age);
  const safeHeightCm = clampNumber(heightCm, 120, 230, DEFAULT_FORM.heightCm);
  const safeWeightKg = clampNumber(weightKg, 30, 200, DEFAULT_FORM.weightKg);

  const validation = useMemo(() => {
    const errors = [];

    if (!Number.isFinite(age) || age < 10 || age > 80) {
      errors.push("Tuổi nên trong khoảng 10-80.");
    }

    if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 230) {
      errors.push("Chiều cao nên trong khoảng 120-230 cm.");
    }

    if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 200) {
      errors.push("Cân nặng nên trong khoảng 30-200 kg.");
    }

    return { ok: errors.length === 0, errors };
  }, [age, heightCm, weightKg]);

  const result = useMemo(() => {
    if (!validation.ok) return null;

    return estimateNutrition({
      sex: form.sex,
      age,
      heightCm,
      weightKg,
      stageId: form.stageId,
    });
  }, [validation.ok, form.sex, form.stageId, age, heightCm, weightKg]);

  const previewResult = useMemo(() => {
    return estimateNutrition({
      sex: form.sex,
      age: safeAge,
      heightCm: safeHeightCm,
      weightKg: safeWeightKg,
      stageId: form.stageId,
    });
  }, [form.sex, form.stageId, safeAge, safeHeightCm, safeWeightKg]);

  const leftResult = result || previewResult;
  const tldrWaterMl = Math.round(Math.max(1200, Math.min(4500, safeWeightKg * 35)));

  const suggestions = useMemo(() => {
    if (!result) return null;

    return mealSuggestions({
      calories: result.targets.maintain,
      weightKg,
      stageId: form.stageId,
      macros: result.macros,
    });
  }, [result, weightKg, form.stageId]);

  const plan = useMemo(() => {
    if (!result) return null;

    return generateMealPlan({
      days: planDays,
      calories: result.targets.maintain,
      stageId: form.stageId,
    });
  }, [result, planDays, form.stageId]);

  const stage = TRAINING_STAGES.find((s) => s.id === form.stageId) || TRAINING_STAGES[0];

  const onReset = () => {
    setForm(DEFAULT_FORM);
    writeJson(NUTRITION_KEY, DEFAULT_FORM);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <div className="grid gap-4">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-white">Máy tính calories</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Nhập thông tin cơ bản để ước lượng calories/ngày và gợi ý ăn uống.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Giới tính">
              <select
                value={form.sex}
                onChange={(e) => setForm((s) => ({ ...s, sex: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </Field>

            <Field label="Mức tập" hint={stage.description}>
              <select
                value={form.stageId}
                onChange={(e) => setForm((s) => ({ ...s, stageId: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
              >
                {TRAINING_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tuổi" hint="đơn vị: năm">
              <input
                type="number"
                inputMode="numeric"
                value={form.age}
                onChange={(e) => setForm((s) => ({ ...s, age: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
                min={10}
                max={80}
              />
            </Field>

            <Field label="Chiều cao" hint="đơn vị: cm">
              <input
                type="number"
                inputMode="numeric"
                value={form.heightCm}
                onChange={(e) => setForm((s) => ({ ...s, heightCm: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
                min={120}
                max={230}
              />
            </Field>

            <Field label="Cân nặng" hint="đơn vị: kg">
              <input
                type="number"
                inputMode="decimal"
                value={form.weightKg}
                onChange={(e) => setForm((s) => ({ ...s, weightKg: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
                min={30}
                max={200}
                step={0.1}
              />
            </Field>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs font-semibold text-slate-200">Thao tác</div>
              <div className="mt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
                >
                  Reset
                </button>
                <p className="text-xs leading-5 text-slate-300">
                  Mẹo: Form tự lưu trên máy để bạn khỏi nhập lại.
                </p>
              </div>
            </div>
          </div>

          {!validation.ok ? (
            <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4">
              <p className="text-sm font-semibold text-rose-100">Thông tin chưa hợp lệ</p>
              <ul className="mt-2 grid gap-1 text-sm text-rose-100/90">
                {validation.errors.map((e) => (
                  <li key={e}>- {e}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-4 text-xs leading-5 text-slate-300">
            Đây là ước lượng dựa trên công thức phổ biến (BMR/TDEE). Nếu bạn có
            bệnh lý hoặc mục tiêu đặc thù, nên tham khảo chuyên gia dinh dưỡng.
          </div>
        </section>

        <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)]">
          <h2 className="text-xl font-semibold text-white">Trợ lý sức khỏe thông minh</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Tóm tắt nhanh Macro, nước và lời nhắc dinh dưỡng phù hợp võ sinh.
          </p>

          <div className="mt-4 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-cyan-100">Hôm nay bạn cần</div>
            <ul className="mt-2 grid gap-1 text-sm leading-6 text-slate-200">
              <li>• {leftResult.targets.maintain} kcal</li>
              <li>• ~{leftResult.macros.proteinG}g protein</li>
              <li>• Uống khoảng {formatLitersFromMl(tldrWaterMl)} nước</li>
              <li>• Ưu tiên đạm nạc và uống đủ nước</li>
            </ul>
          </div>

          <div className="mt-4 grid gap-4">
            <TodayMenuWidget calories={leftResult.targets.maintain} macros={leftResult.macros} />

            <RealtimeEnergyWidget
              schedule={schedule}
              nowMs={nowMs}
              weightKg={safeWeightKg}
              stageId={form.stageId}
              baseCalories={leftResult.targets.maintain}
              macros={leftResult.macros}
            />

            <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
              <MacroPie macros={leftResult.macros} />
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
              <WaterClock weightKg={safeWeightKg} nowMs={nowMs} />
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
              <div className="text-sm font-semibold text-white">Lưu ý thực phẩm (võ sinh Vovinam)</div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold text-slate-300">Thực phẩm nên dùng</div>
                  <ul className="mt-2 grid gap-2 text-sm leading-6 text-slate-300">
                    <li>• Ưu tiên đạm nạc (ức gà, cá, trứng) để hồi phục cơ sau khi tập đòn chân.</li>
                    <li>• Carb chậm (gạo lứt, khoai, yến mạch) để giữ sức bền khi tập quyền/đối luyện.</li>
                    <li>• Rau xanh + trái cây để phục hồi và giảm mệt.</li>
                    <li>• Nếu ra mồ hôi nhiều: thêm nước + điện giải nhẹ (ít đường).</li>
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-300">Thực phẩm cần tránh</div>
                  <ul className="mt-2 grid gap-2 text-sm leading-6 text-slate-300">
                    <li>• Nước ngọt/đồ nhiều đường trước giờ tập (dễ hụt năng lượng).</li>
                    <li>• Chiên rán nhiều dầu (nặng bụng, khó vận động).</li>
                    <li>• Rượu bia sau tập (giảm phục hồi).</li>
                    <li>• Ăn quá no sát giờ tập (dễ xóc hông, đau bụng).</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
              <div className="text-sm font-semibold text-white">AI Health Insight</div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{bmiInsightLine(leftResult.bmi)}</p>
            </div>
          </div>
        </aside>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Kết quả & gợi ý</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Calories ước lượng và gợi ý ăn uống theo mức tập.
        </p>

        {result ? (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <ResultCard label="BMR" value={`${result.bmr} kcal`} sub="năng lượng cơ bản" />
              <ResultCard
                label="Calories/ngày"
                value={`${result.targets.maintain} kcal`}
                sub="giữ cân (ước lượng)"
              />
              <ResultCard label="BMI (tham khảo)" value={result.bmi} sub="chỉ số cơ thể" />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold text-slate-300">Mục tiêu nhanh</div>
                <div className="mt-3 grid gap-2 text-sm text-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-200">Giảm mỡ nhẹ</span>
                    <span className="font-semibold text-white">{result.targets.cut} kcal</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-200">Giữ cân</span>
                    <span className="font-semibold text-white">{result.targets.maintain} kcal</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-200">Tăng cơ nhẹ</span>
                    <span className="font-semibold text-white">{result.targets.bulk} kcal</span>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-300">
                  Gợi ý: chỉ tăng/giảm nhẹ để dễ duy trì, đặc biệt khi bạn mới tập.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold text-slate-300">Macro (ước lượng)</div>
                <div className="mt-3 grid gap-2 text-sm text-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-200">Protein</span>
                    <span className="font-semibold text-white">
                      {result.macros.proteinG}g
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-200">Carb</span>
                    <span className="font-semibold text-white">
                      {result.macros.carbsG}g
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-200">Fat</span>
                    <span className="font-semibold text-white">{result.macros.fatG}g</span>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-300">
                  Ưu tiên protein đều mỗi bữa để phục hồi tốt.
                </p>
              </div>
            </div>

            {suggestions ? (
              <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/30 p-5">
                <p className="text-sm font-semibold text-white">Gợi ý chọn món</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  {suggestions.stageNote}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs font-semibold text-slate-300">Mỗi bữa chính</div>
                    <div className="mt-2 text-sm text-slate-200">
                      Protein: ~{suggestions.proteinPerMeal}g
                    </div>
                    <div className="mt-2 text-sm text-slate-300">
                      {suggestions.portion.carb}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs font-semibold text-slate-300">Snack</div>
                    <div className="mt-2 text-sm text-slate-300">
                      {suggestions.portion.snack}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs font-semibold text-slate-300">Nước</div>
                    <div className="mt-2 text-sm text-slate-300">
                      {suggestions.portion.water}
                    </div>
                  </div>
                </div>

                {plan ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-white">Chuỗi ăn mẫu</div>
                        <div className="mt-1 text-xs text-slate-300">
                          Chọn 7/14/21/30 ngày để tham khảo lịch ăn.
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {MEAL_PLAN_DURATIONS.map((d) => {
                          const active = d === planDays;

                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setPlanDays(d)}
                              className={
                                "inline-flex h-9 items-center justify-center rounded-2xl border px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300/30 " +
                                (active
                                  ? "border-cyan-300/30 bg-cyan-300/10 text-white"
                                  : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10")
                              }
                            >
                              {d === 30 ? "1 tháng" : `${d} ngày`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                      <div className="text-xs font-semibold text-slate-300">Khẩu phần gợi ý</div>
                      <ul className="mt-2 grid gap-1 text-sm text-slate-300">
                        <li>{plan.portionHints.carb}</li>
                        <li>{plan.portionHints.protein}</li>
                        <li>{plan.portionHints.veg}</li>
                        <li>{plan.portionHints.water}</li>
                      </ul>
                      {plan.stageNote ? (
                        <p className="mt-3 text-xs leading-5 text-slate-300">{plan.stageNote}</p>
                      ) : null}
                    </div>

                    <div className="mt-3 grid gap-2">
                      {plan.items.map((item) => (
                        <details
                          key={item.day}
                          className="group rounded-2xl border border-white/10 bg-slate-950/30 p-4"
                        >
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-white [&::-webkit-details-marker]:hidden">
                            <span>Ngày {item.day}</span>
                            <span
                              aria-hidden="true"
                              className="text-slate-300 transition group-open:rotate-180"
                            >
                              ▾
                            </span>
                          </summary>

                          <div className="mt-3 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                            <div>
                              <div className="text-xs font-semibold text-slate-300">Bữa sáng</div>
                              <div className="mt-1 text-slate-200">{item.meals.breakfast}</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-300">Bữa trưa</div>
                              <div className="mt-1 text-slate-200">{item.meals.lunch}</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-300">Bữa tối</div>
                              <div className="mt-1 text-slate-200">{item.meals.dinner}</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-300">Snack</div>
                              <div className="mt-1 text-slate-200">{item.meals.snack}</div>
                            </div>
                          </div>

                          {item.note ? (
                            <p className="mt-3 text-xs leading-5 text-slate-300">{item.note}</p>
                          ) : null}
                        </details>
                      ))}
                    </div>

                    <p className="mt-3 text-xs leading-5 text-slate-300">
                      Chuỗi ăn mẫu mang tính tham khảo; bạn có thể hoán đổi món tương đương
                      theo khẩu vị, dị ứng, và điều kiện sức khỏe.
                    </p>
                  </div>
                ) : null}

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs font-semibold text-slate-300">Món dễ chọn (1 ngày mẫu)</div>
                    <div className="mt-3 grid gap-3 text-sm text-slate-300">
                      {suggestions.menu.map((m) => (
                        <div key={m.name}>
                          <div className="font-semibold text-white">{m.name}</div>
                          <ul className="mt-1 list-disc pl-5">
                            {m.items.map((it) => (
                              <li key={it}>{it}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs font-semibold text-slate-300">Danh sách món theo nhóm</div>
                    <div className="mt-3 grid gap-3">
                      <div>
                        <div className="text-sm font-semibold text-white">Protein</div>
                        <DotList items={suggestions.lists.protein} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Carb</div>
                        <DotList items={suggestions.lists.carb} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Rau & trái cây</div>
                        <DotList items={suggestions.lists.veg} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Chất béo tốt</div>
                        <DotList items={suggestions.lists.fat} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
            Nhập thông tin ở bên trái để xem kết quả.
          </div>
        )}
      </section>
    </div>
  );
}

