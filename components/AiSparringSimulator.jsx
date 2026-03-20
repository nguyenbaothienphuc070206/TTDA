"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";

import { getBeltById } from "@/data/belts";
import { readProfile } from "@/lib/profile";

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      optionTitle: (i) => `Option ${i + 1}`,
      safety: "Safety",
      imageTooLarge: "Image is too large. Please choose one under ~650KB for faster upload.",
      imageReadError: "Could not read image. Please try another one.",
      needInput: "Please enter a longer scenario (or upload one image).",
      fetchError: "Could not get AI suggestions.",
      invalidData: "Invalid response data. Please try again.",
      premiumTitle: "AI Sparring Arena (Premium)",
      premiumDesc:
        "Safe sparring simulation: describe a scenario (optionally with an image), and AI returns exactly 3 tactical options.",
      premiumUnlock: "Premium unlocks",
      premiumFeat1: "AI Arena: 3 tactical options by belt level",
      premiumFeat2: "AI Coach (RAG): ask about common mistakes and safety",
      premiumFeat3: "Unlock Yellow/Red belt techniques",
      upgrade: "Upgrade to Premium",
      demoNote: "Demo: you can enable Premium in Profile.",
      heading: "AI Sparring Arena",
      belt: "Belt",
      modeDemo: "Safe tactical sparring simulation (demo).",
      scenario: "Scenario",
      scenarioPlaceholder:
        "Example: My opponent keeps rushing in and I run out of breath in round 2. Goal: keep distance and counter safely in one beat.",
      scenarioTip:
        "Tip: include your goal (safety/speed/distance) and opponent habits for better suggestions.",
      image: "Image (optional)",
      selectedImage: (name) => `Selected: ${name}`,
      imageHint: "You can upload an image so AI can read context (if OpenAI is configured).",
      loading: "Simulating…",
      generate: "Generate 3 options",
      footerNote:
        "Note: these are club sparring suggestions. If pain/injury appears, stop and consult your coach.",
    };
  }

  if (id === "ja") {
    return {
      optionTitle: (i) => `戦術案 ${i + 1}`,
      safety: "安全",
      imageTooLarge: "画像サイズが大きすぎます。送信を速くするため ~650KB 以下を選んでください。",
      imageReadError: "画像を読み込めませんでした。別の画像をお試しください。",
      needInput: "もう少し詳しい状況を書いてください（または画像を1枚選択）。",
      fetchError: "AI提案を取得できませんでした。",
      invalidData: "返却データが不正です。再試行してください。",
      premiumTitle: "AIスパーリングアリーナ（プレミアム）",
      premiumDesc:
        "安全なスパーリングシミュレーション。状況（画像添付可）を入力すると、AIが戦術案を3つ返します。",
      premiumUnlock: "プレミアムで開放",
      premiumFeat1: "AIアリーナ: 帯レベル別に戦術案3つ",
      premiumFeat2: "AIコーチ（RAG）: よくあるミスと安全を質問",
      premiumFeat3: "黄帯・紅帯技術を開放",
      upgrade: "プレミアムへアップグレード",
      demoNote: "デモ: プロフィールでプレミアムを有効化できます。",
      heading: "AIスパーリングアリーナ",
      belt: "帯レベル",
      modeDemo: "安全重視の戦術スパーリングシミュレーション（デモ）。",
      scenario: "状況",
      scenarioPlaceholder:
        "例: 相手が前に詰めてきて、2ラウンド目で息が上がりやすい。目標: 距離を保ち、安全に1拍でカウンターしたい。",
      scenarioTip:
        "ヒント: 目的（安全/速度/距離）と相手の癖を明記すると提案精度が上がります。",
      image: "画像（任意）",
      selectedImage: (name) => `選択済み: ${name}`,
      imageHint: "画像を添付すると、AIが文脈を読み取れます（OpenAI設定時）。",
      loading: "シミュレーション中…",
      generate: "戦術案を3つ生成",
      footerNote:
        "注意: これは道場練習向けの提案です。痛みやけががある場合は中止し、指導者に相談してください。",
    };
  }

  return {
    optionTitle: (i) => `Phương án ${i + 1}`,
    safety: "An toàn",
    imageTooLarge: "Ảnh hơi lớn. Hãy chọn ảnh dưới ~650KB để gửi nhanh.",
    imageReadError: "Không đọc được ảnh. Bạn thử ảnh khác nhé.",
    needInput: "Bạn nhập tình huống dài hơn một chút (hoặc chọn 1 ảnh).",
    fetchError: "Không lấy được gợi ý AI.",
    invalidData: "Dữ liệu trả về không hợp lệ. Bạn thử lại nhé.",
    premiumTitle: "Đấu trường AI (Premium)",
    premiumDesc:
      "Mô phỏng sparring an toàn: nhập tình huống (và có thể kèm ảnh), AI trả về đúng 3 phương án chiến thuật.",
    premiumUnlock: "Premium mở khóa",
    premiumFeat1: "Đấu trường AI: 3 phương án chiến thuật theo cấp đai",
    premiumFeat2: "AI Coach (RAG) hỏi lỗi thường gặp & an toàn",
    premiumFeat3: "Mở khóa kỹ thuật Hoàng/Hồng đai",
    upgrade: "Nâng cấp Premium",
    demoNote: "Demo: bạn có thể bật Premium trong Hồ sơ.",
    heading: "Đấu trường AI",
    belt: "Cấp đai",
    modeDemo: "Mô phỏng chiến thuật sparring an toàn (demo).",
    scenario: "Tình huống",
    scenarioPlaceholder:
      "Ví dụ: Đối thủ hay lao vào, mình dễ hụt hơi hiệp 2. Mục tiêu: giữ khoảng cách và phản 1 nhịp an toàn.",
    scenarioTip: "Mẹo: ghi rõ mục tiêu (an toàn / tốc độ / khoảng cách) và thói quen đối thủ.",
    image: "Ảnh (tuỳ chọn)",
    selectedImage: (name) => `Đã chọn: ${name}`,
    imageHint: "Bạn có thể gửi ảnh để AI đọc bối cảnh (nếu có cấu hình OpenAI).",
    loading: "Đang mô phỏng…",
    generate: "Tạo 3 phương án",
    footerNote:
      "Lưu ý: Đây là gợi ý tập đối luyện trong CLB. Nếu có đau/chấn thương, ưu tiên nghỉ và hỏi HLV.",
  };
}

