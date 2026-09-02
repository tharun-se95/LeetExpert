import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { slugify } from "@/lib/slugify";
import {
  getLesson,
  getModule,
  isLessonsNavLesson,
  MODULES,
} from "./manifest";
import { highlightBlocks, type TabBlock } from "@/lib/content/highlightBlocks";
import {
  extractSandboxFence,
  type SandboxExtraction,
} from "@/lib/content/extractSandboxFence";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractToc(markdown: string): TocItem[] {
  const toc: TocItem[] = [];
  const seen = new Map<string, number>();
  let inFence = false;
  let fenceLang = "";

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    const fenceOpen = /^`{3,}(\w*)/.exec(line.trim());
    if (fenceOpen) {
      if (!inFence) {
        inFence = true;
        fenceLang = fenceOpen[1] ?? "";
      } else {
        inFence = false;
        fenceLang = "";
      }
      continue;
    }
    // Headings inside `roadmap` fences stay in the TOC — the fence is only a
    // layout wrapper. Other fences (quiz, reveal, …) still hide their headings.
    if (inFence && fenceLang !== "roadmap") continue;
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
 * Resolve the repo root (folder that contains `courses/`).
 * Local & Vercel with Root Directory=`web` use the parent of cwd.
 * Override with `COURSE_ROOT` when needed.
 */
function resolveCourseRoot(): string {
  if (process.env.COURSE_ROOT) {
    return path.resolve(process.env.COURSE_ROOT);
  }
  const candidates = [path.resolve(process.cwd(), ".."), process.cwd()];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "courses", "dsa"))) {
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
  highlightedBlocks: Record<string, string | null>;
  highlightedTabs: Record<string, TabBlock[]>;
  /** Non-null only for problem lessons — see extractSandboxFence.ts */
  sandbox: SandboxExtraction | null;
}

export async function loadLesson(
  moduleSlug: string,
  lessonSlug: string,
): Promise<LoadedLesson | null> {
  const hit = getLesson(moduleSlug, lessonSlug);
  if (!hit) return null;

  const relative = path.join("courses", "dsa", moduleSlug, `${lessonSlug}.md`);
  const full = path.join(courseRoot, relative);
  if (!fs.existsSync(full)) {
    throw new Error(`Lesson file not found: ${relative}`);
  }

  const raw = fs
    .readFileSync(full, "utf8")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  const { content, data } = matter(raw);
  const trimmed = content.trim();
  const { blocks, tabs } = await highlightBlocks(trimmed);

  return {
    moduleSlug,
    lessonSlug,
    title: (data.title as string) ?? hit.lesson.title,
    markdown: trimmed,
    toc: extractToc(content),
    readingMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)),
    sourcePath: relative,
    highlightedBlocks: blocks,
    highlightedTabs: tabs,
    sandbox: extractSandboxFence(trimmed),
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
    m.lessons.filter(isLessonsNavLesson).map((l) => ({
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
