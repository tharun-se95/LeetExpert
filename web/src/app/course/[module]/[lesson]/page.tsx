import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonView } from "@/components/course/LessonView";
import { ProblemLessonView } from "@/components/course/ProblemLessonView";
import { LESSON_EMBEDS } from "@/components/course/embeds";
import {
  allLessonParams,
  getLessonNeighbors,
  loadLesson,
} from "@/lib/course/load";
import { getLesson, getModule } from "@/lib/course/manifest";
import { lessonHref, lessonId, moduleHref } from "@/lib/course/nav";

interface PageProps {
  params: Promise<{ module: string; lesson: string }>;
}

export function generateStaticParams() {
  return allLessonParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const hit = getLesson(moduleSlug, lessonSlug);
  return { title: hit ? hit.lesson.title : "Lesson" };
}

export default async function LessonPage({ params }: PageProps) {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const mod = getModule(moduleSlug);
  const meta = getLesson(moduleSlug, lessonSlug);
  const lesson = await loadLesson(moduleSlug, lessonSlug);
  if (!mod || !meta || !lesson) notFound();

  const { prev, next } = getLessonNeighbors(moduleSlug, lessonSlug);
  const Embed = LESSON_EMBEDS[lessonId(moduleSlug, lessonSlug)];

  const breadcrumbs = [
    { label: "Course", href: "/course" },
    { label: mod.shortTitle, href: moduleHref(mod.slug) },
    { label: meta.lesson.title },
  ];
  const prevLink = prev
    ? { href: lessonHref(prev.module, prev.lesson), title: prev.title }
    : null;
  const nextLink = next
    ? { href: lessonHref(next.module, next.lesson), title: next.title }
    : null;

  if (lesson.sandbox) {
    return (
      <ProblemLessonView
        lesson={{ ...lesson, sandbox: lesson.sandbox }}
        eyebrow={`Module ${mod.number} · ${mod.title}`}
        breadcrumbs={breadcrumbs}
        prev={prevLink}
        next={nextLink}
      />
    );
  }

  return (
    <LessonView
      lesson={lesson}
      eyebrow={`Module ${mod.number} · ${mod.title}`}
      typeLabel={meta.lesson.type === "problem" ? "Problem" : "Concept"}
      breadcrumbs={breadcrumbs}
      prev={prevLink}
      next={nextLink}
      stage={Embed ? <Embed /> : undefined}
    />
  );
}
