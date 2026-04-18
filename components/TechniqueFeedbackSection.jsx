"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const TECHNIQUES = [
  {
    id: "da-tong-truoc",
    title: "Đá tống trước",
    videoNormal: "Video chuẩn (thường)",
    videoSlow: "Video chuẩn (chậm 0.5x)",
    checklist: [
      "Nâng gối đúng hướng (ngang hông)",
      "Giữ trục cơ thể thẳng",
      "Duỗi chân dứt khoát",
      "Thu chân về nhanh",
      "Giữ tay gác (guard) ổn định",
    ],
    commonErrors: [
      "Ngả người ra sau -> mất thăng bằng",
      "Gối lệch hướng -> lực yếu",
      "Không thu chân -> dễ bị phản đòn",
    ],
    fixes: [
      "Tập chậm 50% tốc độ",
      "Tập trước gương",
      "Giữ gối cố định 1 giây trước khi đá",
    ],
    progressFocus: "Giữ trục cơ thể tốt hơn",
    attentionFocus: "Thu chân nhanh sau khi đá",
    errorTags: ["Lệch trục", "Gối lệch", "Guard chưa ổn", "Thu chân chậm", "Sai nhịp"],
    goal: "Đá ổn định 10 lần liên tiếp mà không mất thăng bằng.",
  },
  {
    id: "dam-thang",
    title: "Đấm thẳng",
    videoNormal: "Video mẫu đấm thẳng (thường)",
    videoSlow: "Video mẫu đấm thẳng (chậm 0.5x)",
    checklist: [
      "Lực đi từ chân -> hông -> tay",
      "Vai không nhô cao",
      "Thu tay về nhanh",
      "Tay còn lại giữ gác",
    ],
    commonErrors: [
      "Đấm bằng tay đơn thuần -> lực yếu",
      "Không thu tay -> bị hở",
      "Mất nhịp thở",
    ],
    fixes: ["Tập shadow boxing chậm", "Nhấn hông khi ra đòn", "Giữ nhịp thở đều"],
    progressFocus: "Nhịp đòn ổn định hơn",
    attentionFocus: "Thu tay nhanh và kín hơn",
    errorTags: ["Thu tay chậm", "Vai nâng cao", "Guard hở", "Mất nhịp thở"],
    goal: "Thực hiện 20 cú đấm thẳng liên tục, form không vỡ.",
  },
  {
    id: "tan-trung-binh",
    title: "Tấn trung bình",
    videoNormal: "Video tấn trung bình (thường)",
    videoSlow: "Video tấn trung bình (chậm 0.5x)",
    checklist: [
      "Gối theo hướng mũi chân",
      "Lưng giữ thẳng",
      "Trọng tâm ổn định",
      "Nhịp thở đều",
    ],
    commonErrors: ["Gối đổ vào trong", "Lưng cong", "Nhấc gót chân trụ"],
    fixes: ["Giữ tấn 30 giây", "Tập trước gương", "Giảm biên độ để giữ form"],
    progressFocus: "Trọng tâm ổn định hơn",
    attentionFocus: "Giữ lưng thẳng khi cuối hiệp",
    errorTags: ["Lưng cong", "Gối đổ vào trong", "Mất trọng tâm", "Nhịp thở rối"],
    goal: "Giữ tấn chuẩn 30 giây x 3 hiệp, không gãy lưng.",
  },
  {
    id: "da-vong-cau",
    title: "Đá vòng cầu",
    videoNormal: "Video đá vòng cầu (thường)",
    videoSlow: "Video đá vòng cầu (chậm 0.5x)",
    checklist: [
      "Xoay hông rõ ràng",
      "Chân trụ xoay đúng hướng",
      "Đường đá ngang mục tiêu",
      "Thu chân nhanh về guard",
    ],
    commonErrors: ["Không xoay hông -> mất lực", "Chân trụ đứng cứng", "Đá xong mất thăng bằng"],
    fixes: ["Tập riêng động tác xoay hông", "Tập đá thấp trước", "Giữ trục khi thu chân"],
    progressFocus: "Xoay hông đúng nhịp hơn",
    attentionFocus: "Chân trụ cần xoay đủ góc",
    errorTags: ["Chân trụ không xoay", "Mất thăng bằng", "Thiếu xoay hông", "Thu chân chậm"],
    goal: "Đá vòng cầu 10 lần mỗi bên, giữ trục ổn định.",
  },
  {
    id: "thoat-nam-co-tay",
    title: "Thoát nắm cổ tay",
    videoNormal: "Video thoát nắm cổ tay (thường)",
    videoSlow: "Video thoát nắm cổ tay (chậm 0.5x)",
    checklist: [
      "Xoay theo hướng ngón cái",
      "Bước góc để tạo không gian",
      "Giật dứt khoát",
      "Giữ guard sau khi thoát",
    ],
    commonErrors: ["Kéo thẳng tay -> khó thoát", "Không bước góc", "Ra đòn quá chậm"],
    fixes: ["Tập chậm theo từng bước", "Đánh dấu vị trí chân", "Luyện phản xạ theo nhịp"],
    progressFocus: "Bước góc rõ hơn trước",
    attentionFocus: "Tăng độ dứt khoát khi giật tay",
    errorTags: ["Sai hướng xoay", "Không bước góc", "Thiếu dứt khoát", "Phản xạ chậm"],
    goal: "Thoát nắm chính xác 8/10 lần với cùng một setup.",
  },
];

