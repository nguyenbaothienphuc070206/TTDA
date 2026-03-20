"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";

function clamp01(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function phaseFromElapsed(elapsedMs, labels) {
  const t = Math.max(0, Number(elapsedMs) || 0) / 1000;
  const cycle = 16;
  const phaseLen = 4;
  const within = t % cycle;
  const phaseIndex = Math.floor(within / phaseLen);
  const phaseT = within - phaseIndex * phaseLen;
  const progress = clamp01(phaseT / phaseLen);

  const phases = Array.isArray(labels) && labels.length === 4
    ? labels
    : ["Hít vào", "Giữ", "Thở ra", "Giữ"];
  const label = phases[Math.max(0, Math.min(phases.length - 1, phaseIndex))] || "";

  const secondsLeft = Math.max(0, phaseLen - Math.floor(phaseT) - 1);

  // Scale envelope: inhale expands, exhale contracts.
  const minS = 0.86;
  const maxS = 1.04;
  let scale = minS;

  if (phaseIndex === 0) {
    scale = minS + (maxS - minS) * progress;
  } else if (phaseIndex === 1) {
    scale = maxS;
  } else if (phaseIndex === 2) {
    scale = maxS - (maxS - minS) * progress;
  } else {
    scale = minS;
  }

  return { label, progress, scale, secondsLeft, withinSec: within, cycleSec: cycle };
}

function useMeditationAudio() {
  const ctxRef = useRef(null);
  const gainRef = useRef(null);
  const oscARef = useRef(null);
  const oscBRef = useRef(null);

  const stopAudio = async () => {
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    const oscA = oscARef.current;
    const oscB = oscBRef.current;

    if (gain && ctx) {
      try {
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0.0001, now + 0.18);
      } catch {
        // ignore
      }
    }

    setTimeout(() => {
      try {
        oscA?.stop?.();
      } catch {
        // ignore
      }
      try {
        oscB?.stop?.();
      } catch {
        // ignore
      }

      try {
        ctx?.close?.();
      } catch {
        // ignore
      }

      ctxRef.current = null;
      gainRef.current = null;
      oscARef.current = null;
      oscBRef.current = null;
    }, 220);
  };

  const startAudio = async () => {
    if (typeof window === "undefined") return;

    await stopAudio();

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;

    const oscA = ctx.createOscillator();
    oscA.type = "sine";
    oscA.frequency.value = 174; // soft drone

    const oscB = ctx.createOscillator();
    oscB.type = "triangle";
    oscB.frequency.value = 87;

    oscA.connect(gain);
    oscB.connect(gain);
    gain.connect(ctx.destination);

    try {
      await ctx.resume();
    } catch {
      // ignore
    }

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.02, now + 0.22);

    oscA.start();
    oscB.start();

    ctxRef.current = ctx;
    gainRef.current = gain;
    oscARef.current = oscA;
    oscBRef.current = oscB;
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return { startAudio, stopAudio };
}

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      phases: ["Inhale", "Hold", "Exhale", "Hold"],
      title: "Box Breathing",
      description:
        "4-4-4-4 rhythm: Inhale • Hold • Exhale • Hold. Goal: stay calm, keep steady breathing, and control power.",
      running: "Breathing",
      paused: "Paused",
      remaining: (s) => `${s}s left`,
      cycle: (p) => `${p}% cycle`,
      pause: "Pause",
      start: "Start",
      reset: "Reset",
      soundOff: "Turn ambient sound off",
      soundOn: "Turn ambient sound on",
      warning:
        "If you feel dizzy or uncomfortable: stop, return to normal breathing, and drink water.",
      quickTips: "Quick tips",
      tip1: "Before sparring: breathe for 4 cycles to stabilize rhythm.",
      tip2: "If short of breath in round 2: extend exhale and reduce pace for 1-2 cycles.",
      tip3: "Goal: keep clean technique, avoid neck/shoulder tension.",
      breathTip: "Breathing tip",
      breathTipDesc:
        "Inhale gently through the nose • keep your core steady • exhale slowly (longer) to lower heart rate.",
      badge: "MEDITATION",
    };
  }

  if (id === "ja") {
    return {
      phases: ["吸う", "止める", "吐く", "止める"],
      title: "ボックス呼吸",
      description:
        "4-4-4-4 のリズム: 吸う • 止める • 吐く • 止める。目的は落ち着き、呼吸を整え、力をコントロールすることです。",
      running: "呼吸中",
      paused: "一時停止",
      remaining: (s) => `残り ${s}秒`,
      cycle: (p) => `サイクル ${p}%`,
      pause: "一時停止",
      start: "開始",
      reset: "リセット",
      soundOff: "環境音をオフ",
      soundOn: "環境音をオン",
      warning:
        "めまい・不快感がある場合は中止し、通常呼吸に戻って水分を補給してください。",
      quickTips: "クイックヒント",
      tip1: "スパー前に4サイクル呼吸してリズムを整える。",
      tip2: "2ラウンド目で息切れしたら、吐く時間を長くして1-2回ペースを落とす。",
      tip3: "目的は正確な技術を保ち、首や肩に力を入れすぎないこと。",
      breathTip: "呼吸のコツ",
      breathTipDesc:
        "鼻からやさしく吸う • 体幹を安定 • ゆっくり長く吐いて心拍を落ち着かせる。",
      badge: "瞑想",
    };
  }

  return {
    phases: ["Hít vào", "Giữ", "Thở ra", "Giữ"],
    title: "Box Breathing",
    description:
      "Nhịp 4-4-4-4: Hít vào • Giữ • Thở ra • Giữ. Mục tiêu: bình tĩnh, nhịp thở đều, kiểm soát lực.",
    running: "Đang thở",
    paused: "Tạm dừng",
    remaining: (s) => `còn ${s}s`,
    cycle: (p) => `${p}% chu kỳ`,
    pause: "Tạm dừng",
    start: "Bắt đầu",
    reset: "Reset",
    soundOff: "Tắt âm nền",
    soundOn: "Bật âm nền",
    warning: "Nếu bạn thấy chóng mặt/khó chịu: dừng lại, thở bình thường, uống nước.",
    quickTips: "Gợi ý nhanh",
    tip1: "Trước khi tập đối luyện: thở 4 chu kỳ để ổn nhịp.",
    tip2: "Khi hụt hơi hiệp 2: thở ra dài, giảm nhịp 1-2 lần rồi vào lại.",
    tip3: "Mục tiêu: giữ kỹ thuật sạch - không gồng cổ/vai.",
    breathTip: "Mẹo thở",
    breathTipDesc: "Hít bằng mũi nhẹ • Giữ bụng ổn • Thở ra chậm (dài hơn) để tim hạ nhịp.",
    badge: "THIỀN VÕ",
  };
}

