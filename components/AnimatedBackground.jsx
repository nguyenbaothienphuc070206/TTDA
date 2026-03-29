export default function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-app-gradient" />
      <div className="absolute inset-0 bg-grid opacity-25" />

      <div className="absolute -top-52 -left-52 h-[30rem] w-[30rem] rounded-full bg-cyan-300/20 blur-3xl float-slow" />
      <div className="absolute top-8 right-[-10rem] h-[28rem] w-[28rem] rounded-full bg-blue-500/20 blur-3xl float-fast" />
      <div className="absolute -bottom-60 left-8 h-[34rem] w-[34rem] rounded-full bg-amber-300/10 blur-3xl float-slower" />
      <div className="absolute top-[35%] left-[42%] h-[22rem] w-[22rem] rounded-full bg-sky-300/10 blur-3xl float-fast" />
      <div className="absolute inset-0 opacity-60 [background:conic-gradient(from_180deg_at_50%_50%,rgba(34,211,238,0.05),rgba(59,130,246,0.06),rgba(250,204,21,0.04),rgba(34,211,238,0.05))]" />

      <div className="absolute inset-0 bg-vignette" />
    </div>
  );
}
