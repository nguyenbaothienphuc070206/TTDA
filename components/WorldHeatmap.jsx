"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";

function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function pct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeHeat(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function HeatDot({ country, active, onSelect, ariaSelectLabel }) {
  const heat = normalizeHeat(country.heat);
  const t = clamp01(heat / 100);
  const r = 6 + t * 10;
  const glowR = r + 10;
  const fillOpacity = 0.28 + t * 0.62;

  const baseColor = active ? "text-amber-300" : "text-cyan-300";
  const strokeColor = active ? "text-amber-200" : "text-white/20";

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(country.id);
    }
  };

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={ariaSelectLabel(country.name)}
      onClick={() => onSelect(country.id)}
      onKeyDown={onKeyDown}
      className="cursor-pointer outline-none"
    >
      <circle
        cx={country.x}
        cy={country.y}
        r={glowR}
        fill="currentColor"
        className={`${baseColor} ${active ? "" : ""}`}
        fillOpacity={active ? Math.min(0.22, fillOpacity * 0.6) : Math.min(0.16, fillOpacity * 0.45)}
      />
      <circle
        cx={country.x}
        cy={country.y}
        r={r}
        fill="currentColor"
        className={baseColor}
        fillOpacity={fillOpacity}
      />
      <circle
        cx={country.x}
        cy={country.y}
        r={r + 2}
        fill="none"
        stroke="currentColor"
        className={strokeColor}
        strokeWidth={1.5}
        opacity={active ? 0.9 : 0.4}
      />
    </g>
  );
}

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      title: "Global heatmap (demo)",
      description:
        "Click a dot to view country details. Dot color/size indicates activity level (demo).",
      countries: (n) => `${n} countries`,
      mapAria: "World heatmap",
      low: "Low",
      high: "High",
      keyboardTip: "Tip: use Enter/Space to select.",
      countryInfo: "Country information",
      quickDetails: "Quick details (demo).",
      chooseCountry: "Select a country on the map to view details.",
      activityIndex: "Martial activity index (demo):",
      trainingHint: "Training suggestion",
      notes: "Notes",
      notesDesc:
        "Data above is illustrative for the heatmap + country info UX demo. You can replace it with real metrics (clubs, tournaments, members) when available.",
      noneSelected: "No country selected.",
      selectCountry: (name) => `Select ${name}`,
    };
  }

  if (id === "ja") {
    return {
      title: "世界ヒートマップ（デモ）",
      description:
        "ドットをクリックすると国情報を表示します。色とサイズは活動度を示します（デモ）。",
      countries: (n) => `${n} か国`,
      mapAria: "世界ヒートマップ",
      low: "低",
      high: "高",
      keyboardTip: "ヒント: Enter/Space で選択できます。",
      countryInfo: "国情報",
      quickDetails: "概要（デモ）",
      chooseCountry: "地図上の国を選択すると詳細が表示されます。",
      activityIndex: "武道活動指数（デモ）:",
      trainingHint: "練習アドバイス",
      notes: "メモ",
      notesDesc:
        "上記データは heatmap + 国情報 UI のデモ用です。実データ（道場数、大会、会員数）があれば差し替え可能です。",
      noneSelected: "国が選択されていません。",
      selectCountry: (name) => `${name} を選択`,
    };
  }

  return {
    title: "Global heatmap (demo)",
    description:
      "Click vào chấm để xem thông tin quốc gia. Màu/độ to thể hiện mức độ hoạt động (minh họa).",
    countries: (n) => `${n} quốc gia`,
    mapAria: "Bản đồ thế giới dạng heatmap",
    low: "Thấp",
    high: "Cao",
    keyboardTip: "Tip: dùng bàn phím Enter/Space để chọn.",
    countryInfo: "Thông tin quốc gia",
    quickDetails: "Chi tiết nhanh (demo).",
    chooseCountry: "Chọn một quốc gia trên bản đồ để xem chi tiết.",
    activityIndex: "Chỉ số hoạt động Võ đạo (demo):",
    trainingHint: "Gợi ý luyện",
    notes: "Ghi chú",
    notesDesc:
      "Dữ liệu trên là minh họa để demo UX heatmap + click country info. Bạn có thể thay bằng số liệu thật (CLB, giải đấu, học viên) khi có nguồn dữ liệu.",
    noneSelected: "Chưa chọn quốc gia.",
    selectCountry: (name) => `Chọn ${name}`,
  };
}

