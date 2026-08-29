import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModule, moduleSlugs } from "@/lib/learn/modules";
import { LessonModule } from "@/components/learn/LessonModule";

interface PageParams {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return moduleSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const learnModule = getModule(slug);
  if (!learnModule) return {};
  return {
    title: `${learnModule.title} | Learn`,
    description: learnModule.summary,
  };
}

/**
 * A single interactive education module (#101). Content is looked up from
 * static data by slug; unknown slugs 404.
 */
export default async function LearnModulePage({ params }: PageParams) {
  const { slug } = await params;
  const learnModule = getModule(slug);

  if (!learnModule) {
    notFound();
  }

  return <LessonModule module={learnModule} />;
}
