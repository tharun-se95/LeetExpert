import type { CourseNavStage } from "@/lib/course/nav";
import { getLesson, MODULES } from "./manifest";

/**
 * Adapts this course's own Module → Chapter → Lesson shape into the
 * shared `CourseNavStage`/`CourseNavModule`/`CourseNavLesson` tree the
 * sidebar (`CourseNavTree`) renders. Both shapes are three levels deep,
 * just with different names for the middle two: a Next.js Module maps to
 * a nav "Stage" (the section header), and a Chapter maps to a nav
 * "Module" (the expandable row) — no UI changes needed, only this
 * adapter. Lesson `id`s are `module/chapter/lesson`, matching both
 * `allLessonIds()` in `./manifest` and `nextjsLessonIdFromPathname`
 * below — the same id space `ProgressProvider` tracks visits against.
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

/**
 * Maps a Next.js lesson pathname to its progress id
 * (`module/chapter/lesson`, same format `allLessonIds()` returns), or
 * `null` for any other path. Validates the triple against the manifest
 * rather than just shape-matching the URL, so a stale or mistyped path
 * never gets recorded as a visited lesson.
 */
export function nextjsLessonIdFromPathname(pathname: string): string | null {
  const match = /^\/courses\/nextjs\/([^/]+)\/([^/]+)\/([^/]+)\/?$/.exec(
    pathname,
  );
  if (!match) return null;
  const [, moduleSlug, chapterSlug, lessonSlug] = match;
  if (!getLesson(moduleSlug, chapterSlug, lessonSlug)) return null;
  return `${moduleSlug}/${chapterSlug}/${lessonSlug}`;
}
