import ProfileDashboard from "@/components/ProfileDashboard";
import UserAuthPanel from "@/components/UserAuthPanel";
import MotivationPanel from "@/components/MotivationPanel";
import PerformanceModeControl from "@/components/PerformanceModeControl";
import Link from "next/link";
import { getLocale } from "next-intl/server";

export const metadata = {
  title: "Hồ sơ",
};

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      heading: "Student profile",
      description: "Digital certificate (demo), belt promotion history and training journal.",
      chip: "Account Center",
      sectionAuth: "Authentication",
      sectionProfile: "Training profile",
      motivationTitle: "Own your journey with calm confidence",
      motivationMessage:
        "Your profile is not just data. It is proof of discipline. Keep notes short, honest, and consistent.",
      motivationPoint1: "Log what worked today",
      motivationPoint2: "Name one thing to improve next",
      motivationPoint3: "Protect your pace, avoid comparison",
      motivationPrimary: "Update profile",
      motivationSecondary: "Open progress",
    };
  }

  if (id === "ja") {
    return {
      heading: "門下生プロフィール",
      description: "デジタル認定（デモ）、昇帯履歴、トレーニング日誌。",
      chip: "アカウントセンター",
      sectionAuth: "認証",
      sectionProfile: "トレーニングプロフィール",
      motivationTitle: "落ち着いた自信で、自分の歩みを積み上げる",
      motivationMessage:
        "プロフィールは単なるデータではなく、継続の証です。短く正直に記録しましょう。",
      motivationPoint1: "今日うまくいったことを残す",
      motivationPoint2: "次回改善する点を1つ決める",
      motivationPoint3: "比較より自分のペースを守る",
      motivationPrimary: "プロフィール更新",
      motivationSecondary: "進捗を見る",
    };
  }

  return {
    heading: "Hồ sơ luyện tập",
    description: "Kỷ luật để lại dấu vết.",
    chip: "Account Center",
    sectionAuth: "Xác thực",
    sectionProfile: "Hồ sơ luyện tập",
    motivationTitle: "Hành động hôm nay",
    motivationMessage:
      "Giữ nhịp bằng các bước nhỏ, rõ ràng và dễ làm ngay.",
    motivationPoint1: "Tập 1 bài trong 15-20 phút",
    motivationPoint2: "Đánh dấu hoàn thành ngay sau khi tập",
    motivationPoint3: "Ghi 1 dòng nhật ký ngắn",
    motivationPrimary: "Cập nhật hồ sơ",
    motivationSecondary: "Xem tiến độ",
  };
}

export default async function ProfilePage() {
  const locale = await getLocale();
  const copy = getCopy(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
          {copy.chip}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {copy.heading}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          {copy.description}
        </p>

        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          <div className="text-sm font-semibold text-white">Ngày 1</div>
          <div className="mt-1 text-sm text-slate-300">Cấp hiện tại: Lam đai</div>
          <div className="mt-1 text-sm text-slate-300">Mục tiêu: Nền tảng vững, đúng kỹ thuật</div>
          <div className="mt-2 text-sm text-slate-200">
            Nếu có 5 phút: Ôn lại 1 kỹ thuật bạn hay sai.
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-emerald-300/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100">
            Day 1 streak
          </span>
          <Link href="/hoc-tap" className="cta-primary inline-flex h-10 items-center justify-center rounded-2xl px-3 text-xs font-semibold">
            Tập ngay hôm nay
          </Link>
          <Link href="/bai-hoc/lam-dai-tu-ve-quyen" className="cta-secondary inline-flex h-10 items-center justify-center rounded-2xl px-3 text-xs font-semibold text-white">
            Đánh dấu bài đầu tiên
          </Link>
        </div>

        <PerformanceModeControl />
      </header>

      <section className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[var(--shadow-card)]">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">{copy.sectionAuth}</h2>
        <UserAuthPanel />
      </section>

      <div className="mb-6">
        <MotivationPanel
          title={copy.motivationTitle}
          message={copy.motivationMessage}
          points={[copy.motivationPoint1, copy.motivationPoint2, copy.motivationPoint3]}
          primaryHref="/ho-so"
          primaryLabel={copy.motivationPrimary}
          secondaryHref="/tien-do"
          secondaryLabel={copy.motivationSecondary}
        />
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[var(--shadow-card)]">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">{copy.sectionProfile}</h2>
        <ProfileDashboard />
      </section>
    </div>
  );
}
