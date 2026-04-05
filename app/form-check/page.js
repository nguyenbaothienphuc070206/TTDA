import PoseCoach from "@/components/PoseCoach";

export const metadata = {
  title: "AI Form Check",
};

export default function FormCheckPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="stagger-fade grid gap-6">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
          Signature Feature
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          AI Form Check (Live Demo)
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Dung camera de check form theo thoi gian thuc va nhan feedback ngay. Day la wow moment ma video YouTube khong co.
        </p>

        <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-slate-200">
          <p className="font-semibold text-cyan-100">Tai sao khac biet?</p>
          <ul className="mt-2 grid gap-1">
            <li>• Feedback theo form ngay luc tap</li>
            <li>• Gop y an toan, ngan gon, thuc chien</li>
            <li>• Tich hop vao progress + community + leaderboard</li>
          </ul>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[var(--shadow-card)]">
        <PoseCoach />
      </section>
      </div>
    </div>
  );
}
