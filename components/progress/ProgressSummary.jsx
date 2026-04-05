"use client";

import { useMemo, useRef, useState } from "react";

import { popConfettiFromElement } from "@/lib/confetti";

const META_KEY = "vovinam-progress-meta-v2";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toYmd(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function getInitialMeta() {
  if (typeof window === "undefined") {
    return { streakDays: 7, maxStreak: 14, lastCheckInDate: "" };
  }

  try {
    const raw = window.localStorage.getItem(META_KEY);
    if (!raw) {
      return { streakDays: 7, maxStreak: 14, lastCheckInDate: "" };
    }

    const parsed = JSON.parse(raw);
    return {
      streakDays: clamp(Number(parsed?.streakDays || 7), 0, 365),
      maxStreak: clamp(Number(parsed?.maxStreak || 14), 0, 365),
      lastCheckInDate: String(parsed?.lastCheckInDate || ""),
    };
  } catch {
    return { streakDays: 7, maxStreak: 14, lastCheckInDate: "" };
  }
}

function saveMeta(meta) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    // ignore write errors
  }
}

function Radar({ values }) {
  const labels = ["Kỹ thuật", "Thể lực", "Phản xạ", "Kỷ luật"];
  const points = useMemo(() => {
    const cx = 110;
    const cy = 110;
    const r = 82;

    return values.map((v, idx) => {
      const ratio = clamp(v, 0, 100) / 100;
      const angle = ((Math.PI * 2) / values.length) * idx - Math.PI / 2;
      return {
        x: cx + Math.cos(angle) * r * ratio,
        y: cy + Math.sin(angle) * r * ratio,
        lx: cx + Math.cos(angle) * (r + 22),
        ly: cy + Math.sin(angle) * (r + 22),
      };
    });
  }, [values]);

  const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
      <div className="text-xs font-semibold text-slate-300">Skill Radar</div>
      <svg viewBox="0 0 220 220" className="mt-3 w-full max-w-[280px]">
        <circle cx="110" cy="110" r="82" fill="none" stroke="rgba(148,163,184,0.25)" />
        <circle cx="110" cy="110" r="56" fill="none" stroke="rgba(148,163,184,0.18)" />
        <circle cx="110" cy="110" r="30" fill="none" stroke="rgba(148,163,184,0.14)" />
        <polygon points={polygon} fill="rgba(34, 211, 238, 0.26)" stroke="rgba(56, 189, 248, 0.9)" strokeWidth="2" />
        {points.map((p, idx) => (
          <g key={labels[idx]}>
            <line x1="110" y1="110" x2={p.lx} y2={p.ly} stroke="rgba(148,163,184,0.22)" />
            <circle cx={p.x} cy={p.y} r="3" fill="rgba(34, 211, 238, 1)" />
            <text x={p.lx} y={p.ly} fill="rgba(226,232,240,0.9)" fontSize="10" textAnchor="middle" dominantBaseline="middle">
              {labels[idx]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function ProgressSummary({ rows }) {
  const list = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);
  const [meta, setMeta] = useState(getInitialMeta);
  const [checkMessage, setCheckMessage] = useState("");
  const checkButtonRef = useRef(null);

  const totalLessons = 56;
  const completed = list.filter((x) => Boolean(x?.completed)).length;
  const completionPercent = clamp(Math.round((completed / totalLessons) * 100), 0, 100);

  const insight = useMemo(() => {
    const ids = list.map((x) => String(x?.lesson_id || "").toLowerCase());
    const hasKhoaGo = ids.some((id) => id.includes("khoa-go") || id.includes("khoa_go"));
    const phanDonCount = ids.filter((id) => id.includes("phan-don") || id.includes("phan_don")).length;

    const out = [];
    if (!hasKhoaGo) out.push("Bạn hay bỏ qua Khóa gỡ.");
    if (phanDonCount < 2) out.push("Bạn yếu ở phản đòn, nên thêm 2 buổi/tuần.");
    if (!out.length) out.push("Bạn giữ nhịp ổn, hãy tăng cường biến thể nâng cao.");
    return out;
  }, [list]);

  const scores = useMemo(() => {
    const reflexBonus = insight.some((x) => x.toLowerCase().includes("phản đòn")) ? 0 : 8;
    return [
      clamp(48 + completionPercent * 0.45, 0, 100),
      clamp(44 + meta.streakDays * 1.8, 0, 100),
      clamp(38 + completionPercent * 0.3 + reflexBonus, 0, 100),
      clamp(42 + meta.streakDays * 2.2, 0, 100),
    ].map((x) => Math.round(x));
  }, [completionPercent, insight, meta.streakDays]);

  const onCheckIn = () => {
    const now = new Date();
    const today = toYmd(now);

    if (meta.lastCheckInDate === today) {
      setCheckMessage("Hôm nay bạn đã check-in rồi. Giữ nhịp rất tốt.");
      return;
    }

    const last = meta.lastCheckInDate ? new Date(`${meta.lastCheckInDate}T00:00:00`) : null;
    const diffDays = last ? Math.floor((now - last) / 86400000) : 1;
    const nextStreak = diffDays <= 1 ? meta.streakDays + 1 : 1;
    const next = {
      streakDays: clamp(nextStreak, 1, 365),
      maxStreak: Math.max(meta.maxStreak, nextStreak),
      lastCheckInDate: today,
    };

    setMeta(next);
    saveMeta(next);
    setCheckMessage(`Check-in thành công. Streak hiện tại: ${next.streakDays} ngày.`);
    popConfettiFromElement(checkButtonRef.current);
  };

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Tiến độ tổng: {completionPercent}%</div>
            <p className="mt-1 text-xs text-slate-200">{completed}/{totalLessons} bài hoàn thành</p>
          </div>
          <button
            ref={checkButtonRef}
            type="button"
            onClick={onCheckIn}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-xs font-semibold text-slate-950 transition hover:brightness-110 active:scale-[0.99]"
          >
            Check-in hôm nay
          </button>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="progress-bar h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        {checkMessage ? <div className="mt-2 text-xs text-cyan-100">{checkMessage}</div> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_1fr]">
        <Radar values={scores} />

        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <div className="text-xs font-semibold text-slate-300">Streak</div>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full border border-emerald-300/25 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-100">
                {meta.streakDays} ngày liên tục
              </span>
              <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 font-semibold text-cyan-100">
                Kỷ lục: {meta.maxStreak} ngày
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <div className="text-xs font-semibold text-slate-300">Insight AI</div>
            <ul className="mt-2 grid gap-1 text-sm text-slate-100">
              {insight.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
