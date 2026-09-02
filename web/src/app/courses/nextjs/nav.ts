import type { CourseNavStage } from "@/lib/course/nav";
import { MODULES } from "./manifest";

/**
 * Adapts this course's own Module → Chapter → Lesson shape into the
 * shared `CourseNavStage`/`CourseNavModule`/`CourseNavLesson` tree the
 * sidebar (`CourseNavTree`) renders. Both shapes are three levels deep,
 * just with different names for the middle two: a Next.js Module maps to
 * a nav "Stage" (the section header), and a Chapter maps to a nav
 * "Module" (the expandable row) — no UI changes needed, only this
 * adapter. Lesson `id`s are unused by progress tracking today (Phase 2
 * of the course build-out deliberately deferred wiring `ProgressProvider`
 * up for this course), but are still unique per lesson so the tree
 * renders correctly once that lands.
 */
export function buildNextjsCourseNav(): CourseNavStage[] {
  return MODULES.map((mod) => ({
    number: mod.number,
    title: mod.title,
    modules: mod.chapters.map((chapter) => {
      const firstLessonSlug = chapter.lessons[0]?.slug ?? "";
      return {
        slug: `${mod.slug}/${chapter.slug}`,
        number: mod.number,
        title: chapter.title,
        shortTitle: chapter.title,
        href: `/courses/nextjs/${mod.slug}/${chapter.slug}/${firstLessonSlug}`,
        status: "available" as const,
        lessons: chapter.lessons.map((lesson) => ({
          id: `${mod.slug}/${chapter.slug}/${lesson.slug}`,
          title: lesson.title,
          href: `/courses/nextjs/${mod.slug}/${chapter.slug}/${lesson.slug}`,
          type: "concept" as const,
        })),
      };
    }),
  }));
}
