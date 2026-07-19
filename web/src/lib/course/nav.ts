import { MODULES, STAGES, type ModuleMeta } from "./manifest";

export interface CourseNavLesson {
  id: string;
  title: string;
  href: string;
  type: "concept" | "problem";
}

export interface CourseNavModule {
  slug: string;
  number: number;
  title: string;
  shortTitle: string;
  href: string;
  status: ModuleMeta["status"];
  lessons: CourseNavLesson[];
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
  return `/course/${moduleSlug}/${lessonSlug}`;
}

export function moduleHref(moduleSlug: string): string {
  return `/course/${moduleSlug}`;
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
      lessons: m.lessons.map((l) => ({
        id: lessonId(m.slug, l.slug),
        title: l.title,
        href: lessonHref(m.slug, l.slug),
        type: l.type,
      })),
    })),
  }));
}

/** Map a /course/[module]/[lesson] pathname to its progress id. */
export function lessonIdFromPathname(pathname: string): string | null {
  const match = /^\/course\/([^/]+)\/([^/]+)\/?$/.exec(pathname);
  if (!match) return null;
  const [, moduleSlug, lessonSlug] = match;
  const mod = MODULES.find((m) => m.slug === moduleSlug);
  if (!mod) return null;
  if (!mod.lessons.some((l) => l.slug === lessonSlug)) return null;
  return lessonId(moduleSlug, lessonSlug);
}