const STORAGE_KEY = "vovinam-technique-feedback-v1";
const ANALYSIS_STEPS = [
  "Đang tải video...",
  "Đang phân tích chuyển động...",
  "Đang kiểm tra trục cơ thể...",
  "Đang đánh giá kỹ thuật...",
];

const FEEDBACK_PROFILES = {
  1: {
    title: "Cần cải thiện nhiều",
    comments: [
      "Kỹ thuật chưa đúng, trục cơ thể lệch rõ và nhịp ra đòn chưa ổn.",
      "Bạn đang mất kiểm soát ở nhiều pha, cần quay lại bước cơ bản.",
    ],
    suggestions: [
      "Tập lại từ đầu với tốc độ chậm, tập trung từng bước.",
      "Giảm cường độ và luyện theo checklist trước gương mỗi ngày.",
    ],
    scoreRange: [2, 5],
  },
  2: {
    title: "Cần cải thiện",
    comments: [
      "Bạn đã nắm ý chính nhưng form chưa ổn định, dễ mất thăng bằng.",
      "Kỹ thuật còn rời rạc, nhịp và trục chưa phối hợp tốt.",
    ],
    suggestions: [
      "Tập chậm trước gương và kiểm soát từng động tác.",
      "Tách bài thành từng đoạn ngắn, hoàn thiện từng đoạn rồi ghép lại.",
    ],
    scoreRange: [4, 6],
  },
  3: {
    title: "Ổn nhưng cần cải thiện",
    comments: [
      "Form cơ bản đã có, nhưng một vài pha vẫn thiếu ổn định.",
      "Kỹ thuật tạm ổn, cần chỉnh thêm để đòn chắc và an toàn hơn.",
    ],
    suggestions: [
      "Tập chậm 10 lần trước gương mỗi ngày.",
      "Giữ nhịp đều, ưu tiên độ chính xác trước tốc độ.",
    ],
    scoreRange: [5, 8],
  },
  4: {
    title: "Khá tốt",
    comments: [
      "Form khá ổn, chỉ cần tăng độ dứt khoát ở pha kết thúc.",
      "Bạn kiểm soát tốt, có thể nâng tốc độ dần để tối ưu hiệu quả.",
    ],
    suggestions: [
      "Tăng tốc dần sau khi đã kiểm soát chắc kỹ thuật.",
      "Thêm 1 hiệp tốc độ vừa để cải thiện nhịp phản xạ.",
    ],
    scoreRange: [7, 9],
  },
  5: {
    title: "Rất tốt",
    comments: [
      "Kỹ thuật tốt, giữ được trục và nhịp ổn định.",
      "Động tác gọn và có kiểm soát, bạn có thể chuyển sang biến thể nâng cao.",
    ],
    suggestions: [
      "Giữ nhịp hiện tại và thêm bài nâng cao để mở rộng kỹ năng.",
      "Duy trì chất lượng động tác, sau đó tăng cường độ theo chu kỳ.",
    ],
    scoreRange: [8, 10],
  },
};

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sampleErrors(candidates, count) {
  if (!Array.isArray(candidates) || !candidates.length || count <= 0) return [];
  const pool = [...candidates];
  const output = [];

  while (pool.length && output.length < count) {
    const idx = Math.floor(Math.random() * pool.length);
    output.push(pool[idx]);
    pool.splice(idx, 1);
  }

  return output;
}

