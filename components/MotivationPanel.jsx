import Link from "next/link";

function asText(value) {
  return String(value || "").trim();
}

export default function MotivationPanel({
  title,
  message,
  points = [],
  primaryHref = "",
  primaryLabel = "",
  secondaryHref = "",
  secondaryLabel = "",
}) {
  const safePoints = Array.isArray(points)
    ? points.map((item) => asText(item)).filter(Boolean).slice(0, 3)
    : [];

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[var(--shadow-card)] sm:p-6">
      <h2 className="text-base font-semibold text-white sm:text-lg">{asText(title)}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{asText(message)}</p>

      {safePoints.length ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {safePoints.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/30 px-3 py-2 text-xs font-semibold text-slate-200">
              {item}
            </div>
          ))}
        </div>
      ) : null}

      {(asText(primaryHref) && asText(primaryLabel)) || (asText(secondaryHref) && asText(secondaryLabel)) ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {asText(primaryHref) && asText(primaryLabel) ? (
            <Link
              href={primaryHref}
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-linear-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110"
            >
              {primaryLabel}
            </Link>
          ) : null}

          {asText(secondaryHref) && asText(secondaryLabel) ? (
            <Link
              href={secondaryHref}
              className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
