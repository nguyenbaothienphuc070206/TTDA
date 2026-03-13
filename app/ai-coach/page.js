import AiCoachChat from "@/components/AiCoachChat";
import PoseCoach from "@/components/PoseCoach";

export const metadata = {
  title: "AI Coach",
};

export default function AiCoachPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          AI Coach (RAG)
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Chatbot hỗ trợ hỏi nhanh kỹ thuật/võ đạo theo dạng RAG.
          Nếu có cấu hình OpenAI + Supabase Vector, AI sẽ trả lời grounded theo tài liệu đã ingest
          (có streaming). Nếu chưa cấu hình, hệ thống sẽ fallback sang dữ liệu trong project.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <AiCoachChat />
        <PoseCoach />
      </div>
    </div>
  );
}
