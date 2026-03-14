import { notFound } from "next/navigation";

import TechniqueDetailPanel from "@/components/TechniqueDetailPanel";
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

  return <TechniqueDetailPanel technique={technique} category={category} />;
}
