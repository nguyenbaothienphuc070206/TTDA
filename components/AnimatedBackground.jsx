export default function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-app-gradient" />
      <div className="absolute inset-0 bg-grid opacity-35" />

      <div className="absolute -top-48 -left-48 h-[28rem] w-[28rem] rounded-full bg-cyan-400/20 blur-3xl float-slow" />
      <div className="absolute top-24 -right-40 h-[26rem] w-[26rem] rounded-full bg-blue-500/20 blur-3xl float-fast" />
      <div className="absolute -bottom-56 left-24 h-[30rem] w-[30rem] rounded-full bg-yellow-300/10 blur-3xl float-slower" />

      <div className="absolute inset-0 bg-vignette" />
    </div>
  );
}