function OptionCard({ option, index, copy }) {
  const title = String(option?.title || "").trim();
  const when = String(option?.when || "").trim();
  const safety = String(option?.safety || "").trim();
  const steps = Array.isArray(option?.steps) ? option.steps : [];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-slate-950 font-extrabold">
          {index + 1}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white">{title || copy.optionTitle(index)}</div>
          {when ? <div className="mt-1 text-xs text-slate-300">{when}</div> : null}
        </div>
      </div>

      {steps.length ? (
        <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-300">
          {steps.map((s, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
              <span>{String(s)}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {safety ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-xs leading-5 text-slate-200">
          <span className="font-semibold">{copy.safety}:</span> {safety}
        </div>
      ) : null}
    </div>
  );
}

export default function AiSparringSimulator() {
  const locale = useLocale();
  const copy = getCopy(locale);

  const [profile, setProfile] = useState(() => readProfile());
  const [scenario, setScenario] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("");
  const [options, setOptions] = useState([]);

  const abortRef = useRef(null);

  const isPremium = profile?.planId === "premium";

  useEffect(() => {
    const sync = () => setProfile(readProfile());
    sync();
    window.addEventListener("vovinam-profile", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vovinam-profile", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const beltTitle = useMemo(() => {
    const belt = getBeltById(String(profile?.beltId || ""));
    return String(belt?.title || "").trim();
  }, [profile?.beltId]);

  const onPickImage = (e) => {
    setError("");
    setOptions([]);
    setMode("");

    const file = e?.target?.files?.[0] || null;
    if (!file) {
      setImageName("");
      setImageDataUrl("");
      return;
    }

    if (typeof file.size === "number" && file.size > 650_000) {
      setImageName("");
      setImageDataUrl("");
      setError(copy.imageTooLarge);
      return;
    }

    setImageName(String(file.name || ""));

    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(String(reader.result || ""));
    };
    reader.onerror = () => {
      setImageName("");
      setImageDataUrl("");
      setError(copy.imageReadError);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const s = String(scenario || "").trim();
    const hasInput = Boolean(s.length >= 8 || imageDataUrl);

    if (!hasInput) {
      setError(copy.needInput);
      return;
    }

    setLoading(true);
    setError("");
    setMode("");
    setOptions([]);

    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch {
        // ignore
      }
    }

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const payload = {
        scenario: s,
        name: profile?.name,
        beltId: profile?.beltId,
        imageDataUrl: imageDataUrl || undefined,
      };

      const res = await fetch("/api/ai/sparring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = String(data?.error || copy.fetchError);
        throw new Error(msg);
      }

      const list = Array.isArray(data?.options) ? data.options : [];
      if (list.length !== 3) {
        throw new Error(copy.invalidData);
      }

      setOptions(list);
      setMode(String(data?.mode || ""));
    } catch (err) {
      if (err?.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : copy.fetchError;
      setError(String(msg || copy.fetchError));
    } finally {
      setLoading(false);
    }
  };

  if (!isPremium) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-8 rounded-[2.75rem] bg-[radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.10),transparent_60%)] blur-2xl"
        />

        <div className="relative">
          <h2 className="text-xl font-semibold text-white">{copy.premiumTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {copy.premiumDesc}
          </p>

          <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/30 p-5 text-sm leading-6 text-slate-200">
            <div className="text-xs font-semibold text-slate-300">{copy.premiumUnlock}</div>
            <ul className="mt-2 grid gap-1">
              <li>• {copy.premiumFeat1}</li>
              <li>• {copy.premiumFeat2}</li>
              <li>• {copy.premiumFeat3}</li>
            </ul>
          </div>

          <div className="mt-5">
            <Link
              href="/ho-so#goi-premium"
              className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
            >
              {copy.upgrade}
            </Link>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              {copy.demoNote}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <form
        onSubmit={onSubmit}
        className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">{copy.heading}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {beltTitle ? (
                <>
                  {copy.belt}: <span className="font-semibold text-white">{beltTitle}</span>. 
                </>
              ) : null}
              {copy.modeDemo}
            </p>
          </div>

          {mode ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
              {mode === "openai" ? "OpenAI" : "Heuristic"}
            </span>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3">
          <label className="block rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs font-semibold text-slate-200">{copy.scenario}</div>
            <textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="mt-2 min-h-[110px] w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
              placeholder={copy.scenarioPlaceholder}
            />
            <div className="mt-2 text-xs text-slate-300">
              {copy.scenarioTip}
            </div>
          </label>

          <label className="block rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs font-semibold text-slate-200">{copy.image}</div>
            <input
              type="file"
              accept="image/*"
              onChange={onPickImage}
              className="mt-2 block w-full text-sm text-slate-200 file:mr-3 file:rounded-xl file:border file:border-white/10 file:bg-white/5 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-200 hover:file:bg-white/10"
            />
            <div className="mt-2 text-xs text-slate-300">
              {imageName ? copy.selectedImage(imageName) : copy.imageHint}
            </div>
          </label>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className={
            "mt-4 inline-flex h-12 w-full items-center justify-center rounded-2xl px-5 text-sm font-semibold transition focus:outline-none focus:ring-2 " +
            (loading
              ? "border border-white/10 bg-white/5 text-slate-300 focus:ring-cyan-300/30"
              : "bg-gradient-to-r from-cyan-300 to-blue-500 text-slate-950 hover:brightness-110 focus:ring-cyan-300/50")
          }
        >
          {loading ? copy.loading : copy.generate}
        </button>

        <p className="mt-3 text-xs leading-5 text-slate-400">
          {copy.footerNote}
        </p>
      </form>

      {options.length ? (
        <div className="grid gap-3 lg:grid-cols-3">
          {options.map((opt, idx) => (
            <OptionCard key={idx} option={opt} index={idx} copy={copy} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
