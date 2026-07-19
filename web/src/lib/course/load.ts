import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { slugify } from "@/lib/slugify";
import { getLesson, getModule, MODULES } from "./manifest";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractToc(markdown: string): TocItem[] {
  const toc: TocItem[] = [];
  const seen = new Map<string, number>();
  let inFence = false;

  for (const line of markdown.split("\n")) {
    if (/^`{3,}/.test(line.trim())) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!match) continue;
    const level = match[1].length;
    const text = match[2].replace(/[*_`]/g, "").trim();
    let id = slugify(text);
    const count = seen.get(id) ?? 0;
    if (count > 0) id = `${id}-${count}`;
    seen.set(slugify(text), count + 1);
    toc.push({ id, text, level });
  }
  return toc;
}

/**
 * Resolve the repo root (folder that contains `course/`).
 * Local & Vercel with Root Directory=`web` use the parent of cwd.
 * Override with `COURSE_ROOT` when needed.
 */
function resolveCourseRoot(): string {
  if (process.env.COURSE_ROOT) {
    return path.resolve(process.env.COURSE_ROOT);
  }
  const candidates = [path.resolve(process.cwd(), ".."), process.cwd()];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "course"))) {
      return dir;
    }
  }
  return path.resolve(process.cwd(), "..");
}

const courseRoot = resolveCourseRoot();

export interface LoadedLesson {
  moduleSlug: string;
  lessonSlug: string;
  title: string;
  markdown: string;
  toc: TocItem[];
  readingMinutes: number;
  sourcePath: string;
}

export function loadLesson(
  moduleSlug: string,
  lessonSlug: string,
): LoadedLesson | null {
  const hit = getLesson(moduleSlug, lessonSlug);
  if (!hit) return null;

  const relative = path.join("course", moduleSlug, `${lessonSlug}.md`);
  const full = path.join(courseRoot, relative);
  if (!fs.existsSync(full)) {
    throw new Error(`Lesson file not found: ${relative}`);
  }

  const raw = fs
    .readFileSync(full, "utf8")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  const { content, data } = matter(raw);

  return {
    moduleSlug,
    lessonSlug,
    title: (data.title as string) ?? hit.lesson.title,
    markdown: content.trim(),
    toc: extractToc(content),
    readingMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)),
    sourcePath: relative,
  };
}

export function allLessonParams(): { module: string; lesson: string }[] {
  return MODULES.flatMap((m) =>
    m.lessons.map((l) => ({ module: m.slug, lesson: l.slug })),
  );
}

export function allModuleSlugs(): string[] {
  return MODULES.map((m) => m.slug);
}

/** Prev/next within the full course reading order (available modules only). */
export function getLessonNeighbors(
  moduleSlug: string,
  lessonSlug: string,
): {
  prev: { module: string; lesson: string; title: string } | null;
  next: { module: string; lesson: string; title: string } | null;
} {
  const flat = MODULES.filter((m) => m.status === "available").flatMap((m) =>
    m.lessons.map((l) => ({
      module: m.slug,
      lesson: l.slug,
      title: l.title,
    })),
  );
  const idx = flat.findIndex(
    (e) => e.module === moduleSlug && e.lesson === lessonSlug,
  );
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
  };
}

export function moduleExists(slug: string): boolean {
  return Boolean(getModule(slug));
}
