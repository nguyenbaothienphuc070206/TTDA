"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import QRCode from "react-qr-code";

import { BELTS, getBeltById } from "@/data/belts";
import { getLessonsByBeltId, getLessonsByLevel } from "@/data/lessons";
import { base64UrlEncodeJson } from "@/lib/base64url";
import { computeBadges } from "@/lib/badges";
import { readDoneSlugs } from "@/lib/progress";
import { readProfile, writeProfile } from "@/lib/profile";
import { callGateway } from "@/lib/api/gatewayClient";

function formatDateByLocale(ms, locale) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n <= 0) return "";

  const id = String(locale || "vi").toLowerCase();
  const tag = id === "en" ? "en-US" : id === "ja" ? "ja-JP" : "vi-VN";
  return new Date(n).toLocaleDateString(tag);
}

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      fallbackStudent: "Student",
      beltFallback: "Belt",
      certLabel: "DIGITAL CERTIFICATE",
      certSubtitle: (beltTitle) => `Completion certificate for ${beltTitle}`,
      certStudentLabel: "Student",
      certCodeLabel: "Certificate code",
      certIssuedLabel: "Issued on",
      certVerifyLabel: "Verification",
      certScanHint: "Scan to verify",
      certHonorLine: (studentName) =>
        `Thank you ${studentName} for preserving the spirit of Vietnamese martial arts`,
      certCodeShort: "Code",
      certDownloadSvg: "Download certificate (SVG)",
      certOpenVerify: "Open verification page",
      planTitle: "Free / Premium plan",
      planDesc:
        "Free gives access to foundation techniques/videos (Blue belts). Premium unlocks advanced techniques and AI Coach.",
      currentPlan: "Current plan",
      planPremiumValue: "Premium",
      planFreeValue: "Free",
      demoLocal: "(Demo: stored on device)",
      turnOffPremium: "Turn off Premium (demo)",
      upgradePremiumDemo: "Upgrade Premium (demo)",
      planBenefits: "What you get",
      benefitPremium1: "Yellow/Red belt techniques",
      benefitPremium2: "Advanced videos and instant AI Coach",
      benefitPremium3: "AI Coach (RAG) for mistakes and safety",
      benefitFree1: "Blue-belt techniques",
      benefitFree2: "Blue-belt videos",
      benefitFree3: "Community feed (schedule/events)",
      stripeHint:
        "Real implementation suggestion: use Stripe Subscription + entitlement per user in Supabase for cross-device sync.",
      todayTitle: "Today's status",
      todayLine: (days, encouragement) =>
        `Today is day ${days} of your Vovinam journey. ${encouragement}`,
      encouragementNext: (beltTitle) => `Keep pushing toward ${beltTitle}!`,
      encouragementFinal: "Keep your form sharp and help newer students!",
      currentBelt: "Current belt",
      goal: "Goal",
      goalText: "Clean technique and consistency",
      quickSuggestion: "Tip",
      quickSuggestionText: "If you have 5 minutes: review one technique you often miss.",
      badgesTitle: "Badges",
      badgesDesc: "Each lesson milestone unlocks a small badge to keep you motivated.",
      badgeTitleById: {
        starter: "Warm-up",
        "on-track": "On track",
        foundation: "Solid foundation",
        consistent: "Consistent",
        "roadmap-master": "Roadmap master",
      },
      badgeDescById: {
        starter: "Complete your first lesson.",
        "on-track": "Complete 3 lessons.",
        foundation: "Complete 5 lessons.",
        consistent: "Complete 10 lessons.",
        "roadmap-master": "Complete the entire roadmap.",
      },
      noBadges: "No badges yet. Complete 1 lesson to earn your first badge.",
      remindersTitle: "Master reminders",
      remindersDesc:
        "Enable notifications to receive gentle reminders when you have not reviewed techniques for a while.",
      browserNoNotification: "This browser does not support Notification API.",
      noNotificationPermission: "Notification permission is not granted. Please allow it to receive reminders.",
      noServiceWorker: "Service Worker (PWA) is missing. Try refreshing the page.",
      notificationNotReady: "Notifications are not ready yet. Try refreshing the page.",
      reminderNotifTitle: "Master reminder",
      reminderNotifBody: "Test: take 5 minutes to review today's technique.",
      remindersStatus: "Status",
      remindersOn: "Enabled",
      remindersOff: "Disabled",
      remindersApiHint: "Uses Notification API + Service Worker.",
      disableReminders: "Disable reminders",
      enableReminders: "Enable reminders",
      sendTest: "Send test",
      reminderThreshold: "Reminder threshold",
      daysNoReview: "days without review",
      reminderThresholdHint:
        "Reminder is based on the latest time you viewed lesson/technique/video in the app.",
      profileTitle: "Student profile",
      profileDesc: "Profile and training journal are stored locally (localStorage).",
      fullName: "Full name",
      fullNamePlaceholder: "Example: Nguyen Van A",
      currentBeltLabel: "Current belt",
      digitalCertTitle: "Digital certificate",
      digitalCertDesc:
        "When you complete 100% of one belt roadmap, the system auto-issues a certificate with QR for verification.",
      noCertificate: (beltTitle) => `No certificate yet. Complete ${beltTitle} roadmap to receive one.`,
      progressNow: (done, total) => `Current progress: ${done}/${total} lessons.`,
      historyDiaryTitle: "History & journal",
      historyDiaryDesc: "Save belt milestones and your training logs.",
      beltHistoryTitle: "Belt promotion history",
      beltLabel: "Belt",
      dateLabel: "Date",
      addBeltMilestone: "Add belt milestone",
      delete: "Delete",
      noBeltMilestone: "No belt milestone yet.",
      diaryTitle: "Training journal",
      diaryDate: "Date",
      diaryEntryTitle: "Title",
      diaryEntryTitleHint: "Example: Form 1 practice, front push kick",
      diaryEntryTitlePlaceholder: "What did you train today?",
      diaryNote: "Note",
      diaryNoteHint: "Feeling, common mistakes, next-session goal...",
      diaryNotePlaceholder: "Example: got out of breath in round 2, need better balance on kicks...",
      saveDiary: "Save journal",
      diaryFetchError: "Could not fetch AI feedback.",
      diaryNoReply: "AI has not replied yet. Please try again.",
      diaryAskAi: "Ask AI feedback",
      diaryAiResponding: "AI is responding...",
      diaryReplyLabel: "AI feedback",
      diarySessionFallback: "Session",
      noDiary: "No journal entries yet.",
    };
  }

  if (id === "ja") {
    return {
      fallbackStudent: "門下生",
      beltFallback: "帯",
      certLabel: "デジタル認定",
      certSubtitle: (beltTitle) => `${beltTitle} 修了認定`,
      certStudentLabel: "門下生",
      certCodeLabel: "認定コード",
      certIssuedLabel: "発行日",
      certVerifyLabel: "検証",
      certScanHint: "読み取って検証",
      certHonorLine: (studentName) =>
        `${studentName} さん、ベトナム武道精神の継承に感謝します`,
      certCodeShort: "コード",
      certDownloadSvg: "認定証をダウンロード (SVG)",
      certOpenVerify: "検証ページを開く",
      planTitle: "Free / Premium プラン",
      planDesc:
        "Free は基礎技術/動画 (青帯系) を利用できます。Premium は上級技術と AI コーチを開放します。",
      currentPlan: "現在のプラン",
      planPremiumValue: "Premium",
      planFreeValue: "Free",
      demoLocal: "(デモ: 端末内保存)",
      turnOffPremium: "Premium をオフ (デモ)",
      upgradePremiumDemo: "Premium にアップグレード (デモ)",
      planBenefits: "利用可能機能",
      benefitPremium1: "黄帯/紅帯技術",
      benefitPremium2: "上級動画と AI コーチ",
      benefitPremium3: "ミス・安全面の AI コーチ (RAG)",
      benefitFree1: "青帯技術",
      benefitFree2: "青帯動画",
      benefitFree3: "コミュニティ掲示 (予定/イベント)",
      stripeHint:
        "本番実装案: Stripe Subscription + Supabase の entitlement 保存で複数端末同期。",
      todayTitle: "今日のステータス",
      todayLine: (days, encouragement) =>
        `Vovinam を始めて ${days} 日目です。${encouragement}`,
      encouragementNext: (beltTitle) => `${beltTitle} を目指して継続しましょう!`,
      encouragementFinal: "調子を保ち、新しい門下生をサポートしましょう!",
      currentBelt: "現在の帯",
      goal: "目標",
      goalText: "正確な技術と継続",
      quickSuggestion: "提案",
      quickSuggestionText: "5分あれば、苦手な技を1つ復習しましょう。",
      badgesTitle: "バッジ",
      badgesDesc: "レッスン達成ごとに小さなバッジが解放され、継続の励みになります。",
      badgeTitleById: {
        starter: "スタート",
        "on-track": "順調",
        foundation: "土台が固い",
        consistent: "継続者",
        "roadmap-master": "ロードマップ制覇",
      },
      badgeDescById: {
        starter: "最初のレッスンを1つ完了。",
        "on-track": "3レッスンを完了。",
        foundation: "5レッスンを完了。",
        consistent: "10レッスンを完了。",
        "roadmap-master": "ロードマップ全体を完了。",
      },
      noBadges: "まだバッジはありません。1レッスン完了で最初のバッジを獲得できます。",
      remindersTitle: "師範リマインダー",
      remindersDesc:
        "技術の復習が空いたとき、やさしい通知でリマインドします。",
      browserNoNotification: "このブラウザは Notification API に対応していません。",
      noNotificationPermission: "通知の許可がありません。許可するとリマインダーを受け取れます。",
      noServiceWorker: "Service Worker (PWA) が見つかりません。ページを再読み込みしてください。",
      notificationNotReady: "通知の準備ができていません。ページを再読み込みしてください。",
      reminderNotifTitle: "師範リマインダー",
      reminderNotifBody: "テスト: 今日の技術を5分復習しましょう。",
      remindersStatus: "状態",
      remindersOn: "有効",
      remindersOff: "無効",
      remindersApiHint: "Notification API + Service Worker を使用。",
      disableReminders: "リマインダーをオフ",
      enableReminders: "リマインダーをオン",
      sendTest: "テスト送信",
      reminderThreshold: "リマインド閾値",
      daysNoReview: "日間未復習",
      reminderThresholdHint:
        "リマインダーはアプリ内でレッスン/技術/動画を最後に閲覧した時刻に基づきます。",
      profileTitle: "門下生プロフィール",
      profileDesc: "プロフィールと日誌は端末内 (localStorage) に保存されます。",
      fullName: "氏名",
      fullNamePlaceholder: "例: Nguyen Van A",
      currentBeltLabel: "現在の帯",
      digitalCertTitle: "デジタル認定",
      digitalCertDesc:
        "帯ロードマップを 100% 完了すると、QR 付き認定書が自動発行されます。",
      noCertificate: (beltTitle) => `認定書はまだありません。${beltTitle} のロードマップを完了すると受け取れます。`,
      progressNow: (done, total) => `現在の進捗: ${done}/${total} レッスン。`,
      historyDiaryTitle: "履歴と日誌",
      historyDiaryDesc: "昇帯の節目と練習ログを記録します。",
      beltHistoryTitle: "昇帯履歴",
      beltLabel: "帯",
      dateLabel: "日付",
      addBeltMilestone: "昇帯記録を追加",
      delete: "削除",
      noBeltMilestone: "昇帯記録はまだありません。",
      diaryTitle: "練習日誌",
      diaryDate: "日付",
      diaryEntryTitle: "タイトル",
      diaryEntryTitleHint: "例: 第一拳の練習、前蹴り",
      diaryEntryTitlePlaceholder: "今日は何を練習しましたか?",
      diaryNote: "メモ",
      diaryNoteHint: "感覚、よくあるミス、次回目標...",
      diaryNotePlaceholder: "例: 2ラウンド目で息切れ、蹴りのバランスを改善したい...",
      saveDiary: "日誌を保存",
      diaryFetchError: "AI フィードバックを取得できませんでした。",
      diaryNoReply: "AI からまだ返信がありません。もう一度お試しください。",
      diaryAskAi: "AI フィードバック",
      diaryAiResponding: "AI 応答中...",
      diaryReplyLabel: "AI フィードバック",
      diarySessionFallback: "セッション",
      noDiary: "日誌はまだありません。",
    };
  }

  return {
    fallbackStudent: "Học viên",
    beltFallback: "Cấp đai",
    certLabel: "VÕ BẰNG SỐ",
    certSubtitle: (beltTitle) => `Chứng nhận hoàn thành lộ trình ${beltTitle}`,
    certStudentLabel: "Võ sinh",
    certCodeLabel: "Mã chứng nhận",
    certIssuedLabel: "Ngày cấp",
    certVerifyLabel: "Xác minh",
    certScanHint: "Quét để xác minh",
    certHonorLine: (studentName) =>
      `Cảm ơn võ sinh ${studentName} đã góp phần giữ gìn tinh thần Võ đạo Việt Nam`,
    certCodeShort: "Mã",
    certDownloadSvg: "Tải bằng (SVG)",
    certOpenVerify: "Mở trang xác minh",
    planTitle: "Gói Free / Premium",
    planDesc:
      "Free cho phép xem kỹ thuật/video nền tảng (Lam đai). Premium mở khóa kỹ thuật nâng cao và AI Coach.",
    currentPlan: "Gói hiện tại",
    planPremiumValue: "Premium",
    planFreeValue: "Free",
    demoLocal: "(Demo: lưu trên máy)",
    turnOffPremium: "Tắt Premium (demo)",
    upgradePremiumDemo: "Nâng cấp Premium (demo)",
    planBenefits: "Bạn nhận được",
    benefitPremium1: "Xem kỹ thuật Hoàng/Hồng đai",
    benefitPremium2: "Xem video nâng cao và hỏi ngay bằng AI Coach",
    benefitPremium3: "Mở khóa AI Coach (RAG) để hỏi lỗi thường gặp & an toàn",
    benefitFree1: "Xem kỹ thuật Lam đai",
    benefitFree2: "Xem video Lam đai",
    benefitFree3: "Xem bảng tin cộng đồng (lịch/sự kiện)",
    stripeHint:
      "Gợi ý triển khai thật: dùng Stripe Subscription + lưu entitlement theo user trong Supabase để đồng bộ đa thiết bị.",
    todayTitle: "Trạng thái hôm nay",
    todayLine: (days, encouragement) =>
      `Hôm nay là ngày thứ ${days} bạn gắn bó với Vovinam. ${encouragement}`,
    encouragementNext: (beltTitle) => `Cố gắng lên ${beltTitle} nhé!`,
    encouragementFinal: "Giữ phong độ và giúp người mới nhé!",
    currentBelt: "Cấp đai hiện tại",
    goal: "Mục tiêu",
    goalText: "Đúng kỹ thuật & đều đặn",
    quickSuggestion: "Gợi ý",
    quickSuggestionText: "Nếu có 5 phút: ôn lại 1 kỹ thuật bạn hay sai.",
    badgesTitle: "Huy hiệu",
    badgesDesc: "Mỗi mốc hoàn thành bài học sẽ mở khóa một huy hiệu nhỏ để bạn có động lực luyện đều.",
    badgeTitleById: {
      starter: "Khởi động",
      "on-track": "Vào guồng",
      foundation: "Nền tảng vững",
      consistent: "Chăm chỉ",
      "roadmap-master": "Chinh phục lộ trình",
    },
    badgeDescById: {
      starter: "Hoàn thành 1 bài học đầu tiên.",
      "on-track": "Hoàn thành 3 bài học.",
      foundation: "Hoàn thành 5 bài học.",
      consistent: "Hoàn thành 10 bài học.",
      "roadmap-master": "Hoàn thành toàn bộ lộ trình.",
    },
    noBadges: "Chưa có huy hiệu nào. Hoàn thành 1 bài để nhận huy hiệu đầu tiên.",
    remindersTitle: "Lời nhắc sư phụ",
    remindersDesc:
      "Bật thông báo để nhận lời nhắc nhẹ nhàng khi bạn bỏ quá lâu chưa ôn lại kỹ thuật.",
    browserNoNotification: "Trình duyệt chưa hỗ trợ Notification API.",
    noNotificationPermission: "Bạn chưa cho phép thông báo. Hãy cấp quyền để nhận lời nhắc.",
    noServiceWorker: "Thiếu Service Worker (PWA). Thử refresh lại trang.",
    notificationNotReady: "Chưa sẵn sàng để gửi thông báo. Thử refresh lại trang.",
    reminderNotifTitle: "Lời nhắc sư phụ",
    reminderNotifBody: "Test: dành 5 phút ôn lại kỹ thuật hôm nay nhé.",
    remindersStatus: "Trạng thái",
    remindersOn: "Đang bật",
    remindersOff: "Chưa bật",
    remindersApiHint: "Dùng Notification API + Service Worker.",
    disableReminders: "Tắt lời nhắc",
    enableReminders: "Bật lời nhắc",
    sendTest: "Gửi test",
    reminderThreshold: "Ngưỡng nhắc",
    daysNoReview: "ngày chưa ôn",
    reminderThresholdHint:
      "Lời nhắc dựa trên lần gần nhất bạn xem bài học/kỹ thuật/video trong app.",
    profileTitle: "Thông tin học viên",
    profileDesc: "Hồ sơ và nhật ký tập được lưu trên máy (localStorage).",
    fullName: "Họ tên",
    fullNamePlaceholder: "Ví dụ: Nguyễn Văn A",
    currentBeltLabel: "Cấp đai hiện tại",
    digitalCertTitle: "Võ Bằng Số",
    digitalCertDesc:
      "Khi bạn hoàn thành 100% lộ trình một cấp đai, hệ thống tự cấp chứng nhận kèm QR Code để xác minh.",
    noCertificate: (beltTitle) => `Chưa có chứng nhận nào. Hoàn thành lộ trình ${beltTitle} để nhận Võ Bằng Số.`,
    progressNow: (done, total) => `Tiến độ hiện tại: ${done}/${total} bài.`,
    historyDiaryTitle: "Lịch sử & nhật ký",
    historyDiaryDesc: "Lưu lại mốc lên đai và các buổi tập của bạn.",
    beltHistoryTitle: "Lịch sử lên đai",
    beltLabel: "Cấp đai",
    dateLabel: "Ngày",
    addBeltMilestone: "Thêm mốc lên đai",
    delete: "Xóa",
    noBeltMilestone: "Chưa có mốc lên đai nào.",
    diaryTitle: "Nhật ký tập luyện",
    diaryDate: "Ngày",
    diaryEntryTitle: "Tiêu đề",
    diaryEntryTitleHint: "Ví dụ: Luyện bài quyền số 1, đá tống trước",
    diaryEntryTitlePlaceholder: "Bạn đã tập gì hôm nay?",
    diaryNote: "Ghi chú",
    diaryNoteHint: "Cảm giác, lỗi thường gặp, mục tiêu buổi sau...",
    diaryNotePlaceholder: "Ví dụ: còn hụt hơi ở hiệp 2, cần chú ý thăng bằng khi đá...",
    saveDiary: "Lưu nhật ký",
    diaryFetchError: "Không lấy được phản hồi AI.",
    diaryNoReply: "AI chưa phản hồi. Bạn thử lại nhé.",
    diaryAskAi: "AI phản hồi",
    diaryAiResponding: "AI đang phản hồi...",
    diaryReplyLabel: "AI phản hồi",
    diarySessionFallback: "Buổi tập",
    noDiary: "Chưa có nhật ký. Bắt đầu buổi tập đầu tiên để theo dõi tiến độ.",
  };
}

function safeFileSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function downloadTextFile({ filename, text, mime }) {
  if (typeof window === "undefined") return;
  const name = String(filename || "download.txt").trim() || "download.txt";
  const blob = new Blob([String(text || "")], { type: String(mime || "text/plain") });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function DigitalCertificateCard({ cert, belt, fallbackName, locale, copy }) {
  const qrWrapRef = useRef(null);

  const studentName = String(cert?.studentName || fallbackName || copy.fallbackStudent).trim() || copy.fallbackStudent;
  const beltTitle = String(belt?.title || cert?.beltId || "").trim() || copy.beltFallback;

  const verifyPath = useMemo(() => {
    const payload = {
      id: String(cert?.id || ""),
      beltId: String(cert?.beltId || ""),
      beltTitle,
      studentName,
      issuedAt: Number(cert?.issuedAt) || 0,
      v: 1,
    };

    const token = base64UrlEncodeJson(payload);
    const qp = token ? `?c=${encodeURIComponent(token)}` : "";
    return `/bang-so${qp}`;
  }, [beltTitle, cert?.beltId, cert?.id, cert?.issuedAt, studentName]);

  const verifyUrl = useMemo(() => {
    if (typeof window === "undefined") return verifyPath;
    const origin = String(window.location.origin || "").trim();
    return origin ? `${origin}${verifyPath}` : verifyPath;
  }, [verifyPath]);

  const eqLine = useMemo(() => {
    return copy.certHonorLine(studentName);
  }, [copy, studentName]);

  const onDownloadSvg = () => {
    const qrSvg = qrWrapRef.current ? qrWrapRef.current.querySelector("svg") : null;
    if (!qrSvg) return;

    const viewBox = String(qrSvg.getAttribute("viewBox") || "0 0 256 256");
    const qrInner = String(qrSvg.innerHTML || "");

    const styles = getComputedStyle(document.documentElement);
    const bg = String(styles.getPropertyValue("--app-bg") || "").trim() || "rgb(2, 6, 23)";
    const fg = String(styles.getPropertyValue("--app-fg") || "").trim() || "rgb(248, 250, 252)";

    const bodyFont = String(getComputedStyle(document.body).fontFamily || "").trim() || "ui-sans-serif, system-ui";

    const issued = formatDateByLocale(cert?.issuedAt, locale);
    const certId = String(cert?.id || "").trim();
    const title = copy.certLabel;
    const subtitle = copy.certSubtitle(beltTitle);

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <defs>
    <radialGradient id="g" cx="30%" cy="20%" r="80%">
      <stop offset="0%" stop-color="rgba(59,130,246,0.25)" />
      <stop offset="55%" stop-color="rgba(0,0,0,0)" />
    </radialGradient>
  </defs>

  <rect x="0" y="0" width="1200" height="675" rx="36" fill="${bg}" />
  <rect x="0" y="0" width="1200" height="675" rx="36" fill="url(#g)" />
  <rect x="22" y="22" width="1156" height="631" rx="28" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="2" />

  <text x="70" y="110" fill="${fg}" font-family="${bodyFont}" font-size="18" letter-spacing="2" opacity="0.85">${title}</text>
  <text x="70" y="156" fill="${fg}" font-family="${bodyFont}" font-size="34" font-weight="700">${subtitle}</text>

  <text x="70" y="260" fill="${fg}" font-family="${bodyFont}" font-size="18" opacity="0.75">${copy.certStudentLabel}</text>
  <text x="70" y="312" fill="${fg}" font-family="${bodyFont}" font-size="54" font-weight="700">${studentName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>

  <text x="70" y="380" fill="${fg}" font-family="${bodyFont}" font-size="18" opacity="0.75">${copy.certCodeLabel}</text>
  <text x="70" y="420" fill="${fg}" font-family="${bodyFont}" font-size="20">${certId.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>

  <text x="70" y="466" fill="${fg}" font-family="${bodyFont}" font-size="18" opacity="0.75">${copy.certIssuedLabel}</text>
  <text x="70" y="506" fill="${fg}" font-family="${bodyFont}" font-size="20">${issued}</text>

  <text x="70" y="570" fill="${fg}" font-family="${bodyFont}" font-size="18" opacity="0.75">${copy.certVerifyLabel}</text>
  <text x="70" y="604" fill="${fg}" font-family="${bodyFont}" font-size="16" opacity="0.9">${verifyUrl.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>

  <rect x="905" y="386" width="220" height="220" rx="22" fill="white" opacity="0.98" />
  <svg x="915" y="396" width="200" height="200" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">${qrInner}</svg>
  <text x="1015" y="632" fill="${fg}" font-family="${bodyFont}" font-size="14" text-anchor="middle" opacity="0.8">${copy.certScanHint}</text>

  <text x="70" y="642" fill="${fg}" font-family="${bodyFont}" font-size="16" opacity="0.92">${eqLine.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>
</svg>`;

    const file = `vo-bang-so_${safeFileSlug(beltTitle)}_${safeFileSlug(studentName)}_${String(cert?.id || "").slice(0, 8)}.svg`;
    downloadTextFile({ filename: file, text: svg, mime: "image/svg+xml;charset=utf-8" });
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-300 tracking-widest">{copy.certLabel}</div>
          <div className="mt-2 text-sm font-semibold text-white">{copy.certSubtitle(beltTitle)}</div>
          <div className="mt-3 text-2xl font-semibold tracking-tight text-white">{studentName}</div>
          <div className="mt-3 grid gap-1 text-xs text-slate-300">
            <div>
              <span className="text-slate-200">{copy.certCodeShort}:</span>{" "}
              <span className="font-mono text-cyan-200">{String(cert?.id || "").trim() || "-"}</span>
            </div>
            <div>
              <span className="text-slate-200">{copy.certIssuedLabel}:</span>{" "}
              <span className="font-semibold text-white">{formatDateByLocale(cert?.issuedAt, locale) || "-"}</span>
            </div>
          </div>
          <div className="mt-3 text-xs leading-5 text-slate-200">{eqLine}</div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onDownloadSvg}
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
            >
              {copy.certDownloadSvg}
            </button>
            <a
              href={verifyPath}
              className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
            >
              {copy.certOpenVerify}
            </a>
          </div>
        </div>

        <div className="shrink-0">
          <div className="rounded-2xl bg-white p-3" ref={qrWrapRef}>
            <QRCode value={verifyUrl} size={132} />
          </div>
          <div className="mt-2 text-center text-xs text-slate-300">{copy.certScanHint}</div>
        </div>
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

function makeId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function getLessonsForBeltSafe(beltId) {
  const safeBeltId = String(beltId || "").trim();
  if (!safeBeltId) return [];

  if (typeof getLessonsByBeltId === "function") {
    return getLessonsByBeltId(safeBeltId);
  }

  const belt = getBeltById(safeBeltId);
  const levelId = String(belt?.lessonLevel || "").trim();
  if (typeof getLessonsByLevel === "function" && levelId) {
    return getLessonsByLevel(levelId);
  }

  return [];
}

export default function ProfileDashboard() {
  const locale = useLocale();
  const copy = useMemo(() => getCopy(locale), [locale]);

  const [profile, setProfile] = useState(() => {
    const base = readProfile();
    if (typeof base.joinedAt === "number" && base.joinedAt > 0) return base;
    return {
      ...base,
      joinedAt: Date.now(),
    };
  });
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [reminderNotice, setReminderNotice] = useState("");

  const [doneSlugs, setDoneSlugs] = useState([]);

  const [beltEntry, setBeltEntry] = useState(() => ({
    beltId: readProfile().beltId,
    date: todayInput(),
  }));

  const [diaryEntry, setDiaryEntry] = useState(() => ({
    date: todayInput(),
    title: "",
    note: "",
  }));

  const [diaryAiBusyId, setDiaryAiBusyId] = useState("");
  const [diaryAiError, setDiaryAiError] = useState("");

  const planId = profile?.planId === "premium" ? "premium" : "free";
  const isPremium = planId === "premium";

  useEffect(() => {
    const sync = () => {
      const done = readDoneSlugs();
      setDoneSlugs(Array.isArray(done) ? done : []);
    };

    sync();
    window.addEventListener("vovinam-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vovinam-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    // Auto-issue digital certificates when a belt roadmap is 100% completed.
    setProfile((p) => {
      const existing = Array.isArray(p.certificates) ? p.certificates : [];
      const byBelt = new Set(existing.map((c) => String(c?.beltId || "")));
      const doneSet = new Set(Array.isArray(doneSlugs) ? doneSlugs : []);

      const next = existing.slice();
      let changed = false;

      for (const belt of BELTS) {
        const beltId = String(belt?.id || "").trim();
        if (!beltId) continue;

        const lessons = getLessonsForBeltSafe(beltId);
        const slugs = lessons.map((l) => l.slug).filter(Boolean);
        if (!slugs.length) continue;
        const complete = slugs.every((s) => doneSet.has(s));
        if (!complete) continue;
        if (byBelt.has(beltId)) continue;

        next.push({
          id: makeId("cert"),
          beltId,
          issuedAt: Date.now(),
          studentName: String(p.name || "").trim() || null,
        });
        byBelt.add(beltId);
        changed = true;
      }

      if (!changed) return p;

      next.sort((a, b) => Number(b.issuedAt) - Number(a.issuedAt));

      return {
        ...p,
        certificates: next,
        // Backward-compatible single id.
        certificateId: p.certificateId || next[0]?.id || "",
      };
    });
  }, [doneSlugs]);

  useEffect(() => {
    const sync = () => {
      setProfile(readProfile());
    };
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    writeProfile(profile);
  }, [profile]);

  const currentBelt = useMemo(() => {
    return getBeltById(profile.beltId) || BELTS[0];
  }, [profile.beltId]);

  const earnedBadges = useMemo(() => {
    return computeBadges(doneSlugs).filter((b) => b.earned);
  }, [doneSlugs]);

  const localizedBadges = useMemo(() => {
    const titles = copy.badgeTitleById || {};
    const descriptions = copy.badgeDescById || {};

    return earnedBadges.map((b) => ({
      ...b,
      title: String(titles[b.id] || b.title || ""),
      description: String(descriptions[b.id] || b.description || ""),
    }));
  }, [copy, earnedBadges]);

  const personalizedStatus = useMemo(() => {
    const msPerDay = 24 * 60 * 60 * 1000;
    const joinedAt = typeof profile.joinedAt === "number" ? profile.joinedAt : 0;
    const baseNow = typeof nowMs === "number" && nowMs > 0 ? nowMs : joinedAt;

    const days = joinedAt && baseNow >= joinedAt
      ? Math.max(1, Math.floor((baseNow - joinedAt) / msPerDay) + 1)
      : 1;

    const currentIndex = BELTS.findIndex((b) => b.id === profile.beltId);
    const nextBelt = currentIndex >= 0 && currentIndex < BELTS.length - 1 ? BELTS[currentIndex + 1] : null;

    const encouragement = nextBelt
      ? copy.encouragementNext(nextBelt.title)
      : copy.encouragementFinal;

    return {
      days,
      encouragement,
    };
  }, [copy, nowMs, profile.beltId, profile.joinedAt]);

  const reminders = profile.reminders && typeof profile.reminders === "object" ? profile.reminders : { enabled: false };

  const sendTestReminder = async () => {
    setReminderNotice("");

    if (typeof window === "undefined" || !("Notification" in window)) {
      setReminderNotice(copy.browserNoNotification);
      return;
    }

    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      setReminderNotice(copy.noNotificationPermission);
      return;
    }

    if (!("serviceWorker" in navigator)) {
      setReminderNotice(copy.noServiceWorker);
      return;
    }

    const reg = await navigator.serviceWorker.ready.catch(() => null);
    if (!reg || typeof reg.showNotification !== "function") {
      setReminderNotice(copy.notificationNotReady);
      return;
    }

    await reg.showNotification(copy.reminderNotifTitle, {
      body: copy.reminderNotifBody,
      tag: "vovinam-sifu-test",
      data: { url: "/ky-thuat" },
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    });
  };

  const toggleReminders = async () => {
    setReminderNotice("");

    if (reminders.enabled) {
      setProfile((p) => ({
        ...p,
        reminders: {
          ...p.reminders,
          enabled: false,
        },
      }));
      return;
    }

    if (typeof window === "undefined" || !("Notification" in window)) {
      setReminderNotice(copy.browserNoNotification);
      return;
    }

    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      setReminderNotice(copy.noNotificationPermission);
      return;
    }

    setProfile((p) => ({
      ...p,
      reminders: {
        ...p.reminders,
        enabled: true,
      },
    }));
  };

  const sortedHistory = useMemo(() => {
    const list = Array.isArray(profile.beltHistory) ? profile.beltHistory : [];

    return [...list]
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const id = String(x.id || "");
        const beltId = String(x.beltId || "");
        const date = String(x.date || "");
        if (!id || !beltId || !date) return null;
        return { id, beltId, date };
      })
      .filter(Boolean)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [profile.beltHistory]);

  const sortedDiary = useMemo(() => {
    const list = Array.isArray(profile.diary) ? profile.diary : [];

    return [...list]
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const id = String(x.id || "");
        const date = String(x.date || "");
        const title = String(x.title || "");
        const note = String(x.note || "");
        const aiReply = String(x.aiReply || "");
        const aiMode = String(x.aiMode || "");
        const aiRepliedAt =
          typeof x.aiRepliedAt === "number" && Number.isFinite(x.aiRepliedAt)
            ? x.aiRepliedAt
            : 0;
        if (!id || !date) return null;
        return { id, date, title, note, aiReply, aiMode, aiRepliedAt };
      })
      .filter(Boolean)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [profile.diary]);

  async function requestDiaryAiFeedback(entry) {
    const id = String(entry?.id || "");
    if (!id) return;

    setDiaryAiError("");
    setDiaryAiBusyId(id);

    try {
      const payload = {
        name: profile?.name,
        beltId: profile?.beltId,
        entry: {
          date: String(entry?.date || "").trim(),
          title: String(entry?.title || "").trim(),
          note: String(entry?.note || "").trim(),
        },
      };

      const res = await callGateway({
        target: "aiDiary",
        method: "POST",
        payload,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = String(data?.error || copy.diaryFetchError);
        throw new Error(msg);
      }

      const reply = String(data?.reply || "").trim();
      if (!reply) {
        throw new Error(copy.diaryNoReply);
      }

      const mode = String(data?.mode || "").trim();
      const repliedAt = Date.now();

      setProfile((p) => ({
        ...p,
        diary: (Array.isArray(p.diary) ? p.diary : []).map((d) =>
          d && d.id === id
            ? { ...d, aiReply: reply, aiMode: mode, aiRepliedAt: repliedAt }
            : d
        ),
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : copy.diaryFetchError;
      setDiaryAiError(String(msg || copy.diaryFetchError));
    } finally {
      setDiaryAiBusyId("");
    }
  }

  const certificates = useMemo(() => {
    const list = Array.isArray(profile.certificates) ? profile.certificates : [];
    return [...list].sort((a, b) => Number(b.issuedAt) - Number(a.issuedAt));
  }, [profile.certificates]);

  const currentBeltProgress = useMemo(() => {
    const beltId = String(profile.beltId || BELTS[0]?.id || "");
    const lessons = getLessonsForBeltSafe(beltId);
    const slugs = lessons.map((l) => l.slug).filter(Boolean);
    const doneSet = new Set(Array.isArray(doneSlugs) ? doneSlugs : []);
    const doneCount = slugs.filter((s) => doneSet.has(s)).length;
    return { beltId, beltTitle: getBeltById(beltId)?.title || "", doneCount, total: slugs.length };
  }, [doneSlugs, profile.beltId]);

  const addBeltHistory = () => {
    const belt = getBeltById(beltEntry.beltId);
    const date = String(beltEntry.date || "").trim();
    if (!belt || !date) return;

    const entry = {
      id: makeId("belt"),
      beltId: belt.id,
      date,
    };

    setProfile((p) => ({
      ...p,
      beltId: belt.id,
      beltHistory: [entry, ...(Array.isArray(p.beltHistory) ? p.beltHistory : [])],
    }));
  };

  const removeBeltHistory = (id) => {
    const safeId = String(id || "");
    setProfile((p) => ({
      ...p,
      beltHistory: (Array.isArray(p.beltHistory) ? p.beltHistory : []).filter(
        (x) => x && x.id !== safeId
      ),
    }));
  };

  const addDiary = () => {
    const date = String(diaryEntry.date || "").trim();
    const title = String(diaryEntry.title || "").trim();
    const note = String(diaryEntry.note || "").trim();

    if (!date) return;

    const entry = {
      id: makeId("diary"),
      date,
      title,
      note,
    };

    setDiaryAiError("");

    setProfile((p) => ({
      ...p,
      diary: [entry, ...(Array.isArray(p.diary) ? p.diary : [])],
    }));

    setDiaryEntry((s) => ({ ...s, title: "", note: "" }));

    // Auto: AI đọc nhật ký và phản hồi sau khi lưu.
    requestDiaryAiFeedback(entry);
  };

  const removeDiary = (id) => {
    const safeId = String(id || "");
    setProfile((p) => ({
      ...p,
      diary: (Array.isArray(p.diary) ? p.diary : []).filter((x) => x && x.id !== safeId),
    }));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section
        id="goi-premium"
        className="scroll-mt-24 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-card-strong)] sm:p-8 lg:col-span-2"
      >
        <h2 className="text-xl font-semibold text-white">{copy.planTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {copy.planDesc}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-[var(--shadow-card)]">
            <div className="text-xs font-semibold text-slate-300">{copy.currentPlan}</div>
            <div className="mt-2 text-sm font-semibold text-white">{isPremium ? copy.planPremiumValue : copy.planFreeValue}</div>
            <div className="mt-1 text-xs text-slate-400">{copy.demoLocal}</div>

            <button
              type="button"
              onClick={() => {
                setProfile((p) => ({
                  ...p,
                  planId: isPremium ? "free" : "premium",
                }));
              }}
              className={
                "mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 " +
                (isPremium
                  ? "border border-white/10 bg-white/5 text-white hover:bg-white/10 focus:ring-blue-400/30"
                  : "bg-linear-to-r from-cyan-300 to-blue-500 text-slate-950 hover:brightness-110 focus:ring-cyan-300/50")
              }
            >
              {isPremium ? copy.turnOffPremium : copy.upgradePremiumDemo}
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-[var(--shadow-card)] sm:col-span-2">
            <div className="text-xs font-semibold text-slate-300">{copy.planBenefits}</div>
            <ul className="mt-2 grid gap-1 text-sm leading-6 text-slate-300">
              {isPremium ? (
                <>
                  <li>• {copy.benefitPremium1}</li>
                  <li>• {copy.benefitPremium2}</li>
                  <li>• {copy.benefitPremium3}</li>
                </>
              ) : (
                <>
                  <li>• {copy.benefitFree1}</li>
                  <li>• {copy.benefitFree2}</li>
                  <li>• {copy.benefitFree3}</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
          {copy.stripeHint}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-card)] sm:p-8 lg:col-span-2">
        <h2 className="text-xl font-semibold text-white">{copy.todayTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {copy.todayLine(personalizedStatus.days, personalizedStatus.encouragement)}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-[var(--shadow-card)]">
            <div className="text-xs font-semibold text-slate-300">{copy.currentBelt}</div>
            <div className="mt-2 text-sm font-semibold text-white">{currentBelt?.title}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-[var(--shadow-card)]">
            <div className="text-xs font-semibold text-slate-300">{copy.goal}</div>
            <div className="mt-2 text-sm font-semibold text-white">{copy.goalText}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-[var(--shadow-card)]">
            <div className="text-xs font-semibold text-slate-300">{copy.quickSuggestion}</div>
            <div className="mt-2 text-sm leading-6 text-slate-300">{copy.quickSuggestionText}</div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-card)] sm:p-8 lg:col-span-2">
        <h2 className="text-xl font-semibold text-white">{copy.badgesTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {copy.badgesDesc}
        </p>

        {localizedBadges.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {localizedBadges.map((b) => (
              <div key={b.id} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-[var(--shadow-card)]">
                <div className="text-sm font-semibold text-white">{b.title}</div>
                <div className="mt-1 text-sm leading-6 text-slate-300">{b.description}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-300 shadow-[var(--shadow-card)]">
            {copy.noBadges}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-card)] sm:p-8 lg:col-span-2">
        <h2 className="text-xl font-semibold text-white">{copy.remindersTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {copy.remindersDesc}
        </p>

        {reminderNotice ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-200 shadow-[var(--shadow-card)]">
            {reminderNotice}
          </div>
        ) : null}

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-[var(--shadow-card)]">
            <div className="text-xs font-semibold text-slate-300">{copy.remindersStatus}</div>
            <div className="mt-2 text-sm font-semibold text-white">
              {reminders.enabled ? copy.remindersOn : copy.remindersOff}
            </div>
            <div className="mt-1 text-xs text-slate-400">{copy.remindersApiHint}</div>
          </div>

          <button
            type="button"
            onClick={toggleReminders}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-linear-to-r from-cyan-300 to-blue-500 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
          >
            {reminders.enabled ? copy.disableReminders : copy.enableReminders}
          </button>

          <button
            type="button"
            onClick={sendTestReminder}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            {copy.sendTest}
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-[var(--shadow-card)]">
          <div className="text-xs font-semibold text-slate-300">{copy.reminderThreshold}</div>
          <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <input
              type="number"
              min={1}
              max={14}
              value={reminders.daysWithoutPractice || 3}
              onChange={(e) => {
                const v = Math.max(1, Math.min(14, Math.round(Number(e.target.value) || 3)));
                setProfile((p) => ({
                  ...p,
                  reminders: {
                    ...p.reminders,
                    daysWithoutPractice: v,
                  },
                }));
              }}
              className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
            />
            <div className="text-sm font-semibold text-slate-200">{copy.daysNoReview}</div>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            {copy.reminderThresholdHint}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-card)] sm:p-8">
        <h2 className="text-xl font-semibold text-white">{copy.profileTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {copy.profileDesc}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label={copy.fullName}>
            <input
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
              placeholder={copy.fullNamePlaceholder}
            />
          </Field>

          <Field label={copy.currentBeltLabel} hint={currentBelt?.description}>
            <select
              value={profile.beltId}
              onChange={(e) => {
                const next = e.target.value;
                setProfile((p) => ({ ...p, beltId: next }));
                setBeltEntry((s) => ({ ...s, beltId: next }));
              }}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
            >
              {BELTS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} • {b.short}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/35 p-6 shadow-[var(--shadow-card)]">
          <p className="text-sm font-semibold text-white">{copy.digitalCertTitle}</p>
          <p className="mt-1 text-sm leading-6 text-slate-300">
            {copy.digitalCertDesc}
          </p>

          {certificates.length ? (
            <div className="mt-4 grid gap-3">
              {certificates.map((c) => {
                const belt = getBeltById(String(c?.beltId || ""));
                return (
                  <DigitalCertificateCard
                    key={c.id}
                    cert={c}
                    belt={belt}
                    fallbackName={profile.name}
                    locale={locale}
                    copy={copy}
                  />
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              {copy.noCertificate(currentBeltProgress.beltTitle || currentBelt?.title || copy.beltFallback)}
              {currentBeltProgress.total ? (
                <div className="mt-2 text-xs text-slate-400">
                  {copy.progressNow(currentBeltProgress.doneCount, currentBeltProgress.total)}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-card)] sm:p-8">
        <h2 className="text-xl font-semibold text-white">{copy.historyDiaryTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {copy.historyDiaryDesc}
        </p>

        <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/35 p-6 shadow-[var(--shadow-card)]">
          <p className="text-sm font-semibold text-white">{copy.beltHistoryTitle}</p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label={copy.beltLabel}>
              <select
                value={beltEntry.beltId}
                onChange={(e) => setBeltEntry((s) => ({ ...s, beltId: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
              >
                {BELTS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={copy.dateLabel}>
              <input
                type="date"
                value={beltEntry.date}
                onChange={(e) => setBeltEntry((s) => ({ ...s, date: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
              />
            </Field>
          </div>

          <button
            type="button"
            onClick={addBeltHistory}
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-linear-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
          >
            {copy.addBeltMilestone}
          </button>

          {sortedHistory.length ? (
            <div className="mt-4 grid gap-2">
              {sortedHistory.map((h) => {
                const belt = getBeltById(h.beltId);

                return (
                  <div
                    key={h.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">{belt?.title || h.beltId}</div>
                      <div className="mt-1 text-xs text-slate-300">{h.date}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBeltHistory(h.id)}
                      className="text-xs font-semibold text-slate-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/30 rounded-xl px-2 py-1"
                    >
                      {copy.delete}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              {copy.noBeltMilestone}
            </div>
          )}
        </div>

        <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/35 p-6 shadow-[var(--shadow-card)]">
          <p className="text-sm font-semibold text-white">{copy.diaryTitle}</p>

          <div className="mt-3 grid gap-3">
            <Field label={copy.diaryDate}>
              <input
                type="date"
                value={diaryEntry.date}
                onChange={(e) => setDiaryEntry((s) => ({ ...s, date: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
              />
            </Field>
            <Field label={copy.diaryEntryTitle} hint={copy.diaryEntryTitleHint}>
              <input
                value={diaryEntry.title}
                onChange={(e) => setDiaryEntry((s) => ({ ...s, title: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
                placeholder={copy.diaryEntryTitlePlaceholder}
              />
            </Field>
            <Field label={copy.diaryNote} hint={copy.diaryNoteHint}>
              <textarea
                value={diaryEntry.note}
                onChange={(e) => setDiaryEntry((s) => ({ ...s, note: e.target.value }))}
                className="min-h-[96px] w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
                placeholder={copy.diaryNotePlaceholder}
              />
            </Field>
          </div>

          <button
            type="button"
            onClick={addDiary}
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            {copy.saveDiary}
          </button>

          {diaryAiError ? (
            <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-200">
              {diaryAiError}
            </div>
          ) : null}

          {sortedDiary.length ? (
            <div className="mt-4 grid gap-2">
              {sortedDiary.map((d) => (
                <div key={d.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {d.title ? d.title : copy.diarySessionFallback}
                      </div>
                      <div className="mt-1 text-xs text-slate-300">{d.date}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!d.aiReply ? (
                        <button
                          type="button"
                          disabled={diaryAiBusyId === d.id}
                          onClick={() => requestDiaryAiFeedback(d)}
                          className={
                            "text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300/30 rounded-xl px-2 py-1 " +
                            (diaryAiBusyId === d.id
                              ? "text-slate-400"
                              : "text-cyan-200 hover:text-white")
                          }
                        >
                          {diaryAiBusyId === d.id ? copy.diaryAiResponding : copy.diaryAskAi}
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => removeDiary(d.id)}
                        className="text-xs font-semibold text-slate-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/30 rounded-xl px-2 py-1"
                      >
                        {copy.delete}
                      </button>
                    </div>
                  </div>
                  {d.note ? (
                    <p className="mt-3 text-sm leading-6 text-slate-300">{d.note}</p>
                  ) : null}

                  {d.aiReply ? (
                    <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-[var(--shadow-card)]">
                      <div className="text-xs font-semibold text-slate-300">{copy.diaryReplyLabel}</div>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-200">
                        {d.aiReply}
                      </p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              {copy.noDiary}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

