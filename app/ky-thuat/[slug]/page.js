import Link from "next/link";
import { notFound } from "next/navigation";

import { TECHNIQUE_CATEGORIES, TECHNIQUES, getTechniqueBySlug } from "@/data/wiki";

export async function generateStaticParams() {
  return TECHNIQUES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const technique = getTechniqueBySlug(slug);
  if (!technique) return { title: "Kỹ thuật" };

  const title = `${technique.title} | Thư viện kỹ thuật`;
  const description = technique.summary;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function TechniqueDetailPage({ params }) {
  const { slug } = await params;
  const technique = getTechniqueBySlug(slug);
  if (!technique) notFound();

  const category = TECHNIQUE_CATEGORIES.find((c) => c.id === technique.categoryId);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <Link
          href="/ky-thuat"
          className="text-xs font-semibold text-cyan-200 underline decoration-white/10 underline-offset-4 hover:text-cyan-100"
        >
          ← Quay lại Thư viện kỹ thuật
        </Link>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {technique.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          {technique.summary}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200">
            {category?.title || "Kỹ thuật"}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
            Độ khó: {technique.difficulty === "easy" ? "Dễ" : technique.difficulty === "medium" ? "Vừa" : technique.difficulty === "hard" ? "Khó" : "-"}
          </span>
          {(technique.tags || []).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-xs font-semibold text-slate-300">Các bước</div>
          <ol className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
            {technique.steps.map((s, idx) => (
              <li key={s} className="flex gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xs font-semibold text-white">
                  {idx + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="grid gap-4">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-xs font-semibold text-slate-300">Lỗi thường gặp</div>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
              {technique.mistakes.map((m) => (
                <li key={m} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-xs font-semibold text-slate-300">An toàn</div>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
              {technique.safety.map((m) => (
                <li key={m} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
