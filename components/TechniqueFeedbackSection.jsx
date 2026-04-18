"use client";

import { useEffect, useMemo, useState } from "react";

const TECHNIQUES = [
  {
    id: "da-tong-truoc",
    title: "Đá tống trước",
    videoNormal: "Video chuẩn (normal)",
    videoSlow: "Video chuẩn (slow 0.5x)",
    checklist: [
      "Nâng gối đúng hướng (ngang hông)",
      "Giữ trục cơ thể thẳng",
      "Duỗi chân dứt khoát",
      "Thu chân về nhanh",
      "Giữ tay guard ổn định",
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
    goal: "Đá ổn định 10 lần liên tiếp mà không mất thăng bằng.",
    sampleFeedback: {
      rating: 3,
      comment:
        "Gối đang lệch nhẹ nên lực chưa tốt. Giữ gối thẳng trước hông và giảm tốc độ để kiểm soát.",
      suggestion: "Tập chậm 10 lần trước gương mỗi ngày, tập trung giữ trục.",
      mainErrors: ["Lệch trục", "Guard chưa ổn"],
    },
  },
  {
    id: "dam-thang",
    title: "Đấm thẳng",
    videoNormal: "Video mẫu đấm thẳng (normal)",
    videoSlow: "Video mẫu đấm thẳng (slow 0.5x)",
    checklist: [
      "Lực đi từ chân -> hông -> tay",
      "Vai không nhô cao",
      "Thu tay về nhanh",
      "Tay còn lại giữ guard",
    ],
    commonErrors: [
      "Đấm bằng tay đơn thuần -> lực yếu",
      "Không thu tay -> bị hở",
      "Mất nhịp thở",
    ],
    fixes: ["Tập shadow boxing chậm", "Nhấn hông khi ra đòn", "Giữ nhịp thở đều"],
    goal: "Thực hiện 20 cú đấm thẳng liên tục, form không vỡ.",
    sampleFeedback: {
      rating: 4,
      comment: "Form khá ổn. Cần thu tay nhanh hơn để tránh hở khi phản công.",
      suggestion: "Tập chuỗi 3 đòn với nhịp cố định, ưu tiên tốc độ thu tay.",
      mainErrors: ["Thu tay chậm"],
    },
  },
  {
    id: "tan-trung-binh",
    title: "Tấn trung bình",
    videoNormal: "Video tấn trung bình (normal)",
    videoSlow: "Video tấn trung bình (slow 0.5x)",
    checklist: [
      "Gối theo hướng mũi chân",
      "Lưng giữ thẳng",
      "Trọng tâm ổn định",
      "Nhịp thở đều",
    ],
    commonErrors: ["Gối đổ vào trong", "Lưng cong", "Nhấc gót chân trụ"],
    fixes: ["Giữ tấn 30 giây", "Tập trước gương", "Giảm biên độ để giữ form"],
    goal: "Giữ tấn chuẩn 30 giây x 3 hiệp, không gãy lưng.",
    sampleFeedback: {
      rating: 3,
      comment: "Lưng hơi gập ở cuối hiệp, cần giảm biên độ và giữ nhịp ổn định.",
      suggestion: "Chia hiệp ngắn hơn và tăng dần thời gian giữ tấn.",
      mainErrors: ["Lưng cong", "Mất trọng tâm"],
    },
  },
  {
    id: "da-vong-cau",
    title: "Đá vòng cầu",
    videoNormal: "Video đá vòng cầu (normal)",
    videoSlow: "Video đá vòng cầu (slow 0.5x)",
    checklist: [
      "Xoay hông rõ ràng",
      "Chân trụ xoay đúng hướng",
      "Đường đá ngang mục tiêu",
      "Thu chân nhanh về guard",
    ],
    commonErrors: ["Không xoay hông -> mất lực", "Chân trụ đứng cứng", "Đá xong mất thăng bằng"],
    fixes: ["Tập riêng động tác xoay hông", "Tập đá thấp trước", "Giữ trục khi thu chân"],
    goal: "Đá vòng cầu 10 lần mỗi bên, giữ trục ổn định.",
    sampleFeedback: {
      rating: 2,
      comment: "Chân trụ chưa xoay đủ nên đòn thiếu lực và mất cân bằng.",
      suggestion: "Tập drill xoay chân trụ độc lập trước khi ghép đòn hoàn chỉnh.",
      mainErrors: ["Chân trụ không xoay", "Mất thăng bằng"],
    },
  },
  {
    id: "thoat-nam-co-tay",
    title: "Thoát nắm cổ tay",
    videoNormal: "Video thoát nắm cổ tay (normal)",
    videoSlow: "Video thoát nắm cổ tay (slow 0.5x)",
    checklist: [
      "Xoay theo hướng ngón cái",
      "Bước góc để tạo không gian",
      "Giật dứt khoát",
      "Giữ guard sau khi thoát",
    ],
    commonErrors: ["Kéo thẳng tay -> khó thoát", "Không bước góc", "Ra đòn quá chậm"],
    fixes: ["Tập chậm theo từng bước", "Đánh dấu vị trí chân", "Luyện phản xạ theo nhịp"],
    goal: "Thoát nắm chính xác 8/10 lần với cùng một setup.",
    sampleFeedback: {
      rating: 4,
      comment: "Hướng xoay đã đúng, cần tăng độ dứt khoát ở pha giật tay.",
      suggestion: "Luyện 3 hiệp x 10 lần, tập trung bước góc trước khi giật.",
      mainErrors: ["Thiếu dứt khoát"],
    },
  },
];

const STORAGE_KEY = "vovinam-technique-feedback-v1";

function Stars({ value, onChange }) {
  return (
    <div className="flex items-center gap-1" aria-label="Self rating">
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
            aria-label={`Rate ${star} star`}
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
  const [submitted, setSubmitted] = useState(false);

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
      setSubmitted(Boolean(parsed.submitted));
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
      submitted,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [techniqueId, checks, rating, note, fileName, submitted]);

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
                setSubmitted(false);
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
          <p className="text-sm font-semibold text-white">Gửi giáo viên chấm (Premium)</p>
          <p className="mt-2 text-sm text-slate-300">Upload video kỹ thuật để nhận phản hồi chi tiết trong 12-24 giờ.</p>

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
            onClick={() => setSubmitted(true)}
            className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Upload video để được chấm
          </button>

          {submitted ? (
            <div className="mt-4 rounded-xl border border-emerald-300/25 bg-emerald-400/10 p-3 text-sm text-slate-100">
              <p className="font-semibold text-emerald-100">⭐ {technique.sampleFeedback.rating}/5 - Cần cải thiện</p>
              <p className="mt-2">Nhận xét: {technique.sampleFeedback.comment}</p>
              <p className="mt-2">Gợi ý: {technique.sampleFeedback.suggestion}</p>
              <p className="mt-2">Lỗi chính: {technique.sampleFeedback.mainErrors.join(", ")}</p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-3 inline-flex rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
              >
                Tập lại và gửi lại
              </button>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-400">Sau khi gửi sẽ hiển thị phản hồi mẫu để demo luồng học tập hoàn chỉnh.</p>
          )}
        </div>
      </div>
    </section>
  );
}
