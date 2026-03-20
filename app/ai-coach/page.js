import AiCoachChat from "@/components/AiCoachChat";
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
    };
  }

  if (id === "ja") {
    return {
      description:
        "RAG形式で技術/武道精神の質問に答えるチャットアシスタントです。OpenAI + Supabase Vector を設定すると、取り込んだ資料に基づく回答（ストリーミング）になります。未設定の場合はプロジェクト内データにフォールバックします。",
      arena: "AIアリーナへ →",
    };
  }

  return {
    description:
      "Chatbot hỗ trợ hỏi nhanh kỹ thuật/võ đạo theo dạng RAG. Nếu có cấu hình OpenAI + Supabase Vector, AI sẽ trả lời grounded theo tài liệu đã ingest (có streaming). Nếu chưa cấu hình, hệ thống sẽ fallback sang dữ liệu trong project.",
    arena: "Vào Đấu trường AI →",
  };
}

export default async function AiCoachPage() {
  const locale = await getLocale();
  const copy = getCopy(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)] fade-in-up">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          AI Coach (RAG)
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          {copy.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/dau-truong-ai"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            {copy.arena}
          </Link>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2 stagger-fade">
        <AiCoachChat />
        <PoseCoach />
      </div>
    </div>
  );
}
