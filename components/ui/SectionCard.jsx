export default function SectionCard({ title, children }) {
  return (
    <section className="interactive-card rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[var(--shadow-card)]">
      {title ? <h2 className="text-lg font-semibold text-white">{title}</h2> : null}
      <div className={title ? "mt-3" : ""}>{children}</div>
    </section>
  );
}
