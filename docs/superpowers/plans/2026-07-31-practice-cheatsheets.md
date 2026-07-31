# Practice Cheatsheets Implementation Plan

> **Status:** implemented (v1) — tasks below retained as the historical checklist.
>
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a registry-driven, diagram-rich Cheatsheet on every practice lesson, with gold content for five high-traffic modules and solid visual templates for the rest.

**Architecture:** Typed `ModuleCheatsheet` registry keyed by module slug; React `Cheatsheet` section with reusable SVG diagram primitives; practice page strips `## Problems` from markdown, injects Cheatsheet, then re-emits Problems + `PracticeProblemsList`. CI completeness tests gate missing modules.

**Tech Stack:** Next.js App Router, TypeScript strict, React, Vitest, Phosphor icons, handbook design tokens (`globals.css`).

## Global Constraints

- All colour through handbook semantic tokens — no hardcoded Tailwind palette (`emerald-500`, etc.).
- Flat print language: ink, rules, halftone — no blur or drop shadows.
- Practice chapters must not embed sandboxes or leak solutions.
- Both themes first-class; `motion-reduce:transition-none` on any transition.
- TypeScript strict; no `any`.
- Diagrams need real `aria-label`s (`role="img"`).
- Do **not** git commit unless the user explicitly asks.
- Commands run from `/Users/tharunk/DSA/web` unless stated otherwise.

## File map

| File | Responsibility |
| --- | --- |
| `web/src/lib/course/cheatsheets/types.ts` | Shared types |
| `web/src/lib/course/cheatsheets/registry.ts` | Map + getters |
| `web/src/lib/course/cheatsheets/content/*.ts` | Module content |
| `web/src/lib/content/splitPracticeBody.ts` | Intro / Problems split |
| `web/src/components/cheatsheet/*` | UI + diagrams |
| `web/src/app/course/[module]/[lesson]/page.tsx` | Wire-up |
| `web/tests/cheatsheets.test.ts` | Completeness |
| `web/tests/splitPracticeBody.test.ts` | Split helper |
| `HANDOFF.md` | Shipped note + follow-ups |

---

### Task 1: Types + split helper + failing completeness test

**Files:**
- Create: `web/src/lib/course/cheatsheets/types.ts`
- Create: `web/src/lib/content/splitPracticeBody.ts`
- Create: `web/tests/cheatsheets.test.ts`
- Create: `web/tests/splitPracticeBody.test.ts`

- [ ] **Step 1: Write types**

```ts
export type CueTone = "accent" | "good" | "warn" | "bad" | "muted" | "mark";
export type CheatsheetTier = "gold" | "template";
export type DiagramId =
  | "array-cells"
  | "two-pointers"
  | "sliding-window"
  | "hash-buckets"
  | "stack-lifo"
  | "queue-fifo"
  | "linked-list"
  | "binary-search"
  | "prefix-bar"
  | "bfs-layers"
  | "dp-table"
  | "tree-levels"
  | "heap-pyramid"
  | "interval-sweep"
  | "matrix-grid"
  | "recursion-tree"
  | "sort-bars"
  | "trie-branches"
  | "greedy-choice";

export interface PatternCard {
  title: string;
  summary: string;
  tone: CueTone;
  smell?: string;
  diagram?: DiagramId;
}
export interface ComplexityRow {
  label: string;
  time: string;
  space: string;
  note?: string;
}
export interface SmellCue {
  smell: string;
  pattern: string;
}
export interface Trap {
  title: string;
  detail: string;
  tone: "warn" | "bad";
}
export interface ModuleCheatsheet {
  moduleSlug: string;
  tier: CheatsheetTier;
  tagline: string;
  patterns: PatternCard[];
  complexity: ComplexityRow[];
  smells: SmellCue[];
  traps: Trap[];
}
```

- [ ] **Step 2: Write `splitPracticeBody`**

Split on a line that is exactly `## Problems` (CommonMark ATX). Return `{ intro, hadProblemsHeading }`.