function randomScore(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFeedback(technique, previousRating) {
  const rating = Math.floor(Math.random() * 5) + 1;
  const profile = FEEDBACK_PROFILES[rating];

  let errorCount = 0;
  if (rating === 1) errorCount = 3;
  if (rating === 2) errorCount = 2;
  if (rating === 3) errorCount = 2;
  if (rating === 4) errorCount = 1;

  const errors = sampleErrors(technique.errorTags, errorCount);
  const [minScore, maxScore] = profile.scoreRange;

  return {
    rating,
    title: profile.title,
    comment: pickRandom(profile.comments),
    suggestion: pickRandom(profile.suggestions),
    errors,
    previousRating,
    delta: rating - previousRating,
    progressHighlight: technique.progressFocus,
    attentionHighlight: technique.attentionFocus,
    breakdown: {
      axis: clamp(randomScore(minScore, maxScore) + (rating >= 4 ? 1 : 0), 1, 10),
      speed: clamp(randomScore(minScore, maxScore), 1, 10),
      control: clamp(randomScore(minScore, maxScore) + (rating >= 3 ? 1 : 0), 1, 10),
    },
  };
}

function Stars({ value, onChange }) {
  return (
    <div className="flex items-center gap-1" aria-label="Tự đánh giá">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={
              "h-9 w-9 rounded-xl border text-lg transition " +
              (active
                ? "border-amber-300/40 bg-amber-300/15 text-amber-200"
                : "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10")
            }
            aria-label={`Đánh giá ${star} sao`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export default function TechniqueFeedbackSection() {
  const [techniqueId, setTechniqueId] = useState(TECHNIQUES[0].id);
  const [checks, setChecks] = useState({});
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const [fileName, setFileName] = useState("");
  const [analysisState, setAnalysisState] = useState("idle");
  const [analysisStep, setAnalysisStep] = useState("");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [feedbackResult, setFeedbackResult] = useState(null);
  const [lastRatingByTechnique, setLastRatingByTechnique] = useState({});
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const technique = useMemo(
    () => TECHNIQUES.find((item) => item.id === techniqueId) || TECHNIQUES[0],
    [techniqueId]
  );

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;
      setTechniqueId(parsed.techniqueId || TECHNIQUES[0].id);
      setChecks(parsed.checks || {});
      setRating(Number(parsed.rating) || 0);
      setNote(String(parsed.note || ""));
      setFileName(String(parsed.fileName || ""));
      setAnalysisState(parsed.analysisState || "idle");
      setAnalysisStep(String(parsed.analysisStep || ""));
      setAnalysisProgress(Number(parsed.analysisProgress) || 0);
      setFeedbackResult(parsed.feedbackResult || null);
      setLastRatingByTechnique(parsed.lastRatingByTechnique || {});
    } catch {
      // Ignore malformed localStorage values.
    }
  }, []);

  useEffect(() => {
    const payload = {
      techniqueId,
      checks,
      rating,
      note,
      fileName,
      analysisState,
      analysisStep,
      analysisProgress,
      feedbackResult,
      lastRatingByTechnique,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [
    techniqueId,
    checks,
    rating,
    note,
    fileName,
    analysisState,
    analysisStep,
    analysisProgress,
    feedbackResult,
    lastRatingByTechnique,
  ]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const toggleCheck = (item) => {
    setChecks((prev) => {
      const current = prev[technique.id] || {};
      return {
        ...prev,
        [technique.id]: {
          ...current,
          [item]: !current[item],
        },
      };
    });
  };

  const checkedMap = checks[technique.id] || {};
  const checkedCount = technique.checklist.filter((item) => checkedMap[item]).length;

  const runAnalysis = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setAnalysisState("running");
    setAnalysisProgress(0);
    setFeedbackResult(null);

    let idx = 0;
    setAnalysisStep(ANALYSIS_STEPS[0]);

    intervalRef.current = window.setInterval(() => {
      setAnalysisStep(ANALYSIS_STEPS[idx]);
      setAnalysisProgress(Math.round(((idx + 1) / ANALYSIS_STEPS.length) * 100));
      idx += 1;

      if (idx >= ANALYSIS_STEPS.length) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;

        timeoutRef.current = window.setTimeout(() => {
          const previousRating = Number(lastRatingByTechnique[technique.id]) || 2;
          const generated = generateFeedback(technique, previousRating);
          setFeedbackResult(generated);
          setLastRatingByTechnique((prev) => ({
            ...prev,
            [technique.id]: generated.rating,
          }));
          setAnalysisStep("Hoàn tất phân tích");
          setAnalysisProgress(100);
          setAnalysisState("done");
        }, 800);
      }
    }, 700);
  };

  const resetResult = () => {
    setAnalysisState("idle");
    setAnalysisStep("");
    setAnalysisProgress(0);
    setFeedbackResult(null);
  };

  const ratingTone =
    feedbackResult && feedbackResult.rating <= 2
      ? "text-rose-200"
      : feedbackResult && feedbackResult.rating === 3
        ? "text-amber-200"
        : "text-emerald-200";

  return (
    <section
      id="cham-chua-ky-thuat"
      className="surface-card enterprise-shell ui3d-card mt-10 scroll-mt-28 rounded-3xl p-5 sm:p-7"
    >
      <div className="inline-flex rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
        Chấm chữa kỹ thuật
      </div>
      <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Tự kiểm tra + giáo viên phản hồi</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
        Trả lời đúng 3 câu hỏi quan trọng: Mình có làm đúng không? Sai ở đâu? Sửa như thế nào?
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {TECHNIQUES.map((item) => {
          const active = item.id === technique.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setTechniqueId(item.id);
                resetResult();
              }}
              className={
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition " +
                (active
                  ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-100"
                  : "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10")
              }
            >
              {item.title}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <p className="text-sm font-semibold text-white">{technique.title}</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-300">
            <div className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2">🎥 {technique.videoNormal}</div>
            <div className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2">🎥 {technique.videoSlow}</div>
          </div>
          <p className="mt-4 text-xs text-slate-400">Mục tiêu: {technique.goal}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">Checklist kỹ thuật</p>
            <span className="rounded-full border border-emerald-300/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">
              {checkedCount}/{technique.checklist.length}
            </span>
          </div>

          <div className="mt-3 grid gap-2">
            {technique.checklist.map((item) => {
              const checked = Boolean(checkedMap[item]);
              return (
                <label
                  key={item}
                  className="flex cursor-pointer items-start gap-2 rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-slate-200"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCheck(item)}
                    className="mt-0.5 h-4 w-4 accent-emerald-400"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4">
          <p className="text-sm font-semibold text-amber-100">Lỗi thường gặp</p>
          <ul className="mt-2 grid gap-1 text-sm text-slate-200">
            {technique.commonErrors.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
          <p className="text-sm font-semibold text-cyan-100">Cách sửa cụ thể</p>
          <ul className="mt-2 grid gap-1 text-sm text-slate-200">
            {technique.fixes.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <p className="text-sm font-semibold text-white">Tự đánh giá</p>
          <div className="mt-2">
            <Stars value={rating} onChange={setRating} />
          </div>
          <p className="mt-2 text-xs text-slate-400">1 sao: rất sai, 3 sao: tạm ổn, 5 sao: ổn định.</p>

          <label className="mt-4 block text-sm font-semibold text-white">Ghi chú cá nhân</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: Hôm nay bị lệch trục, cần tập chậm hơn."
            className="mt-2 min-h-24 w-full rounded-xl border border-white/15 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-300/40"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <p className="text-sm font-semibold text-white">Gửi giáo viên chấm (nâng cao)</p>
          <p className="mt-2 text-sm text-slate-300">Tải video kỹ thuật để nhận phản hồi chi tiết trong 12-24 giờ.</p>
          <p className="mt-2 text-xs text-slate-400">
            Demo hiện tại mô phỏng phản hồi giáo viên để thể hiện luồng học tập hoàn chỉnh.
          </p>

          <label className="mt-3 inline-flex cursor-pointer items-center rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setFileName(file ? file.name : "");
              }}
            />
            Chọn video
          </label>
          {fileName ? <p className="mt-2 text-xs text-emerald-200">Đã chọn: {fileName}</p> : null}

          <button
            type="button"
            onClick={runAnalysis}
            className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Tải video để được chấm
          </button>

          {analysisState === "running" ? (
            <div className="mt-4 rounded-xl border border-cyan-300/25 bg-cyan-400/10 p-3 text-sm text-slate-100">
              <p className="font-semibold text-cyan-100">{analysisStep || "Đang chuẩn bị phân tích..."}</p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full border border-cyan-300/20 bg-slate-900/50">
                <div
                  className="h-full rounded-full bg-linear-to-r from-cyan-300 to-blue-500 transition-all"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-300">{analysisProgress}% hoàn tất</p>
            </div>
          ) : null}

          {analysisState === "done" && feedbackResult ? (
            <div className="mt-4 rounded-xl border border-emerald-300/25 bg-emerald-400/10 p-3 text-sm text-slate-100">
              <p className={`font-semibold ${ratingTone}`}>
                ⭐ {feedbackResult.rating}/5 - {feedbackResult.title}
              </p>
              <p className="mt-2"><strong>Nhận xét:</strong> {feedbackResult.comment}</p>
              <p className="mt-2"><strong>Gợi ý:</strong> {feedbackResult.suggestion}</p>
              <p className="mt-2">
                <strong>Lỗi chính:</strong>{" "}
                {feedbackResult.errors.length
                  ? feedbackResult.errors.join(", ")
                  : "Không có lỗi lớn"}
              </p>

              <div className="mt-3 rounded-lg border border-white/15 bg-white/5 p-2 text-xs">
                <p>
                  📈 So với lần trước: {feedbackResult.delta >= 0 ? "+" : ""}
                  {feedbackResult.delta} sao
                </p>
                <p className="mt-1">🎯 Tiến bộ: {feedbackResult.progressHighlight}</p>
                <p className="mt-1">⚠️ Cần chú ý: {feedbackResult.attentionHighlight}</p>
              </div>

              <div className="mt-3 rounded-lg border border-white/15 bg-white/5 p-2 text-xs">
                <p className="font-semibold text-slate-100">Phân tích chi tiết</p>
                <p className="mt-1">Trục cơ thể: {feedbackResult.breakdown.axis}/10</p>
                <p>Tốc độ: {feedbackResult.breakdown.speed}/10</p>
                <p>Kiểm soát: {feedbackResult.breakdown.control}/10</p>
              </div>

              <button
                type="button"
                onClick={resetResult}
                className="mt-3 inline-flex rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
              >
                Tập lại và gửi lại
              </button>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-400">
              Sau khi gửi sẽ chạy mô phỏng phân tích và trả phản hồi theo logic đánh giá 1-5 sao.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
