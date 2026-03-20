import ProfileDashboard from "@/components/ProfileDashboard";
import UserAuthPanel from "@/components/UserAuthPanel";
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
    };
  }

  if (id === "ja") {
    return {
      heading: "門下生プロフィール",
      description: "デジタル認定（デモ）、昇帯履歴、トレーニング日誌。",
    };
  }

  return {
    heading: "Hồ sơ học viên",
    description: "Bằng cấp số (demo), lịch sử lên đai và nhật ký tập luyện.",
  };
}

export default async function ProfilePage() {
  const locale = await getLocale();
  const copy = getCopy(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {copy.heading}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          {copy.description}
        </p>
      </header>

      <div className="mb-6">
        <UserAuthPanel />
      </div>

      <ProfileDashboard />
    </div>
  );
}
