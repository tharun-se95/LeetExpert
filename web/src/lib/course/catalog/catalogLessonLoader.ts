import readingTime from "reading-time";
import { highlightBlocks } from "@/lib/content/highlightBlocks";
import {
  extractSandboxFence,
  type SandboxExtraction,
} from "@/lib/content/extractSandboxFence";
import { extractToc, type LoadedLesson } from "@/lib/course/load";
import {
  type CatalogExtraProblem,
} from "./catalogExtraProblems";
import { CATALOG_PROBLEMS } from "./data";
import { problemHref } from "@/lib/course/nav";

export function buildCatalogProblemMarkdown(problem: CatalogExtraProblem): string {
  const hintsMd = problem.hints
    .map(
      (hint, idx) =>
        `\`\`\`\`reveal Hint ${idx + 1} — Key Observation\n${hint}\n\`\`\`\``,
    )
    .join("\n\n");

  const sandboxJson = JSON.stringify(problem.sandbox, null, 2);

  return `---
title: ${problem.title}
type: problem
---

## Problem

${problem.description}

**Examples**

\`\`\`examples
${problem.examples}
\`\`\`

\`\`\`constraint
${problem.constraints}
\`\`\`

## Attempt it first

**Algorithmic Pattern:** ${problem.pattern}

> ${problem.thesis}

\`\`\`sandbox
${sandboxJson}
\`\`\`

${hintsMd}

## The insight

> ${problem.thesis}

## Solution

\`\`\`\`\`reveal Solution — Python & TypeScript
\`\`\`\`tabs
\`\`\`python
${problem.solution.python}
\`\`\`

\`\`\`typescript
${problem.solution.typescript}
\`\`\`
\`\`\`\`
\`\`\`\`\`
`;
}

export async function loadCatalogLesson(
  problem: CatalogExtraProblem,
): Promise<(LoadedLesson & { sandbox: SandboxExtraction }) | null> {
  const markdown = buildCatalogProblemMarkdown(problem);
  const trimmed = markdown.trim();
  const { blocks, tabs } = await highlightBlocks(trimmed);
  const sandbox = extractSandboxFence(trimmed);

  if (!sandbox) return null;

  return {
    moduleSlug: "catalog",
    lessonSlug: problem.slug,
    title: problem.title,
    markdown: trimmed,
    toc: extractToc(trimmed),
    readingMinutes: Math.max(1, Math.ceil(readingTime(trimmed).minutes)),
    sourcePath: `catalog/${problem.slug}`,
    highlightedBlocks: blocks,
    highlightedTabs: tabs,
    sandbox,
  };
}

export function getCatalogProblemNeighbors(slug: string): {
  prev: { href: string; title: string } | null;
  next: { href: string; title: string } | null;
} {
  const index = CATALOG_PROBLEMS.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: null, next: null };

  const prevProblem = index > 0 ? CATALOG_PROBLEMS[index - 1] : null;
  const nextProblem =
    index < CATALOG_PROBLEMS.length - 1 ? CATALOG_PROBLEMS[index + 1] : null;

  return {
    prev: prevProblem
      ? {
          href: problemHref(prevProblem.courseLessonSlug ?? prevProblem.slug),
          title: prevProblem.title,
        }
      : null,
    next: nextProblem
      ? {
          href: problemHref(nextProblem.courseLessonSlug ?? nextProblem.slug),
          title: nextProblem.title,
        }
      : null,
  };
}
