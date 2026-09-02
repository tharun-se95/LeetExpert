import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { slugify } from "@/lib/slugify";
import { highlightBlocks, type TabBlock } from "@/lib/content/highlightBlocks";
import { getLesson, MODULES, type PracticeFormat, type Depth } from "./manifest";

/**
 * Reuses the shared, genuinely course-agnostic markdown-highlighting
 * utility from lib/content (the "opt-in lesson kit" the platform design
 * describes) — this course does NOT reuse lib/course/load.ts, which is
 * DSA's own loader keyed to DSA's 2-level module/lesson content layout
 * and concept/problem/practice frontmatter. This course has a genuine
 * 3-level layout (module/chapter/lesson) and a different frontmatter
 * shape (practiceFormat/depth), so it gets its own small loader rather
 * than bending DSA's to fit.
 */

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractToc(markdown: string): TocItem[] {
  const toc: TocItem[] = [];
  const seen = new Map<string, number>();
  let inFence = false;

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
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
 * Resolve the repo root (folder that contains `courses/nextjs/`).
 * Local & Vercel with Root Directory=`web` use the parent of cwd.
 * Override with `COURSE_ROOT` when needed (same env var DSA's loader
 * uses — both courses live under the same repo-root `courses/` parent).
 */
function resolveContentRoot(): string {
  if (process.env.COURSE_ROOT) {
    return path.resolve(process.env.COURSE_ROOT);
  }
  const candidates = [path.resolve(process.cwd(), ".."), process.cwd()];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "courses", "nextjs"))) {
      return dir;
    }
  }
  return path.resolve(process.cwd(), "..");
}

const contentRoot = resolveContentRoot();

interface LessonFrontmatter {
  title?: string;
  practiceFormat?: PracticeFormat;
  depth?: Depth;
}

export interface LoadedNextjsLesson {
  moduleSlug: string;
  chapterSlug: string;
  lessonSlug: string;
  title: string;
  markdown: string;
  toc: TocItem[];
  readingMinutes: number;
  sourcePath: string;
  highlightedBlocks: Record<string, string | null>;
  highlightedTabs: Record<string, TabBlock[]>;
  /**
   * Whether this lesson already authors its own practice drill inline
   * (a `reveal` fence with a worked answer, optionally paired with a
   * `scratchpad`) rather than relying on the page-level placeholder.
   * A plain substring check, not a full parse: false positives would
   * require the phrase to appear inside a fence *opener* specifically,
   * which lesson prose never does.
   */
  hasEmbeddedPractice: boolean;
}

export async function loadNextjsLesson(
  moduleSlug: string,
  chapterSlug: string,
  lessonSlug: string,
): Promise<LoadedNextjsLesson | null> {
  const hit = getLesson(moduleSlug, chapterSlug, lessonSlug);
  if (!hit) return null;

  const relative = path.join(
    "courses",
    "nextjs",
    moduleSlug,
    chapterSlug,
    `${lessonSlug}.md`,
  );
  const full = path.join(contentRoot, relative);
  if (!fs.existsSync(full)) {
    // Not every lesson in the manifest has its content written yet
    // (Phase 4 is in progress) — a missing file is a real, expected
    // state during the build-out, not a bug to throw on.
    return null;
  }

  const raw = fs
    .readFileSync(full, "utf8")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  const { content, data } = matter(raw) as { content: string; data: LessonFrontmatter };
  const trimmed = content.trim();
  const { blocks, tabs } = await highlightBlocks(trimmed);

  return {
    moduleSlug,
    chapterSlug,
    lessonSlug,
    title: data.title ?? hit.lesson.title,
    markdown: trimmed,
    toc: extractToc(content),
    readingMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)),
    sourcePath: relative,
    highlightedBlocks: blocks,
    highlightedTabs: tabs,
    hasEmbeddedPractice: /^`{3,4}reveal\b/m.test(trimmed),
  };
}

export function allNextjsLessonParams(): {
  module: string;
  chapter: string;
  lesson: string;
}[] {
  return MODULES.flatMap((m) =>
    m.chapters.flatMap((c) =>
      c.lessons.map((l) => ({
        module: m.slug,
        chapter: c.slug,
        lesson: l.slug,
      })),
    ),
  );
}
