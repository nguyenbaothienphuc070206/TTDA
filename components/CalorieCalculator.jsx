"use client";

import { useEffect, useMemo, useState } from "react";

import { readJson, writeJson } from "@/lib/storage";
import {
  TRAINING_STAGES,
  clampNumber,
  estimateNutrition,
  mealSuggestions,
} from "@/lib/nutrition";

const NUTRITION_KEY = "vovinam_nutrition_v1";

const DEFAULT_FORM = {
  sex: "male",
  age: 22,
  heightCm: 170,
  weightKg: 60,
  stageId: "moi",
};

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

  const validation = useMemo(() => {
    const errors = [];

    if (!Number.isFinite(age) || age < 10 || age > 80) {
      errors.push("Tuổi nên trong khoảng 10–80.");
    }

    if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 230) {
      errors.push("Chiều cao nên trong khoảng 120–230 cm.");
    }

    if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 200) {
      errors.push("Cân nặng nên trong khoảng 30–200 kg.");
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

  const suggestions = useMemo(() => {
    if (!result) return null;

    return mealSuggestions({
      calories: result.targets.maintain,
      weightKg,
      stageId: form.stageId,
      macros: result.macros,
    });
  }, [result, weightKg, form.stageId]);

  const stage = TRAINING_STAGES.find((s) => s.id === form.stageId) || TRAINING_STAGES[0];

  const onReset = () => {
    setForm(DEFAULT_FORM);
    writeJson(NUTRITION_KEY, DEFAULT_FORM);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
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
