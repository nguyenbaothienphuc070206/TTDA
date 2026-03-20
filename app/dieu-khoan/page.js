import { getLocale } from "next-intl/server";

export const metadata = {
  title: "Điều khoản sử dụng",
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
      heading: "Terms of use",
      intro: "By using this app, you agree to the terms below.",
      section1Title: "1) Purpose",
      section1Text:
        "The app provides a roadmap and practice references to support self-training. Content does not replace direct coaching guidance.",
      section2Title: "2) Training safety",
      section2Item1: "Always warm up properly and train within your physical limits.",
      section2Item2: "Stop if you feel sharp pain, dizziness, or signs of injury.",
      section2Item3: "Advanced techniques should be supervised by a coach/training partner.",
      section3Title: "3) Responsibility",
      section3Text:
        "Users are responsible for their own training decisions and application of techniques. Project owners/developers are not liable for injuries caused by incorrect practice or overexertion.",
      section4Title: "4) Content ownership",
      section4Text:
        "Lesson content in this project is for demonstration and can be adjusted/contributed based on your needs.",
      section5Title: "5) Terms updates",
      section5Text:
        "Terms may be updated as features evolve. Please review again when a new version is released.",
    };
  }

  if (id === "ja") {
    return {
      heading: "利用規約",
      intro: "このアプリを利用することで、以下の規約に同意したものとみなされます。",
      section1Title: "1) 目的",
      section1Text:
        "本アプリは自主練習を支援するためのロードマップと参考トレーニングを提供します。内容は直接指導の代替ではありません。",
      section2Title: "2) 練習時の安全",
      section2Item1: "十分にウォームアップし、体力の範囲内で練習してください。",
      section2Item2: "鋭い痛み、めまい、けがの兆候があれば中止してください。",
      section2Item3: "難度の高い技はコーチや練習相手の監督下で行ってください。",
      section3Title: "3) 責任",
      section3Text:
        "利用者は練習内容と技術適用の判断に責任を負います。誤った練習や過負荷によるけがについて、開発者は責任を負いません。",
      section4Title: "4) コンテンツの権利",
      section4Text:
        "本プロジェクトのレッスン内容はデモ目的であり、必要に応じて修正・共同編集できます。",
      section5Title: "5) 規約の変更",
      section5Text:
        "機能変更に応じて規約が更新される場合があります。新バージョン時に再確認してください。",
    };
  }

  return {
    heading: "Điều khoản sử dụng",
    intro: "Dùng ứng dụng nghĩa là bạn đồng ý với các điều khoản dưới đây.",
    section1Title: "1) Mục đích",
    section1Text:
      "Ứng dụng cung cấp lộ trình và bài tập tham khảo để hỗ trợ việc tự luyện. Nội dung không thay thế hướng dẫn trực tiếp từ huấn luyện viên.",
    section2Title: "2) An toàn luyện tập",
    section2Item1: "Luôn khởi động kỹ và tập trong phạm vi thể lực.",
    section2Item2: "Dừng lại nếu đau nhói, chóng mặt hoặc có dấu hiệu chấn thương.",
    section2Item3: "Kỹ thuật khó nên có HLV/bạn tập giám sát.",
    section3Title: "3) Trách nhiệm",
    section3Text:
      "Người dùng tự chịu trách nhiệm cho việc luyện tập và quyết định áp dụng kỹ thuật. Chủ dự án/nhà phát triển không chịu trách nhiệm cho các chấn thương phát sinh do tập sai hoặc tập vượt khả năng.",
    section4Title: "4) Sở hữu nội dung",
    section4Text:
      "Nội dung bài học trong dự án này mang tính minh họa (demo) và có thể được chỉnh sửa/đóng góp tùy nhu cầu của bạn.",
    section5Title: "5) Thay đổi điều khoản",
    section5Text:
      "Điều khoản có thể được cập nhật khi ứng dụng thay đổi tính năng. Bạn nên kiểm tra lại khi có phiên bản mới.",
  };
}

export default async function TermsPage() {
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
            {copy.section1Text}
          </p>
        </Block>

        <Block title={copy.section2Title}>
          <ul className="list-disc pl-5">
            <li>{copy.section2Item1}</li>
            <li>{copy.section2Item2}</li>
            <li>{copy.section2Item3}</li>
          </ul>
        </Block>

        <Block title={copy.section3Title}>
          <p>
            {copy.section3Text}
          </p>
        </Block>

        <Block title={copy.section4Title}>
          <p>
            {copy.section4Text}
          </p>
        </Block>

        <Block title={copy.section5Title}>
          <p>
            {copy.section5Text}
          </p>
        </Block>
      </div>
    </div>
  );
}
