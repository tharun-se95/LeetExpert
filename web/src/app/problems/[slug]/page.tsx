import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProblemWorkspace } from "@/components/problems/ProblemWorkspace";
import { loadLesson } from "@/lib/course/load";
import {
  findProblemBySlug,
  getProblemNeighbors,
  allProblemSlugs,
} from "@/lib/course/manifest";
import { lessonHref, moduleHref, problemHref } from "@/lib/course/nav";
import { splitProblemTabs } from "@/lib/content/splitProblemTabs";
import { extractHints } from "@/lib/coach/extractHints";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return allProblemSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const hit = findProblemBySlug(slug);
  return { title: hit ? hit.lesson.title : "Problem" };
}

export default async function ProblemPage({ params }: PageProps) {
  const { slug } = await params;
  const hit = findProblemBySlug(slug);
  if (!hit) notFound();

  const lesson = await loadLesson(hit.module.slug, hit.lesson.slug);
  if (!lesson || !lesson.sandbox) notFound();

  const { prev, next } = getProblemNeighbors(hit.module.slug, slug);
  const hasPractice = hit.module.lessons.some(
    (l) => l.type === "practice" && l.slug === "practice",
  );
  const backHref = hasPractice
    ? lessonHref(hit.module.slug, "practice")
    : moduleHref(hit.module.slug);
  const backLabel = hasPractice ? "Practice" : hit.module.shortTitle;
  const { explanation } = splitProblemTabs(lesson.sandbox.afterSandbox);
  const hintLabels = extractHints(explanation).map((h) => h.label);

  return (
    <ProblemWorkspace
      lesson={{ ...lesson, sandbox: lesson.sandbox }}
      eyebrow={`Module ${hit.module.number} · ${hit.module.title}`}
      backHref={backHref}
      backLabel={backLabel}
      hintLabels={hintLabels}
      prev={prev ? { href: problemHref(prev.slug), title: prev.title } : null}
      next={next ? { href: problemHref(next.slug), title: next.title } : null}
    />
  );
}
