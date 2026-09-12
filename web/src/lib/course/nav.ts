import {
  MODULES,
  STAGES,
  findProblemBySlug,
  isLessonsNavLesson,
  type LessonType,
  type ModuleMeta,
} from "./manifest";

export interface CourseNavLesson {
  id: string;
  title: string;
  href: string;
  type: LessonType;
}

/**
 * A module-level destination that is NOT a lesson: it has no markdown file, no
 * progress state, and must stay out of the x/y counts. Kept separate from
 * `lessons` so adding one cannot shift a module's completion figures or the
 * course total.
 */
export interface CourseNavExtra {
  id: string;
  title: string;
  href: string;
}

export interface CourseNavModule {
  slug: string;
  number: number;
  title: string;
  shortTitle: string;
  href: string;
  status: ModuleMeta["status"];
  lessons: CourseNavLesson[];
  /** Optional: the Next.js course nav does not build these. */
  extras?: CourseNavExtra[];
}

export interface CourseNavStage {
  number: number;
  title: string;
  modules: CourseNavModule[];
}

export function lessonId(moduleSlug: string, lessonSlug: string): string {
  return `${moduleSlug}/${lessonSlug}`;
}

export function lessonHref(moduleSlug: string, lessonSlug: string): string {
  return `/courses/dsa/${moduleSlug}/${lessonSlug}`;
}

/**
 * Static segment, so it wins over [lesson] — no lesson slug can collide with it.
 */
export function conceptMapHref(moduleSlug: string): string {
  return `/courses/dsa/${moduleSlug}/concept-map`;
}

export function moduleHref(moduleSlug: string): string {
  return `/courses/dsa/${moduleSlug}`;
}

export function problemHref(slug: string): string {
  return `/courses/dsa/problems/${slug}`;
}

/** Count visited Lessons-nav ids only (ignore problem drills in the chip). */
export function countLessonsProgress(
  visited: Iterable<string>,
  lessonProgressIds: ReadonlySet<string>,
): number {
  let n = 0;
  for (const id of visited) {
    if (lessonProgressIds.has(id)) n += 1;
  }
  return n;
}

export function buildCourseNav(): CourseNavStage[] {
  return STAGES.map((stage) => ({
    number: stage.number,
    title: stage.title,
    modules: MODULES.filter((m) => m.stage === stage.number).map((m) => ({
      slug: m.slug,
      number: m.number,
      title: m.title,
      shortTitle: m.shortTitle,
      href: moduleHref(m.slug),
      status: m.status,
      lessons: m.lessons.filter(isLessonsNavLesson).map((l) => ({
        id: lessonId(m.slug, l.slug),
        title: l.title,
        href: lessonHref(m.slug, l.slug),
        type: l.type,
      })),
      // Every module has a concept map (CONCEPT_MAPS covers all 24, asserted in
      // tests/conceptMapCoverage.test.ts), so this is unconditional — and the
      // registry stays out of the client bundle, which importing it here to
      // check would not.
      extras: [
        {
          id: `${m.slug}/concept-map`,
          title: "Concept map",
          href: conceptMapHref(m.slug),
        },
      ],
    })),
  }));
}

/**
 * Map a lesson-bearing pathname to its progress id — either the course
 * shape (/course/[module]/[lesson], concept lessons and, historically,
 * problems too) or the hub shape (/problems/[slug]). Both resolve to the
 * SAME `moduleSlug/lessonSlug` id, so a problem visited at its old course
 * URL and its new hub URL count as the same lesson for progress purposes.
 */
export function lessonIdFromPathname(pathname: string): string | null {
  const problemMatch = /^\/courses\/dsa\/problems\/([^/]+)\/?$/.exec(
    pathname,
  );
  if (problemMatch) {
    const [, slug] = problemMatch;
    const hit = findProblemBySlug(slug);
    if (!hit) return null;
    return lessonId(hit.module.slug, hit.lesson.slug);
  }

  const courseMatch = /^\/courses\/dsa\/([^/]+)\/([^/]+)\/?$/.exec(pathname);
  if (courseMatch) {
    const [, moduleSlug, lessonSlug] = courseMatch;
    const mod = MODULES.find((m) => m.slug === moduleSlug);
    if (!mod) return null;
    if (!mod.lessons.some((l) => l.slug === lessonSlug)) return null;
    return lessonId(moduleSlug, lessonSlug);
  }

  return null;
}