export default function ThienVoBreathing() {
  const locale = useLocale();
  const copy = getCopy(locale);

  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [soundOn, setSoundOn] = useState(false);

  const { startAudio, stopAudio } = useMeditationAudio();

  useEffect(() => {
    if (!running) return;

    const startedAt = Date.now() - (Number(elapsedMs) || 0);
    const t = setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 80);

    return () => clearInterval(t);
  }, [running, elapsedMs]);

  useEffect(() => {
    if (!soundOn) return;
    startAudio();
    return () => {
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundOn]);

  const phase = useMemo(() => phaseFromElapsed(elapsedMs, copy.phases), [copy.phases, elapsedMs]);
  const cyclePct = Math.round((phase.withinSec / Math.max(1, phase.cycleSec)) * 100);

  const onToggleRun = () => {
    setRunning((v) => !v);
  };

  const onReset = () => {
    setRunning(false);
    setElapsedMs(0);
  };

  const onToggleSound = () => {
    setSoundOn((v) => !v);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px] lg:items-start">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">{copy.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {copy.description}
            </p>
          </div>

          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
            {running ? copy.running : copy.paused}
          </span>
        </div>

        <div className="mt-6 grid place-items-center">
          <div className="relative grid place-items-center">
            <div
              aria-hidden
              className="absolute -inset-10 rounded-full bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_55%)] blur-2xl"
            />

            <div
              className="relative grid place-items-center rounded-full border border-white/10 bg-slate-950/30"
              style={{
                width: 260,
                height: 260,
                transform: `scale(${phase.scale})`,
                transition: "transform 120ms linear",
              }}
            >
              <div className="absolute inset-0 rounded-full border border-cyan-300/20" />
              <div className="text-center">
                <div className="text-xs font-semibold text-slate-300 tracking-widest">{copy.badge}</div>
                <div className="mt-2 text-2xl font-semibold text-white">{phase.label}</div>
                <div className="mt-1 text-sm text-slate-300">{copy.remaining(phase.secondsLeft + 1)}</div>
              </div>
            </div>

            <div className="mt-6 w-full max-w-sm">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-cyan-300 to-blue-500 progress-bar"
                  style={{ width: `${cyclePct}%` }}
                />
              </div>
              <div className="mt-2 text-center text-xs text-slate-300">{copy.cycle(cyclePct)}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onToggleRun}
            className={
              "inline-flex h-12 flex-1 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition focus:outline-none focus:ring-2 " +
              (running
                ? "border border-white/10 bg-white/5 text-white hover:bg-white/10 focus:ring-cyan-300/30"
                : "bg-gradient-to-r from-cyan-300 to-blue-500 text-slate-950 hover:brightness-110 focus:ring-cyan-300/50")
            }
          >
            {running ? copy.pause : copy.start}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            {copy.reset}
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            className={
              "inline-flex h-12 flex-1 items-center justify-center rounded-2xl border px-5 text-sm font-semibold transition focus:outline-none focus:ring-2 " +
              (soundOn
                ? "border-amber-300/25 bg-amber-400/10 text-amber-100 focus:ring-amber-300/30"
                : "border-white/10 bg-white/5 text-white hover:bg-white/10 focus:ring-cyan-300/30")
            }
          >
            {soundOn ? copy.soundOff : copy.soundOn}
          </button>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-400">
          {copy.warning}
        </p>
      </section>

      <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)]">
        <h3 className="text-lg font-semibold text-white">{copy.quickTips}</h3>
        <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
          <p>• {copy.tip1}</p>
          <p>• {copy.tip2}</p>
          <p>• {copy.tip3}</p>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/30 p-5">
          <div className="text-xs font-semibold text-slate-300">{copy.breathTip}</div>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            {copy.breathTipDesc}
          </p>
        </div>
      </aside>
    </div>
  );
}