export default function WorldHeatmap() {
  const locale = useLocale();
  const copy = getCopy(locale);

  const countries = useMemo(
    () => [
      {
        id: "vn",
        name: "Việt Nam",
        region: "Đông Nam Á",
        x: 760,
        y: 270,
        heat: 95,
        note: "Cái nôi Vovinam. Gợi ý: ưu tiên nền tảng, kỷ luật và an toàn khớp gối/hông.",
      },
      {
        id: "jp",
        name: "Nhật Bản",
        region: "Đông Á",
        x: 825,
        y: 190,
        heat: 58,
        note: "Gợi ý: luyện quyền đều và chú ý nhịp thở để giữ độ sạch kỹ thuật.",
      },
      {
        id: "kr",
        name: "Hàn Quốc",
        region: "Đông Á",
        x: 800,
        y: 205,
        heat: 52,
        note: "Gợi ý: tập phản xạ 1 nhịp + kiểm soát khoảng cách khi đối luyện.",
      },
      {
        id: "cn",
        name: "Trung Quốc",
        region: "Đông Á",
        x: 745,
        y: 200,
        heat: 44,
        note: "Gợi ý: tăng dần cường độ, giữ kỹ thuật sạch trước khi tăng tốc.",
      },
      {
        id: "in",
        name: "Ấn Độ",
        region: "Nam Á",
        x: 690,
        y: 250,
        heat: 40,
        note: "Gợi ý: phối hợp cardio nhẹ + giãn cơ để tăng sức bền và phục hồi.",
      },
      {
        id: "au",
        name: "Úc",
        region: "Châu Đại Dương",
        x: 860,
        y: 410,
        heat: 32,
        note: "Gợi ý: tập theo giáo án 4 tuần, giữ lịch đều để tăng kỹ năng.",
      },
      {
        id: "us",
        name: "Hoa Kỳ",
        region: "Bắc Mỹ",
        x: 240,
        y: 190,
        heat: 62,
        note: "Gợi ý: tập đối luyện an toàn, ưu tiên bảo hộ và kiểm soát lực.",
      },
      {
        id: "ca",
        name: "Canada",
        region: "Bắc Mỹ",
        x: 220,
        y: 120,
        heat: 38,
        note: "Gợi ý: phát triển nền tảng (trụ/tấn) + kỹ thuật chậm trước khi tăng lực.",
      },
      {
        id: "mx",
        name: "Mexico",
        region: "Bắc Mỹ",
        x: 220,
        y: 240,
        heat: 28,
        note: "Gợi ý: luyện nhịp chân và chuyển tấn để lên đòn sạch.",
      },
      {
        id: "br",
        name: "Brazil",
        region: "Nam Mỹ",
        x: 360,
        y: 360,
        heat: 34,
        note: "Gợi ý: tăng sức bền bằng bài ngắn 2-3 phút, giữ nhịp thở ổn định.",
      },
      {
        id: "gb",
        name: "Vương quốc Anh",
        region: "Châu Âu",
        x: 470,
        y: 145,
        heat: 36,
        note: "Gợi ý: ưu tiên kỹ thuật tay thủ + phản 1 nhịp, tránh ham combo dài.",
      },
      {
        id: "fr",
        name: "Pháp",
        region: "Châu Âu",
        x: 495,
        y: 175,
        heat: 55,
        note: "Gợi ý: giữ kỷ luật giáo án, luyện quyền đều và kiểm tra kỹ thuật bằng video.",
      },
      {
        id: "de",
        name: "Đức",
        region: "Châu Âu",
        x: 520,
        y: 160,
        heat: 30,
        note: "Gợi ý: tập đúng kỹ thuật, tăng khối lượng dần để tránh quá tải.",
      },
      {
        id: "eg",
        name: "Ai Cập",
        region: "Châu Phi",
        x: 565,
        y: 245,
        heat: 20,
        note: "Gợi ý: tập chậm + linh hoạt hông/đầu gối; ưu tiên an toàn khi đối luyện.",
      },
      {
        id: "za",
        name: "Nam Phi",
        region: "Châu Phi",
        x: 600,
        y: 400,
        heat: 18,
        note: "Gợi ý: lịch tập đều + phục hồi (ngủ/nước/đạm) để tăng hiệu quả.",
      },
      {
        id: "ru",
        name: "Nga",
        region: "Á-Âu",
        x: 650,
        y: 110,
        heat: 26,
        note: "Gợi ý: tăng sức mạnh thân trên nhưng vẫn giữ độ mềm và nhịp thở.",
      },
    ],
    []
  );

  const [activeId, setActiveId] = useState("vn");

  const active = useMemo(() => {
    const id = String(activeId || "");
    return countries.find((c) => c.id === id) || null;
  }, [activeId, countries]);

  const onSelect = (id) => {
    setActiveId((prev) => (prev === id ? "" : id));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">{copy.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {copy.description}
            </p>
          </div>

          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
            {copy.countries(countries.length)}
          </span>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/30">
          <svg
            viewBox="0 0 1000 500"
            className="h-[320px] w-full sm:h-[420px]"
            role="img"
            aria-label={copy.mapAria}
          >
            {/* Abstract continent silhouettes (original, stylized) */}
            <g>
              <path
                d="M95 125 C140 70, 230 55, 300 95 C338 118, 342 170, 310 190 C285 206, 255 214, 240 245 C225 277, 185 292, 150 270 C110 244, 80 185, 95 125 Z"
                fill="currentColor"
                className="text-white/5"
              />
              <path
                d="M290 260 C320 240, 360 250, 378 282 C400 320, 392 360, 365 392 C342 420, 310 430, 286 408 C255 378, 258 318, 290 260 Z"
                fill="currentColor"
                className="text-white/5"
              />
              <path
                d="M440 120 C490 92, 560 92, 615 115 C660 134, 700 170, 695 210 C690 252, 645 270, 628 305 C610 342, 575 380, 525 395 C470 410, 435 385, 420 340 C402 288, 420 235, 445 205 C470 175, 420 155, 440 120 Z"
                fill="currentColor"
                className="text-white/5"
              />
              <path
                d="M650 120 C700 85, 810 90, 885 130 C930 155, 950 198, 925 230 C900 262, 860 252, 838 275 C810 305, 772 318, 735 300 C700 282, 690 250, 655 225 C620 200, 610 150, 650 120 Z"
                fill="currentColor"
                className="text-white/5"
              />
              <path
                d="M790 350 C820 330, 875 332, 910 360 C940 386, 940 425, 910 447 C880 468, 828 468, 800 445 C770 420, 765 372, 790 350 Z"
                fill="currentColor"
                className="text-white/5"
              />
            </g>

            <g>
              <path
                d="M95 125 C140 70, 230 55, 300 95 C338 118, 342 170, 310 190 C285 206, 255 214, 240 245 C225 277, 185 292, 150 270 C110 244, 80 185, 95 125 Z"
                fill="none"
                stroke="currentColor"
                className="text-white/10"
                strokeWidth="1.5"
              />
              <path
                d="M290 260 C320 240, 360 250, 378 282 C400 320, 392 360, 365 392 C342 420, 310 430, 286 408 C255 378, 258 318, 290 260 Z"
                fill="none"
                stroke="currentColor"
                className="text-white/10"
                strokeWidth="1.5"
              />
              <path
                d="M440 120 C490 92, 560 92, 615 115 C660 134, 700 170, 695 210 C690 252, 645 270, 628 305 C610 342, 575 380, 525 395 C470 410, 435 385, 420 340 C402 288, 420 235, 445 205 C470 175, 420 155, 440 120 Z"
                fill="none"
                stroke="currentColor"
                className="text-white/10"
                strokeWidth="1.5"
              />
              <path
                d="M650 120 C700 85, 810 90, 885 130 C930 155, 950 198, 925 230 C900 262, 860 252, 838 275 C810 305, 772 318, 735 300 C700 282, 690 250, 655 225 C620 200, 610 150, 650 120 Z"
                fill="none"
                stroke="currentColor"
                className="text-white/10"
                strokeWidth="1.5"
              />
              <path
                d="M790 350 C820 330, 875 332, 910 360 C940 386, 940 425, 910 447 C880 468, 828 468, 800 445 C770 420, 765 372, 790 350 Z"
                fill="none"
                stroke="currentColor"
                className="text-white/10"
                strokeWidth="1.5"
              />
            </g>

            <g>
              {countries.map((c) => (
                <HeatDot
                  key={c.id}
                  country={c}
                  active={Boolean(active && active.id === c.id)}
                  onSelect={onSelect}
                  ariaSelectLabel={copy.selectCountry}
                />
              ))}
            </g>
          </svg>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300/50" />
            <span>{copy.low}</span>
            <span className="mx-2 h-px w-8 bg-white/10" />
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300" />
            <span>{copy.high}</span>
          </div>

          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            {copy.keyboardTip}
          </div>
        </div>
      </section>

      <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)]">
        <h3 className="text-lg font-semibold text-white">{copy.countryInfo}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {active
            ? copy.quickDetails
            : copy.chooseCountry}
        </p>

        {active ? (
          <div className="mt-5 grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">{active.name}</div>
                  <div className="mt-1 text-xs text-slate-300">{active.region}</div>
                </div>
                <span className="rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-100">
                  {pct(active.heat)}/100
                </span>
              </div>

              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-amber-300 to-yellow-400"
                  style={{ width: `${pct(active.heat)}%` }}
                />
              </div>

              <div className="mt-3 text-xs leading-5 text-slate-200">
                <span className="text-slate-300">{copy.activityIndex}</span>{" "}
                <span className="font-semibold text-white">{pct(active.heat)}%</span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
              <div className="text-xs font-semibold text-slate-300">{copy.trainingHint}</div>
              <p className="mt-2 text-sm leading-6 text-slate-200">{active.note}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs font-semibold text-slate-300">{copy.notes}</div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {copy.notesDesc}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/30 p-5 text-sm text-slate-300">
            {copy.noneSelected}
          </div>
        )}
      </aside>
    </div>
  );
}

