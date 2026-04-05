export default function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-app-gradient" />
      <div className="absolute inset-0 bg-grid opacity-25 perf-heavy" />

      <div className="absolute -top-52 -left-52 h-120 w-120 rounded-full bg-cyan-300/20 blur-3xl float-slow perf-heavy" />
      <div className="absolute top-8 -right-40 hidden h-112 w-md rounded-full bg-blue-500/20 blur-3xl float-fast md:block perf-heavy" />
      <div className="absolute -bottom-60 left-8 hidden h-136 w-136 rounded-full bg-amber-300/10 blur-3xl float-slower lg:block perf-heavy" />
      <div className="absolute top-[35%] left-[42%] hidden h-88 w-88 rounded-full bg-sky-300/10 blur-3xl float-fast xl:block perf-heavy" />
      <div className="absolute inset-0 hidden opacity-60 [background:conic-gradient(from_180deg_at_50%_50%,rgba(34,211,238,0.05),rgba(59,130,246,0.06),rgba(250,204,21,0.04),rgba(34,211,238,0.05))] lg:block perf-heavy" />

      <div className="absolute inset-0 bg-vignette" />
    </div>
  );
}
