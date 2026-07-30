import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProblemWorkspace } from "@/components/problems/ProblemWorkspace";
import { loadLesson } from "@/lib/course/load";
import {
  findProblemBySlug,
  getProblemNeighbors,
  allProblemSlugs,
} from "@/lib/course/manifest";
import { moduleHref, problemHref } from "@/lib/course/nav";

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

  return (
    <ProblemWorkspace
      lesson={{ ...lesson, sandbox: lesson.sandbox }}
      eyebrow={`Module ${hit.module.number} · ${hit.module.title}`}
      backHref={moduleHref(hit.module.slug)}
      backLabel={hit.module.shortTitle}
      prev={prev ? { href: problemHref(prev.slug), title: prev.title } : null}
      next={next ? { href: problemHref(next.slug), title: next.title } : null}
    />
  );
}
