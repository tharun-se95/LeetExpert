# Roadmap Timeline Rail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wrap Stage 0–4 on The Roadmap lesson in a `roadmap` fence and render a vertical numbered rail left of the existing prose.

**Architecture:** Pure `parseRoadmapStages` splits the fence body on `### Stage N` headings. `extractToc` still indexes headings inside `roadmap` fences. `Markdown` routes `language-roadmap` to a `Roadmap` component that draws a continuous left connector + numbered nodes beside nested markdown per stage.

**Tech Stack:** Next.js / React, react-markdown (existing), Vitest, course markdown fence.

## Global Constraints

- Tokens only (`accent`, `border`, `muted`, `on-pop`, `background`/`surface`) — no hardcoded Tailwind palette colours, no shadows/blur.
- Preserve all existing stage prose; fence is a wrapper only.
- TOC Stage links must keep working after the wrap.
- Nested markdown gets the same `highlightedBlocks` / `highlightedTabs` props as `reveal`/`aside`.
- Prefer-reduced-motion: no animation in v1.

## File map

| File | Role |
| --- | --- |
| `web/src/lib/content/parseRoadmapStages.ts` | Split fence body → stage markdown chunks |
| `web/src/lib/course/load.ts` | `extractToc` includes headings inside `roadmap` fences |
| `web/src/components/md/Roadmap.tsx` | Rail UI + nested Markdown per stage |
| `web/src/components/md/Markdown.tsx` | Wire `language-roadmap` → `Roadmap` |
| `course/getting-started/course-roadmap.md` | Wrap Stage 0–4 in ` ```roadmap ` |
| `web/tests/roadmap.test.ts` | Parser + TOC + content shape tests |

---

### Task 1: parseRoadmapStages + extractToc

**Files:**
- Create: `web/src/lib/content/parseRoadmapStages.ts`
- Modify: `web/src/lib/course/load.ts` (`extractToc`)
- Test: `web/tests/roadmap.test.ts`

**Interfaces:**
- Produces: `parseRoadmapStages(source: string): string[] | null` — ordered chunks each starting with `### Stage N`; `null` if empty or any chunk fails the heading pattern
- Produces: `extractToc` still returns `TocItem[]`, but headings inside fences whose opening line matches `` ```roadmap `` (optional trailing meta ignored) are included

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "vitest";
import { parseRoadmapStages } from "@/lib/content/parseRoadmapStages";
import { extractToc } from "@/lib/course/load";

describe("parseRoadmapStages", () => {
  it("splits five Stage headings into five chunks", () => {
    const source = [
      "### Stage 0 — Foundations",
      "",
      "body zero",
      "",
      "### Stage 1 — Linear structures",
      "",
      "body one",
    ].join("\n");
    const stages = parseRoadmapStages(source);
    expect(stages).toHaveLength(2);
    expect(stages![0]).toMatch(/^### Stage 0/);
    expect(stages![0]).toContain("body zero");
    expect(stages![1]).toMatch(/^### Stage 1/);
  });

  it("returns null when a chunk lacks a Stage heading", () => {
    expect(parseRoadmapStages("### Not a stage\n\nhi")).toBeNull();
  });

  it("returns null for empty source", () => {
    expect(parseRoadmapStages("")).toBeNull();
    expect(parseRoadmapStages("   \n")).toBeNull();
  });
});

describe("extractToc roadmap fence", () => {
  it("includes headings inside a roadmap fence", () => {
    const md = [
      "## Five stages, in dependency order",
      "",
      "```roadmap",
      "### Stage 0 — Foundations",
      "",
      "para",
      "",
      "### Stage 1 — Linear structures",
      "",
      "para",
      "```",
      "",
      "## How to move through it",
    ].join("\n");
    const toc = extractToc(md);
    expect(toc.map((t) => t.text)).toEqual([
      "Five stages, in dependency order",
      "Stage 0 — Foundations",
      "Stage 1 — Linear structures",
      "How to move through it",
    ]);
  });

  it("still skips headings inside reveal fences", () => {
    const md = [
      "## Outer",
      "",
      "```reveal Hint",
      "### Hidden",
      "```",
    ].join("\n");
    expect(extractToc(md).map((t) => t.text)).toEqual(["Outer"]);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `cd web && npx vitest run tests/roadmap.test.ts`

Expected: FAIL (module / behaviour missing)

- [ ] **Step 3: Implement parser**

```ts
// web/src/lib/content/parseRoadmapStages.ts
const STAGE_HEADING = /^### Stage \d+/;

/** Split a `roadmap` fence body into per-stage markdown chunks. */
export function parseRoadmapStages(source: string): string[] | null {
  const trimmed = source.replace(/^\n+/, "").replace(/\n+$/, "");
  if (!trimmed.trim()) return null;

  const chunks = trimmed.split(/(?=^### Stage \d+)/m).filter((c) => c.trim());
  if (chunks.length === 0) return null;
  if (!chunks.every((c) => STAGE_HEADING.test(c.trimStart()))) return null;
  return chunks.map((c) => c.replace(/\n+$/, ""));
}
```

- [ ] **Step 4: Update extractToc**

In `web/src/lib/course/load.ts`, track fence language when entering a fence; when `inFence`, only `continue` (skip heading scan) if language is **not** `roadmap`:

```ts
export function extractToc(markdown: string): TocItem[] {
  const toc: TocItem[] = [];
  const seen = new Map<string, number>();
  let inFence = false;
  let fenceLang = "";

  for (const line of markdown.split("\n")) {
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
    if (inFence && fenceLang !== "roadmap") continue;
    // … existing heading match / push …
  }
  return toc;
}
```

Note: closing fences are `` ``` `` with no lang — the toggle above handles that. Opening `` ```roadmap `` sets `fenceLang`. Nested fences inside roadmap are not authored; ignore.

- [ ] **Step 5: Run tests — expect PASS**

Run: `cd web && npx vitest run tests/roadmap.test.ts`

Expected: PASS

- [ ] **Step 6: Commit** (only if user requested commits; otherwise skip)

---

### Task 2: Roadmap component + Markdown wire-up

**Files:**
- Create: `web/src/components/md/Roadmap.tsx`
- Modify: `web/src/components/md/Markdown.tsx`
- Test: visual / typecheck

**Interfaces:**
- Consumes: `parseRoadmapStages`, nested `Markdown`
- Produces: `Roadmap({ source, highlightedBlocks, highlightedTabs })`

- [ ] **Step 1: Implement Roadmap**

```tsx
"use client";

import { Markdown } from "@/components/md/Markdown";
import { parseRoadmapStages } from "@/lib/content/parseRoadmapStages";
import type { TabBlock } from "@/lib/content/highlightBlocks";

export function Roadmap({
  source,
  highlightedBlocks,
  highlightedTabs,
}: {
  source: string;
  highlightedBlocks: Record<string, string | null>;
  highlightedTabs: Record<string, TabBlock[]>;
}) {
  const stages = parseRoadmapStages(source);
  if (!stages) {
    return (
      <div className="rounded-lg border border-bad/40 bg-bad/5 p-3 text-sm text-muted">
        Invalid roadmap block — expected ### Stage N headings.
      </div>
    );
  }

  return (
    <ol className="relative my-8 list-none space-y-0 pl-0">
      {/* continuous rail behind nodes */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-3 bottom-3 left-[0.6875rem] w-px bg-border"
      />
      {stages.map((chunk, i) => {
        const num = /^### Stage (\d+)/.exec(chunk)?.[1] ?? String(i);
        return (
          <li key={num} className="relative grid grid-cols-[1.375rem_1fr] gap-x-4 pb-10 last:pb-0">
            <div className="relative z-[1] flex justify-center pt-1" aria-hidden>
              <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-on-pop tabular-nums">
                {num}
              </span>
            </div>
            <div className="min-w-0">
              <Markdown
                source={chunk}
                highlightedBlocks={highlightedBlocks}
                highlightedTabs={highlightedTabs}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
```

Use valid Tailwind sizing already in the project (`h-5 w-5` if `h-5.5` is not generated). Measure AA: accent fill vs `on-pop` digit — Indigo Modern already ships this pair for buttons.

- [ ] **Step 2: Wire Markdown.tsx**

Import `Roadmap`. In the `pre` handler, after the `reveal` branch:

```tsx
if (className.includes("language-roadmap")) {
  return (
    <Roadmap
      source={text()}
      highlightedBlocks={highlightedBlocks}
      highlightedTabs={highlightedTabs}
    />
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `cd web && npx tsc --noEmit`

Expected: exit 0

---

### Task 3: Wrap lesson content + content tests

**Files:**
- Modify: `course/getting-started/course-roadmap.md`
- Modify: `web/tests/roadmap.test.ts` (add content assertions)

- [ ] **Step 1: Wrap Stage 0–4**

After the intro paragraph under "## Five stages…", open `` ```roadmap `` before `### Stage 0`, close after Stage 4's last paragraph (before `## How to move through it`). Do not put the intro, quiz, or closing line inside the fence.

- [ ] **Step 2: Content tests**

```ts
import fs from "fs";
import path from "path";

it("course-roadmap has one roadmap fence with stages 0–4", () => {
  const file = path.resolve(__dirname, "../../course/getting-started/course-roadmap.md");
  const body = fs.readFileSync(file, "utf8");
  const fences = [...body.matchAll(/^```roadmap\n([\s\S]*?)^```/gm)];
  expect(fences).toHaveLength(1);
  const stages = parseRoadmapStages(fences[0][1]);
  expect(stages).toHaveLength(5);
  for (let n = 0; n < 5; n++) {
    expect(stages![n]).toMatch(new RegExp(`^### Stage ${n}`));
  }
  const toc = extractToc(body.replace(/^---[\s\S]*?---\n/, ""));
  expect(toc.some((t) => t.text.startsWith("Stage 0"))).toBe(true);
  expect(toc.some((t) => t.text.startsWith("Stage 4"))).toBe(true);
});
```

Frontmatter strip: `load.ts` uses gray-matter; for the test, strip YAML manually or read via the same loader if convenient.

- [ ] **Step 3: Run full targeted verification**

```bash
cd web && npx vitest run tests/roadmap.test.ts && npx tsc --noEmit
```

Expected: PASS, exit 0

- [ ] **Step 4: Visual check** — `/course/getting-started/course-roadmap` light + dark; rail left of stages; TOC links scroll to stages.

---

## Spec coverage check

| Spec requirement | Task |
| --- | --- |
| `roadmap` fence wrap | 3 |
| Rail + nodes left of prose | 2 |
| Tokens / flat / no motion | 2 |
| TOC includes roadmap headings | 1 |
| Nested markdown highlights | 2 |
| Parser error card | 2 |
| Tests | 1, 3 |
| Non-goals (scroll-spy, glyphs) | not implemented |
