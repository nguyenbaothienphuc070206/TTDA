import Storefront from "@/components/Storefront";
import { getLocale } from "next-intl/server";

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
    };
  }

  if (id === "ja") {
    return {
      title: "ショップ",
      description:
        "アフィリエイト型ストアです。\"提携先で購入\" を押すと外部購入ページが開きます。購入条件に応じてアプリに報酬が発生する場合があります。",
    };
  }

  return {
    title: "Cửa hàng",
    description:
      "Cửa hàng theo mô hình Affiliate: bấm “Mua tại đối tác” để mở trang mua hàng bên ngoài. Ứng dụng có thể nhận hoa hồng khi bạn mua qua liên kết.",
  };
}

export default async function StorePage() {
  const locale = await getLocale();
  const copy = getCopy(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          {copy.description}
        </p>
      </header>

      <Storefront />
    </div>
  );
}
