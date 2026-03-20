import TechniqueLibrary from "@/components/TechniqueLibrary";
import { getLocale } from "next-intl/server";

export const metadata = {
  title: "Thư viện kỹ thuật",
};

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      title: "Technique Library (Vovinam Wiki)",
      description:
        "Look up kicks, hand techniques, stances, locks and counters with smart filters. Blue is free; Yellow/Red require Premium.",
    };
  }

  if (id === "ja") {
    return {
      title: "技術ライブラリ（Vovinam Wiki）",
      description:
        "蹴り・手技・立ち方・関節技・反撃をスマートフィルターで検索できます。青帯は無料、黄帯/紅帯は Premium が必要です。",
    };
  }

  return {
    title: "Thư viện kỹ thuật (Wiki Vovinam)",
    description:
      "Tra cứu đòn chân/đòn tay/tấn pháp/khóa gỡ/phản đòn bằng bộ lọc thông minh. Lam đai mở miễn phí; Hoàng/Hồng đai cần Premium.",
  };
}

export default async function TechniqueLibraryPage() {
  const locale = await getLocale();
  const copy = getCopy(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)] fade-in-up">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          {copy.description}
        </p>
      </header>

      <TechniqueLibrary />
    </div>
  );
}
