import { getLocale } from "next-intl/server";

export const metadata = {
  title: "Chính sách bảo mật",
};

function Block({ title, children }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-3 text-sm leading-7 text-slate-300">{children}</div>
    </section>
  );
}

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      heading: "Privacy policy",
      intro: "This page explains how the app handles your data.",
      section1Title: "1) Data we store",
      section1P1:
        "The app prioritizes storing learning data locally on your device. It may also support Google sign-in (via Supabase Auth) for features like Community and the Admin/Coach area.",
      section1P2: "Common data stored in your browser includes:",
      section1Item1: "Completed lesson progress.",
      section1Item2: "Your 7-day training schedule.",
      section2Title: "2) Where data is stored",
      section2P1:
        "Data is stored locally using browser localStorage. You can remove it by clearing site data in your browser.",
      section3Title: "3) Third-party data sharing",
      section3P1:
        "Most progress/schedule data stays on your device. If you choose Google sign-in, authentication goes through Google and Supabase (infrastructure providers).",
      section4Title: "4) Security",
      section4P1:
        "The app enables common web security settings (security headers) to reduce XSS/clickjacking and unauthorized embedding risks.",
      section4P2:
        "However, no system is guaranteed to be absolutely 100% secure. You should:",
      section4Item1: "Use an up-to-date browser.",
      section4Item2: "Avoid untrusted extensions that can read browser data.",
      section4Item3: "Access the app only from trusted sources/links.",
      section5Title: "5) Contact",
      section5P1:
        "If you want a contact page (email/form) or sign-in flow enhancements, we can add them on request.",
    };
  }

  if (id === "ja") {
    return {
      heading: "プライバシーポリシー",
      intro: "このページでは、アプリがデータをどのように扱うかを説明します。",
      section1Title: "1) 保存するデータ",
      section1P1:
        "本アプリは学習データを端末内にローカル保存することを優先します。さらに、Community や Admin/Coach 機能のために Google ログイン（Supabase Auth 経由）をサポートする場合があります。",
      section1P2: "通常、ブラウザに保存されるデータは次のとおりです。",
      section1Item1: "完了済みレッスンの進捗。",
      section1Item2: "作成した7日間トレーニング計画。",
      section2Title: "2) データ保存場所",
      section2P1:
        "データはブラウザの localStorage にローカル保存されます。ブラウザのサイトデータを削除すると消去できます。",
      section3Title: "3) 第三者とのデータ共有",
      section3P1:
        "進捗やスケジュールの大半は端末内に留まります。Google ログインを利用する場合、認証は Google と Supabase（基盤提供者）を経由します。",
      section4Title: "4) セキュリティ",
      section4P1:
        "XSS、クリックジャッキング、不正埋め込みのリスク低減のため、一般的な Web セキュリティ設定（security headers）を有効化しています。",
      section4P2:
        "ただし、100% 絶対安全なシステムはありません。次の点を推奨します。",
      section4Item1: "ブラウザを最新に保つ。",
      section4Item2: "ブラウザデータを読み取る不審な拡張機能を避ける。",
      section4Item3: "信頼できるリンク/経路からのみアクセスする。",
      section5Title: "5) お問い合わせ",
      section5P1:
        "連絡ページ（メール/フォーム）の追加やログイン機能の拡張が必要であれば、要望に応じて実装できます。",
    };
  }

  return {
    heading: "Chính sách bảo mật",
    intro: "Trang này giải thích cách ứng dụng xử lý dữ liệu của bạn.",
    section1Title: "1) Dữ liệu chúng tôi lưu",
    section1P1:
      "Ứng dụng ưu tiên lưu dữ liệu học tập cục bộ trên thiết bị. Ngoài ra, ứng dụng có thể hỗ trợ đăng nhập Google (qua Supabase Auth) để phục vụ một số tính năng như Community và khu vực Admin/Coach.",
    section1P2: "Những thứ thường được lưu trên thiết bị của bạn (trình duyệt) gồm:",
    section1Item1: "Tiến độ bài học đã hoàn thành.",
    section1Item2: "Lịch tập 7 ngày bạn tạo.",
    section2Title: "2) Dữ liệu được lưu ở đâu",
    section2P1:
      "Dữ liệu được lưu cục bộ bằng localStorage của trình duyệt. Bạn có thể xóa bằng cách xóa dữ liệu trang web trong trình duyệt.",
    section3Title: "3) Chia sẻ dữ liệu với bên thứ ba",
    section3P1:
      "Phần lớn dữ liệu tiến độ/lịch tập vẫn nằm trên thiết bị của bạn. Nếu bạn chọn đăng nhập Google, quá trình xác thực sẽ đi qua Google và Supabase (nhà cung cấp hạ tầng).",
    section4Title: "4) Bảo mật",
    section4P1:
      "Ứng dụng đã bật các cấu hình bảo mật web phổ biến (security headers) để giảm rủi ro XSS/clickjacking và các hành vi nhúng trái phép.",
    section4P2:
      "Tuy nhiên, không có hệ thống nào đảm bảo tuyệt đối 100%. Bạn nên:",
    section4Item1: "Dùng trình duyệt cập nhật.",
    section4Item2: "Không cài extension lạ có thể đọc dữ liệu trình duyệt.",
    section4Item3: "Chỉ truy cập từ nguồn/đường dẫn tin cậy.",
    section5Title: "5) Liên hệ",
    section5P1:
      "Nếu bạn muốn bổ sung trang liên hệ (email, form) hoặc triển khai đăng nhập, mình có thể thêm theo yêu cầu.",
  };
}

export default async function PrivacyPolicyPage() {
  const locale = await getLocale();
  const copy = getCopy(locale);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {copy.heading}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {copy.intro}
        </p>
      </header>

      <div className="grid gap-4">
        <Block title={copy.section1Title}>
          <p>
            {copy.section1P1}
          </p>
          <p className="mt-3">
            {copy.section1P2}
          </p>
          <ul className="mt-2 list-disc pl-5">
            <li>{copy.section1Item1}</li>
            <li>{copy.section1Item2}</li>
          </ul>
        </Block>

        <Block title={copy.section2Title}>
          <p>
            {copy.section2P1}
          </p>
        </Block>

        <Block title={copy.section3Title}>
          <p>
            {copy.section3P1}
          </p>
        </Block>

        <Block title={copy.section4Title}>
          <p>
            {copy.section4P1}
          </p>
          <p className="mt-3">
            {copy.section4P2}
          </p>
          <ul className="mt-2 list-disc pl-5">
            <li>{copy.section4Item1}</li>
            <li>{copy.section4Item2}</li>
            <li>{copy.section4Item3}</li>
          </ul>
        </Block>

        <Block title={copy.section5Title}>
          <p>
            {copy.section5P1}
          </p>
        </Block>
      </div>
    </div>
  );
}