- [ ] **Step 3: Write failing registry completeness test** that imports `getCheatsheet` / `CHEATSHEETS` and asserts every practice module has an entry. Run and confirm FAIL (module not found / empty registry).

- [ ] **Step 4: Write splitPracticeBody unit tests** (with / without heading).

---

### Task 2: Diagram primitives + Cheatsheet UI

**Files:**
- Create: `web/src/components/cheatsheet/diagrams.tsx`
- Create: `web/src/components/cheatsheet/tone.ts`
- Create: `web/src/components/cheatsheet/PatternCard.tsx`
- Create: `web/src/components/cheatsheet/ComplexityStrip.tsx`
- Create: `web/src/components/cheatsheet/SmellCues.tsx`
- Create: `web/src/components/cheatsheet/TrapList.tsx`
- Create: `web/src/components/cheatsheet/Cheatsheet.tsx`

- [ ] **Step 1: Implement `CheatsheetDiagram({ id, label })`** covering every `DiagramId` with flat stroke/fill using `currentColor` + token classes (`text-accent`, `text-good`, `text-warn`, `text-bad`, `text-muted`, `text-mark`).

- [ ] **Step 2: Implement section components** using token borders/washes; header uses `ModuleGlyph`.

- [ ] **Step 3: `Cheatsheet` composes header → smells → patterns grid → complexity → traps**, with `id="cheatsheet"` on the h2.

---

### Task 3: Registry + gold content (5 modules)

**Files:**
- Create: `web/src/lib/course/cheatsheets/content/arrays.ts` (and strings, hash-tables, two-pointers, sliding-window)
- Create: `web/src/lib/course/cheatsheets/registry.ts`

Gold bar: 4–6 patterns, most with diagrams; ≥3 smells; ≥2 traps; distinctive tagline.

---

### Task 4: Template content (remaining 16 modules)

**Files:**
- Create content modules for: linked-lists, stacks, queues, prefix-sum, binary-search, sorting, matrix, recursion-backtracking, binary-trees, bst, heaps, tries, intervals, greedy, graphs, dynamic-programming
- Register all in `registry.ts`

Template bar: 3–5 patterns (≥1 diagram), ≥2 complexity rows, ≥2 smells, ≥1 trap.

---

### Task 5: Wire practice lesson page + TOC

**Files:**
- Modify: `web/src/app/course/[module]/[lesson]/page.tsx`
- Optionally: `web/src/components/course/LessonView.tsx` if a second slot is cleaner (prefer composing in `afterMarkdown`)

```tsx
const { body, authored } = extractPracticeProblemsFence(lesson.markdown);
const { intro } = splitPracticeBody(body);
const rows = mergePracticeProblems(moduleSlug, authored);
const sheet = getCheatsheet(moduleSlug);
const toc = [
  ...extractToc(intro),
  { id: "cheatsheet", text: "Cheatsheet", level: 2 },
  { id: "problems", text: "Problems", level: 2 },
];
// LessonView with markdown: intro, toc override, afterMarkdown:
//   <Cheatsheet sheet={sheet} moduleTitle={mod.shortTitle} />
//   <h2 id="problems">Problems</h2>
//   <PracticeProblemsList ... />
```

Ensure `extractToc` is imported from `@/lib/course/load`.

---

### Task 6: Verification + HANDOFF

- [ ] Run `npx vitest run tests/cheatsheets.test.ts tests/splitPracticeBody.test.ts`
- [ ] Run `npx tsc --noEmit`
- [ ] Run eslint on touched paths
- [ ] Update `HANDOFF.md` with shipped cheatsheets + follow-up to deepen templates to gold
- [ ] Sabotage check: temporarily remove one registry entry, confirm test fails, restore

---

## Spec coverage checklist

| Spec requirement | Task |
| --- | --- |
| Hybrid registry | 3–4 |
| Render above Problems | 5 |
| Gold ×5 + template ×16 | 3–4 |
| SVG diagrams + tones | 2 |
| CI completeness | 1, 6 |
| No solution leak | content review in 3–4 |
| Tokens / flat / a11y | 2 |
| Authoring guide in spec | already in design doc §11 |
