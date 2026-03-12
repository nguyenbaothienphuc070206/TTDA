"use client";

import { useMemo, useState } from "react";

import { TECHNIQUE_CATEGORIES, TECHNIQUES } from "@/data/wiki";
import { trackView } from "@/lib/analytics";

function matches(text, q) {
  const t = String(text || "").toLowerCase();
  const query = String(q || "").toLowerCase().trim();
  if (!query) return true;
  return t.includes(query);
}

function difficultyLabel(d) {
  if (d === "easy") return "Dễ";
  if (d === "medium") return "Vừa";
  if (d === "hard") return "Khó";
  return "-";
}

export default function TechniqueLibrary() {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const filtered = useMemo(() => {
    return TECHNIQUES.filter((t) => {
      if (categoryId !== "all" && t.categoryId !== categoryId) return false;
      if (difficulty !== "all" && t.difficulty !== difficulty) return false;

      const hay = [t.title, t.summary, ...(t.tags || [])].join(" ");
      return matches(hay, query);
    });
  }, [query, categoryId, difficulty]);

  const onReset = () => {
    setQuery("");
    setCategoryId("all");
    setDifficulty("all");
  };

  return (
    <div className="grid gap-4">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <div className="grid gap-3 lg:grid-cols-4">
          <label className="block lg:col-span-2">
            <div className="text-xs font-semibold text-slate-200">Tìm kiếm</div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ví dụ: đá, tấn, khóa gỡ, phản đòn…"
              className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
            />
          </label>

          <label className="block">
            <div className="text-xs font-semibold text-slate-200">Nhóm kỹ thuật</div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
            >
              <option value="all">Tất cả</option>
              {TECHNIQUE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="text-xs font-semibold text-slate-200">Độ khó</div>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
            >
              <option value="all">Tất cả</option>
              <option value="easy">Dễ</option>
              <option value="medium">Vừa</option>
              <option value="hard">Khó</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-300">
            Tìm thấy <span className="font-semibold text-white">{filtered.length}</span> kỹ thuật.
          </p>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            Reset lọc
          </button>
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        {filtered.map((t) => {
          const cat = TECHNIQUE_CATEGORIES.find((c) => c.id === t.categoryId);

          return (
            <details
              key={t.slug}
              id={t.slug}
              className="group rounded-3xl border border-white/10 bg-white/5 p-5 open:bg-white/10"
              onToggle={(e) => {
                if (e.currentTarget.open) {
                  trackView({ type: "technique", id: t.slug });
                }
              }}
            >
              <summary className="cursor-pointer list-none">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-white">
                      {t.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      {t.summary}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200">
                        {cat?.title || "Kỹ thuật"}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
                        Độ khó: {difficultyLabel(t.difficulty)}
                      </span>
                      {(t.tags || []).slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="h-10 w-10 shrink-0 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-300/15 to-blue-500/10" />
                </div>
              </summary>

              <div className="mt-4 grid gap-3">
                <section className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <div className="text-xs font-semibold text-slate-300">Các bước</div>
                  <ol className="mt-2 grid gap-2 text-sm leading-6 text-slate-300">
                    {t.steps.map((s, idx) => (
                      <li key={s} className="flex gap-3">
                        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xs font-semibold text-white">
                          {idx + 1}
                        </span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </section>

                <div className="grid gap-3 sm:grid-cols-2">
                  <section className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <div className="text-xs font-semibold text-slate-300">Lỗi thường gặp</div>
                    <ul className="mt-2 grid gap-2 text-sm leading-6 text-slate-300">
                      {t.mistakes.map((m) => (
                        <li key={m} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <div className="text-xs font-semibold text-slate-300">An toàn</div>
                    <ul className="mt-2 grid gap-2 text-sm leading-6 text-slate-300">
                      {t.safety.map((m) => (
                        <li key={m} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
