import AiCoachChat from "@/components/AiCoachChat";
import MotivationPanel from "@/components/MotivationPanel";
import PoseCoach from "@/components/PoseCoach";
import Link from "next/link";
import { getLocale } from "next-intl/server";

export const metadata = {
  title: "AI Coach",
};

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      description:
        "Chat assistant for quick Vovinam technique and martial ethics Q&A in RAG style. With OpenAI + Supabase Vector configured, answers are grounded in ingested documents (with streaming). Without setup, the app falls back to local project data.",
      arena: "Open AI Arena →",
      chip: "Coach Intelligence",
      capability1: "RAG grounded answers",
      capability2: "Streaming response",
      capability3: "Pose support",
      sectionChat: "AI Chat Coach",
      sectionPose: "Pose Coach",
      motivationTitle: "Ask clearly, improve faster",
      motivationMessage:
        "Use short, specific questions. The clearer your context, the more useful and safer the coaching guidance becomes.",
      motivationPoint1: "Describe current belt and goal",
      motivationPoint2: "Mention pain/discomfort honestly",
      motivationPoint3: "Request one next step at a time",
      motivationPrimary: "Start coaching",
      motivationSecondary: "Open AI Arena",
    };
  }

  if (id === "ja") {
    return {
      description:
        "RAG形式で技術/武道精神の質問に答えるチャットアシスタントです。OpenAI + Supabase Vector を設定すると、取り込んだ資料に基づく回答（ストリーミング）になります。未設定の場合はプロジェクト内データにフォールバックします。",
      arena: "AIアリーナへ →",
      chip: "コーチインテリジェンス",
      capability1: "RAG根拠回答",
      capability2: "ストリーミング応答",
      capability3: "姿勢サポート",
      sectionChat: "AIチャットコーチ",
      sectionPose: "ポーズコーチ",
      motivationTitle: "質問を明確にすると、改善は早くなる",
      motivationMessage:
        "短く具体的に質問しましょう。文脈が明確なほど、より安全で実用的なアドバイスが得られます。",
      motivationPoint1: "帯レベルと目標を先に伝える",
      motivationPoint2: "痛みや違和感は正直に書く",
      motivationPoint3: "次の一歩を1つだけ聞く",
      motivationPrimary: "コーチング開始",
      motivationSecondary: "AIアリーナへ",
    };
  }

  return {
    description:
      "Chatbot hỗ trợ hỏi nhanh kỹ thuật/võ đạo theo dạng RAG. Nếu có cấu hình OpenAI + Supabase Vector, AI sẽ trả lời grounded theo tài liệu đã ingest (có streaming). Nếu chưa cấu hình, hệ thống sẽ fallback sang dữ liệu trong project.",
    arena: "Vào Đấu trường AI →",
    chip: "Coach Intelligence",
    capability1: "RAG grounded answers",
    capability2: "Streaming response",
    capability3: "Pose support",
    sectionChat: "AI Chat Coach",
    sectionPose: "Pose Coach",
    motivationTitle: "Hỏi rõ hơn để tiến bộ nhanh hơn",
    motivationMessage:
      "Đặt câu hỏi ngắn, cụ thể. Bối cảnh càng rõ thì hướng dẫn từ AI càng hữu ích và an toàn hơn cho bạn.",
    motivationPoint1: "Nêu cấp đai và mục tiêu hiện tại",
    motivationPoint2: "Nói thật về đau/khó chịu",
    motivationPoint3: "Xin đúng 1 bước tiếp theo",
    motivationPrimary: "Bắt đầu coaching",
    motivationSecondary: "Vào AI Arena",
  };
}

export default async function AiCoachPage() {
  const locale = await getLocale();
  const copy = getCopy(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)] fade-in-up">
        <div className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
          {copy.chip}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          AI Coach (RAG)
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          {copy.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">{copy.capability1}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">{copy.capability2}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">{copy.capability3}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/dau-truong-ai"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            {copy.arena}
          </Link>
        </div>
      </header>

      <div className="mb-4">
        <MotivationPanel
          title={copy.motivationTitle}
          message={copy.motivationMessage}
          points={[copy.motivationPoint1, copy.motivationPoint2, copy.motivationPoint3]}
          primaryHref="/ai-coach"
          primaryLabel={copy.motivationPrimary}
          secondaryHref="/dau-truong-ai"
          secondaryLabel={copy.motivationSecondary}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 stagger-fade">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[var(--shadow-card)]">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">{copy.sectionChat}</h2>
          <AiCoachChat />
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[var(--shadow-card)]">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">{copy.sectionPose}</h2>
          <PoseCoach />
        </section>
      </div>
    </div>
  );
}
