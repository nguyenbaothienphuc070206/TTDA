import Storefront from "@/components/Storefront";
import { getLocale } from "next-intl/server";

import MotivationPanel from "@/components/MotivationPanel";

export const metadata = {
  title: "Cửa hàng",
};

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      title: "Store",
      description:
        "Affiliate model: click \"Buy from partner\" to open external product pages. The app may earn commission from qualified purchases.",
      chip: "Affiliate Store",
      trust1: "Transparent links",
      trust2: "No hidden fees",
      trust3: "Partner checkout",
      motivationTitle: "Buy what supports your training, not impulse",
      motivationMessage:
        "Choose gear that matches your current level and weekly rhythm. Consistency beats expensive equipment.",
      motivationPoint1: "Prioritize safety essentials first",
      motivationPoint2: "Match gear to your current drills",
      motivationPoint3: "Review your weekly plan before buying",
      motivationPrimary: "Open training schedule",
      motivationSecondary: "Back to learning",
    };
  }

  if (id === "ja") {
    return {
      title: "ショップ",
      description:
        "アフィリエイト型ストアです。\"提携先で購入\" を押すと外部購入ページが開きます。購入条件に応じてアプリに報酬が発生する場合があります。",
      chip: "アフィリエイトストア",
      trust1: "リンクを明示",
      trust2: "隠れ手数料なし",
      trust3: "決済は提携先",
      motivationTitle: "衝動より、練習に合う道具を選ぶ",
      motivationMessage:
        "現在のレベルと週間リズムに合う装備を選びましょう。高価さより継続が成果を作ります。",
      motivationPoint1: "まず安全装備を優先",
      motivationPoint2: "今の練習内容に合わせる",
      motivationPoint3: "購入前に週間計画を確認",
      motivationPrimary: "スケジュールを見る",
      motivationSecondary: "学習に戻る",
    };
  }

  return {
    title: "Trang bị luyện tập",
    description:
      "Chọn đúng để tập hiệu quả và an toàn.",
    chip: "Affiliate Store",
    trust1: "Liên kết đối tác",
    trust2: "Không phát sinh phí",
    trust3: "Thanh toán tại đối tác",
    motivationTitle: "Mua thứ hỗ trợ việc tập, không mua theo hứng",
    motivationMessage:
      "Hãy chọn dụng cụ đúng với cấp hiện tại và nhịp tập mỗi tuần. Sự đều đặn quan trọng hơn đồ đắt tiền.",
    motivationPoint1: "Ưu tiên đồ bảo hộ trước",
    motivationPoint2: "Chọn đồ đúng bài đang tập",
    motivationPoint3: "Xem lại lịch tuần trước khi mua",
    motivationPrimary: "Mở lịch tập",
    motivationSecondary: "Quay lại học tập",
  };
}

export default async function StorePage() {
  const locale = await getLocale();
  const copy = getCopy(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="stagger-fade grid gap-6">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
          {copy.chip}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          {copy.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">{copy.trust1}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">{copy.trust2}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">{copy.trust3}</span>
        </div>
      </header>

      <div>
        <MotivationPanel
          title={copy.motivationTitle}
          message={copy.motivationMessage}
          points={[copy.motivationPoint1, copy.motivationPoint2, copy.motivationPoint3]}
          primaryHref="/lich-tap"
          primaryLabel={copy.motivationPrimary}
          secondaryHref="/learning"
          secondaryLabel={copy.motivationSecondary}
        />
      </div>

      <Storefront />
      </div>
    </div>
  );
}
