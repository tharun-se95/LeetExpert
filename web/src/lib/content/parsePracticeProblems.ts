import { load as loadYaml } from "js-yaml";
import { getModule } from "@/lib/course/manifest";
import { problemHref } from "@/lib/course/nav";
import { getProblemDifficulty } from "@/lib/course/problemDifficulty";

export interface PracticeBrief {
  slug: string;
  pattern?: string;
  difficulty?: string;
  watch_for?: string;
}

export interface PracticeProblemRow {
  slug: string;
  title: string;
  href: string;
  pattern?: string;
  difficulty?: string;
  watch_for?: string;
}

function asBrief(raw: unknown): PracticeBrief {
  if (!raw || typeof raw !== "object") {
    throw new Error("practice-problems entry must be an object");
  }
  const rec = raw as Record<string, unknown>;
  if (typeof rec.slug !== "string" || !rec.slug.trim()) {
    throw new Error("practice-problems entry requires a string slug");
  }
  const brief: PracticeBrief = { slug: rec.slug.trim() };
  if (typeof rec.pattern === "string") brief.pattern = rec.pattern;
  if (typeof rec.difficulty === "string") brief.difficulty = rec.difficulty;
  if (typeof rec.watch_for === "string") brief.watch_for = rec.watch_for;
  return brief;
}

export function parsePracticeProblemsYaml(source: string): PracticeBrief[] {
  const trimmed = source.trim();
  if (!trimmed) return [];
  const data = loadYaml(trimmed);
  if (data == null) return [];
  if (!Array.isArray(data)) {
    throw new Error("practice-problems fence must be a YAML array");
  }
  return data.map(asBrief);
}

const FENCE = /^(`{3,8})practice-problems[^\n]*\n([\s\S]*?)^\1\s*$/m;

export function extractPracticeProblemsFence(markdown: string): {
  body: string;
  authored: PracticeBrief[] | null;
} {
  const m = FENCE.exec(markdown);
  if (!m) return { body: markdown, authored: null };
  const authored = parsePracticeProblemsYaml(m[2]);
  const body = (
    markdown.slice(0, m.index) + markdown.slice(m.index + m[0].length)
  )
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd()
    .concat("\n");
  return { body, authored };
}

export function mergePracticeProblems(
  moduleSlug: string,
  authored: PracticeBrief[] | null,
): PracticeProblemRow[] {
  const mod = getModule(moduleSlug);
  if (!mod) throw new Error(`Unknown module: ${moduleSlug}`);
  const problems = mod.lessons.filter((l) => l.type === "problem");
  const bySlug = new Map((authored ?? []).map((b) => [b.slug, b]));
  for (const slug of bySlug.keys()) {
    if (!problems.some((p) => p.slug === slug)) {
      throw new Error(
        `practice-problems references unknown slug "${slug}" in module ${moduleSlug}`,
      );
    }
  }
  return problems.map((p) => {
    const overlay = bySlug.get(p.slug);
    return {
      slug: p.slug,
      title: p.title,
      href: problemHref(p.slug),
      pattern: overlay?.pattern,
      difficulty: overlay?.difficulty ?? getProblemDifficulty(p.slug),
      watch_for: overlay?.watch_for,
    };
  });
}
