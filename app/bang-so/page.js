import { getBeltById } from "@/data/belts";
import { base64UrlDecodeJson } from "@/lib/base64url";
import { getLocale } from "next-intl/server";

export const metadata = {
  title: "Võ Bằng Số",
};

function asText(value) {
  return String(value || "").trim();
}

function formatDateByLocale(ms, locale) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n <= 0) return "";

  const id = String(locale || "vi").toLowerCase();
  const tag = id === "en" ? "en-US" : id === "ja" ? "ja-JP" : "vi-VN";
  return new Date(n).toLocaleDateString(tag);
}

function normalizePayload(raw) {
  if (!raw || typeof raw !== "object") return null;

  const id = asText(raw.id);
  const beltId = asText(raw.beltId);
  const studentName = asText(raw.studentName);
  const beltTitleFromPayload = asText(raw.beltTitle);
  const issuedAt = Number(raw.issuedAt);

  if (!id || !beltId || !Number.isFinite(issuedAt) || issuedAt <= 0) return null;

  const beltTitle = (getBeltById(beltId)?.title || beltTitleFromPayload || beltId).trim();

  return {
    id,
    beltId,
    beltTitle,
    studentName: studentName || "Học viên",
    issuedAt,
  };
}

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      fallbackStudent: "Student",
      heading: "Verify Digital Certificate",
      intro:
        "Scan the QR code on the certificate to open this page. If the data is valid, the certificate details will be shown.",
      certLabel: "DIGITAL CERTIFICATE",
      certTitle: (beltTitle) => `Completion certificate for ${beltTitle}`,
      studentLabel: "Student",
      honorLine: (name) => `Thank you ${name} for preserving the spirit of Vietnamese martial arts.`,
      infoLabel: "Certificate details",
      beltLabel: "Belt",
      issuedLabel: "Issued on",
      codeLabel: "Code",
      statusLabel: "Status",
      verified: "Verified",
      missingTitle: "Certificate data not found",
      missingDesc:
        "The verification link is missing or invalid. Please scan the QR code on your certificate again.",
    };
  }

  if (id === "ja") {
    return {
      fallbackStudent: "門下生",
      heading: "デジタル認定の検証",
      intro:
        "認定書のQRコードを読み取ってこのページを開きます。データが有効であれば認定情報が表示されます。",
      certLabel: "デジタル認定",
      certTitle: (beltTitle) => `${beltTitle} 修了認定`,
      studentLabel: "門下生",
      honorLine: (name) => `${name} さん、ベトナム武道精神の継承に感謝します。`,
      infoLabel: "認定情報",
      beltLabel: "帯レベル",
      issuedLabel: "発行日",
      codeLabel: "コード",
      statusLabel: "ステータス",
      verified: "検証済み",
      missingTitle: "認定データが見つかりません",
      missingDesc:
        "検証リンクが不足しているか無効です。認定書のQRコードを再度読み取ってください。",
    };
  }

  return {
    fallbackStudent: "Học viên",
    heading: "Xác minh Võ Bằng Số",
    intro:
      "Quét QR trên chứng nhận để mở trang này. Nếu dữ liệu hợp lệ, hệ thống sẽ hiển thị thông tin chứng nhận.",
    certLabel: "VÕ BẰNG SỐ",
    certTitle: (beltTitle) => `Chứng nhận hoàn thành lộ trình ${beltTitle}`,
    studentLabel: "Võ sinh",
    honorLine: (name) => `Cảm ơn võ sinh ${name} đã góp phần giữ gìn tinh thần Võ đạo Việt Nam`,
    infoLabel: "Thông tin chứng nhận",
    beltLabel: "Cấp đai",
    issuedLabel: "Ngày cấp",
    codeLabel: "Mã",
    statusLabel: "Trạng thái",
    verified: "Đã xác minh",
    missingTitle: "Không tìm thấy dữ liệu chứng nhận",
    missingDesc:
      "Link xác minh thiếu hoặc không hợp lệ. Hãy quét lại QR trên chứng nhận của bạn.",
  };
}

export default async function DigitalCertificateVerifyPage({ searchParams }) {
  const locale = await getLocale();
  const copy = getCopy(locale);

  const token = typeof searchParams?.c === "string" ? searchParams.c : "";
  const payload = token ? normalizePayload(base64UrlDecodeJson(token)) : null;

  const studentName = payload?.studentName || copy.fallbackStudent;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {copy.heading}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          {copy.intro}
        </p>
      </header>

      {payload ? (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)]">
          <div className="text-xs font-semibold text-slate-300 tracking-widest">{copy.certLabel}</div>
          <div className="mt-2 text-lg font-semibold text-white">
            {copy.certTitle(payload.beltTitle)}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="text-xs font-semibold text-slate-300">{copy.studentLabel}</div>
              <div className="mt-2 text-xl font-semibold tracking-tight text-white">{studentName}</div>
              <div className="mt-2 text-xs text-slate-300">
                {copy.honorLine(studentName)}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="text-xs font-semibold text-slate-300">{copy.infoLabel}</div>
              <div className="mt-3 grid gap-2 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-200">{copy.beltLabel}</span>
                  <span className="font-semibold text-white">{payload.beltTitle}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-200">{copy.issuedLabel}</span>
                  <span className="font-semibold text-white">{formatDateByLocale(payload.issuedAt, locale) || "-"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-200">{copy.codeLabel}</span>
                  <span className="font-mono text-xs text-cyan-200">{payload.id}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-200">
            {copy.statusLabel}: <span className="font-semibold text-white">{copy.verified}</span>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="text-sm font-semibold text-white">{copy.missingTitle}</div>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {copy.missingDesc}
          </p>
        </section>
      )}
    </div>
  );
}

