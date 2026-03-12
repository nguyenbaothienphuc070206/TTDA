import AiCoachChat from "@/components/AiCoachChat";

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
          Chatbot hỗ trợ hỏi nhanh kỹ thuật/võ đạo dựa trên thư viện dữ liệu trong project.
          Đây là bản demo RAG-lite (không cần API key).
        </p>
      </header>

      <AiCoachChat />
    </div>
  );
}
