import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { extractSandboxFence } from "../content/extractSandboxFence";
import { splitProblemTabs } from "../content/splitProblemTabs";
import { extractHints } from "./extractHints";
import { extractThesis } from "./extractThesis";
import type { CoachProblem } from "./types";

function resolveCourseRoot(): string {
  if (process.env.COURSE_ROOT) return process.env.COURSE_ROOT;
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(here, "..", "..", "..", ".."),
    join(process.cwd(), ".."),
    process.cwd(),
  ];
  for (const dir of candidates) {
    if (existsSync(join(dir, "course"))) return dir;
  }
  return join(process.cwd(), "..");
}

function walkMarkdown(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walkMarkdown(full));
    else if (entry.endsWith(".md")) out.push(full);
  }
  return out;
}

/**
 * Server-only corpus: statement + hint ladder + fn names. Never the
 * Solution tab. Keyed by sandbox id so the API never reads `course/`
 * at request time (Vercel Root Directory is `web`).
 */
export function buildCorpus(courseRoot = resolveCourseRoot()): Record<string, CoachProblem> {
  const courseDir = join(courseRoot, "course");
  const corpus: Record<string, CoachProblem> = {};

  for (const path of walkMarkdown(courseDir)) {
    const raw = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
    const { data, content } = matter(raw);
    if (data.type !== "problem") continue;

    const split = extractSandboxFence(content.trim());
    if (!split) continue;

    let spec: { id?: unknown; fn?: { python?: unknown; javascript?: unknown } };
    try {
      spec = JSON.parse(split.sandboxSource) as typeof spec;
    } catch {
      continue;
    }
    if (typeof spec.id !== "string" || !spec.id) continue;
    if (typeof spec.fn?.python !== "string" || typeof spec.fn.javascript !== "string") {
      continue;
    }

    const rel = relative(courseDir, path).replace(/\\/g, "/");
    const moduleSlug = rel.split("/")[0] ?? "";
    const { explanation } = splitProblemTabs(split.afterSandbox);

    corpus[spec.id] = {
      sandboxId: spec.id,
      title: typeof data.title === "string" ? data.title : spec.id,
      moduleSlug,
      statement: split.beforeSandbox.trim(),
      thesis: extractThesis(explanation),
      hints: extractHints(explanation),
      fn: { python: spec.fn.python, javascript: spec.fn.javascript },
    };
  }

  return corpus;
}

export function corpusOutputPath(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "corpus.generated.json");
}

export function writeCoachCorpus(courseRoot = resolveCourseRoot()): string {
  const out = corpusOutputPath();
  const corpus = buildCorpus(courseRoot);
  writeFileSync(out, `${JSON.stringify(corpus, null, 2)}\n`);
  return out;
}
