# Problems Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/problems`'s 21 stacked module-section accordions with one flat, filterable problem list — Status (Solved/Unsolved), Difficulty (existing), and Topic/Module (multi-select) — matching the approved design mockup at https://claude.ai/code/artifact/ea1fc6e9-8c39-4d71-b131-e862524876e9.

**Architecture:** No server-side change — `page.tsx` still passes `groupedProblems()`'s `ProblemGroup[]` to `ProblemsListClient`, which flattens it once via a new pure `problemsFilters.ts` module. Filtering runs client-side over that flat list. A new `ProblemFilterPanel` (Status/Difficulty/Topics controls) renders in a persistent desktop sidebar and, identically, inside a new mobile bottom sheet (`ProblemFilterSheet`) — one component, two containers, no duplicated filter UI.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4, Vitest 4, `@phosphor-icons/react`, `motion/react` (for the mobile sheet's slide animation, matching `MobileLessonsSheet.tsx`'s existing use).

## Global Constraints

- Design spec: `docs/superpowers/specs/2026-09-02-problems-dashboard-design.md`. Read it before starting.
- **Explicitly out of scope** — do not build these, even if they'd be easy to add: the "Continue where you left off" card, the Easy/Medium/Hard breakdown strip, and any sort control or flat/grouped view toggle. The design spec marks all three "good-to-have, not required for v1."
- **No hardcoded Tailwind palette values and no raw hex literals** in `.ts`/`.tsx` — `tests/design-tokens.test.ts` fails the build on both. Family/topic dot colours come from `getFamilyTheme(id).accent` at runtime (a variable, not a literal — matches the existing pattern in `src/components/landing/LandingViz.tsx:113`), never a literal `#rrggbb` in source.
- **No off-scale radius or Tailwind default shadow utilities.** Radius is `rounded-[length:var(--radius-{xs,sm,md,lg,xl})]` only (plus bare `rounded-full`); elevation is the `.shadow-elevation` / `.shadow-edge-*` classes only, never a raw `box-shadow`.
- **Comment text is scanned as code by `tests/design-tokens.test.ts`.** The literal word "rounded" or the literal substring ".dark" anywhere in a `.tsx` file — including inside a comment — trips those scanners. This has broken builds twice already this session. Avoid both words in prose; say "soft-cornered" instead of "rounded" if you need to describe a shape in a comment.
- TypeScript strict: no `any`, no unchecked casts.
- Comments explain **why**, never what.
- **No component-rendering test infrastructure exists in this repo** — no React Testing Library, no jsdom. Every existing UI-adjacent test either tests a pure function directly (`tests/problemDifficulty.test.ts`, `tests/splitProblemTabs.test.ts` — the pattern this plan's Task 1 follows) or scans component source as text for a specific load-bearing string. Do not invent a rendering-test setup; pure logic gets a real Vitest suite, components get `tsc`/`eslint` plus the browser verification in the final task.
- Run all commands from `/Users/tharunk/DSA/web`.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/lib/course/problemsFilters.ts` | **Create.** Pure types + `flattenProblems`/`filterProblems`. |
| `tests/problemsFilters.test.ts` | **Create.** Unit tests for the above. |
| `src/components/problems/ProblemFilterPanel.tsx` | **Create.** Status/Difficulty/Topics controls — presentation only, used by both the sidebar and the mobile sheet. |
| `src/components/problems/ProblemFilterSheet.tsx` | **Create.** Mobile bottom sheet wrapping `ProblemFilterPanel`. |
| `src/components/problems/ProblemsFlatList.tsx` | **Create.** The dense row list + empty state. |
| `src/components/problems/ProblemsListClient.tsx` | **Modify.** Becomes the orchestrator: state, the two-column layout, wiring. |

---

### Task 1: Filtering logic

**Files:**
- Create: `src/lib/course/problemsFilters.ts`
- Test: `tests/problemsFilters.test.ts`

**Interfaces:**
- Consumes: `ProblemGroup` from `@/lib/course/manifest` (fields used: `module.slug`, `module.number`, `module.shortTitle`, `problems: LessonMeta[]` where `LessonMeta` has `slug`/`title`); `Difficulty`/`getProblemDifficulty` from `@/lib/course/problemDifficulty`; `FamilyId` from `@/lib/content/manifest`; `moduleFamily` from `@/lib/course/manifest`; `lessonId` from `@/lib/course/nav`.
- Produces (used by every later task): `StatusFilter` (`"All" | "Solved" | "Unsolved"`), `DifficultyFilter` (`"All" | Difficulty`), `FlatProblem` (`{ slug: string; title: string; difficulty: Difficulty | undefined; moduleSlug: string; moduleLabel: string; moduleNumber: number; familyId: FamilyId | null }` — `undefined`, not `null`: it's exactly what `getProblemDifficulty` returns, no normalization step in between), `flattenProblems(groups: ProblemGroup[]): FlatProblem[]`, `FilterOptions` (`{ query: string; difficulty: DifficultyFilter; status: StatusFilter; topics: Set<string>; solved: Set<string> }`), `filterProblems(flat: FlatProblem[], opts: FilterOptions): FlatProblem[]`.

- [ ] **Step 1: Write the failing tests**

Create `tests/problemsFilters.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  flattenProblems,
  filterProblems,
  type FlatProblem,
} from "@/lib/course/problemsFilters";
import type { ProblemGroup } from "@/lib/course/manifest";

function group(
  moduleSlug: string,
  moduleNumber: number,
  shortTitle: string,
  problems: { slug: string; title: string }[],
): ProblemGroup {
  return {
    module: {
      slug: moduleSlug,
      number: moduleNumber,
      title: shortTitle,
      shortTitle,
      description: "",
      stage: 1,
      status: "available",
      lessons: problems.map((p) => ({ ...p, type: "problem" as const })),
    },
    problems: problems.map((p) => ({ ...p, type: "problem" as const })),
  };
}

const GROUPS: ProblemGroup[] = [
  group("arrays", 4, "Arrays", [
    { slug: "move-zeroes", title: "Move Zeroes" },
    { slug: "rotate-array", title: "Rotate Array" },
  ]),
  group("two-pointers", 10, "Two Pointers", [
    { slug: "three-sum", title: "Three Sum" },
  ]),
];

describe("flattenProblems", () => {
  it("preserves module order, then in-module order", () => {
    const flat = flattenProblems(GROUPS);
    expect(flat.map((p) => p.slug)).toEqual([
      "move-zeroes",
      "rotate-array",
      "three-sum",
    ]);
  });

  it("carries module metadata onto each row", () => {
    const flat = flattenProblems(GROUPS);
    expect(flat[0]).toMatchObject({
      slug: "move-zeroes",
      moduleSlug: "arrays",
      moduleLabel: "Arrays",
      moduleNumber: 4,
    });
  });
});

describe("filterProblems", () => {
  const flat = flattenProblems(GROUPS);
  const noSolved = new Set<string>();

  it("query matches by title, case-insensitive", () => {
    const result = filterProblems(flat, {
      query: "zero",
      difficulty: "All",
      status: "All",
      topics: new Set(),
      solved: noSolved,
    });
    expect(result.map((p) => p.slug)).toEqual(["move-zeroes"]);
  });

  it("empty topics set means unrestricted, not 'match nothing'", () => {
    const result = filterProblems(flat, {
      query: "",
      difficulty: "All",
      status: "All",
      topics: new Set(),
      solved: noSolved,
    });
    expect(result).toHaveLength(3);
  });

  it("topics set restricts to the checked modules", () => {
    const result = filterProblems(flat, {
      query: "",
      difficulty: "All",
      status: "All",
      topics: new Set(["two-pointers"]),
      solved: noSolved,
    });
    expect(result.map((p) => p.slug)).toEqual(["three-sum"]);
  });

  it("status Solved keeps only rows in the solved set", () => {
    const solved = new Set(["arrays/move-zeroes"]);
    const result = filterProblems(flat, {
      query: "",
      difficulty: "All",
      status: "Solved",
      topics: new Set(),
      solved,
    });
    expect(result.map((p) => p.slug)).toEqual(["move-zeroes"]);
  });

  it("status Unsolved excludes rows in the solved set", () => {
    const solved = new Set(["arrays/move-zeroes"]);
    const result = filterProblems(flat, {
      query: "",
      difficulty: "All",
      status: "Unsolved",
      topics: new Set(),
      solved,
    });
    expect(result.map((p) => p.slug)).toEqual(["rotate-array", "three-sum"]);
  });

  it("combines query, topic, and status with AND logic", () => {
    const solved = new Set<string>();
    const result = filterProblems(flat, {
      query: "three",
      difficulty: "All",
      status: "Unsolved",
      topics: new Set(["two-pointers"]),
      solved,
    });
    expect(result.map((p) => p.slug)).toEqual(["three-sum"]);
  });

  it("returns [] when nothing matches", () => {
    const result = filterProblems(flat, {
      query: "nonexistent-problem-xyz",
      difficulty: "All",
      status: "All",
      topics: new Set(),
      solved: noSolved,
    });
    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/problemsFilters.test.ts`
Expected: FAIL — `Cannot find module '@/lib/course/problemsFilters'` (the file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `src/lib/course/problemsFilters.ts`:

```ts
import { moduleFamily, type ProblemGroup } from "@/lib/course/manifest";
import { lessonId } from "@/lib/course/nav";
import {
  getProblemDifficulty,
  type Difficulty,
} from "@/lib/course/problemDifficulty";
import type { FamilyId } from "@/lib/content/manifest";

export type StatusFilter = "All" | "Solved" | "Unsolved";
export type DifficultyFilter = "All" | Difficulty;

export interface FlatProblem {
  slug: string;
  title: string;
  difficulty: Difficulty | undefined;
  moduleSlug: string;
  moduleLabel: string;
  moduleNumber: number;
  familyId: FamilyId | null;
}

/**
 * Module order, then in-module order — the same order the page already
 * presented as stacked sections, so "work it in order, or jump to
 * anything" still holds for the default (unfiltered) view.
 */
export function flattenProblems(groups: ProblemGroup[]): FlatProblem[] {
  return groups.flatMap((g) =>
    g.problems.map((p) => ({
      slug: p.slug,
      title: p.title,
      difficulty: getProblemDifficulty(p.slug),
      moduleSlug: g.module.slug,
      moduleLabel: g.module.shortTitle,
      moduleNumber: g.module.number,
      familyId: moduleFamily(g.module),
    })),
  );
}

export interface FilterOptions {
  query: string;
  difficulty: DifficultyFilter;
  status: StatusFilter;
  /** Module slugs. Empty = every module is eligible, not "match nothing". */
  topics: Set<string>;
  /** lessonId(moduleSlug, slug) set, from useProgress(). */
  solved: Set<string>;
}

export function filterProblems(
  flat: FlatProblem[],
  opts: FilterOptions,
): FlatProblem[] {
  const q = opts.query.trim().toLowerCase();
  return flat.filter((p) => {
    if (opts.difficulty !== "All" && p.difficulty !== opts.difficulty) {
      return false;
    }
    if (opts.topics.size > 0 && !opts.topics.has(p.moduleSlug)) {
      return false;
    }
    const isSolved = opts.solved.has(lessonId(p.moduleSlug, p.slug));
    if (opts.status === "Solved" && !isSolved) return false;
    if (opts.status === "Unsolved" && isSolved) return false;
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.moduleLabel.toLowerCase().includes(q) ||
      (p.difficulty?.toLowerCase().includes(q) ?? false)
    );
  });
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/problemsFilters.test.ts`
Expected: 9 passed.

- [ ] **Step 5: Run the full static battery**

Run: `npx tsc --noEmit && npx eslint src`
Expected: no output from either.

- [ ] **Step 6: Commit**

```bash
git add src/lib/course/problemsFilters.ts tests/problemsFilters.test.ts
git commit -m "feat(problems): add pure flatten/filter logic for the problems dashboard"
```

---

### Task 2: `ProblemFilterPanel` — the shared filter controls

**Files:**
- Create: `src/components/problems/ProblemFilterPanel.tsx`

**Interfaces:**
- Consumes: `StatusFilter`, `DifficultyFilter` from Task 1's `problemsFilters.ts`; `difficultyFilterChipClass` from `@/lib/course/problemDifficulty` (unchanged, existing export — signature `(level: Difficulty | "All", active: boolean) => string`); `cn` from `@/lib/utils`.
- Produces: `TopicOption` (`{ slug: string; label: string; count: number; solvedCount: number; color: string }`), `ProblemFilterPanel` component with props `{ status: StatusFilter; onStatusChange: (s: StatusFilter) => void; difficulty: DifficultyFilter; onDifficultyChange: (d: DifficultyFilter) => void; topics: TopicOption[]; selectedTopics: Set<string>; onToggleTopic: (slug: string) => void; hasActiveFilters: boolean; onClearFilters: () => void }`.

- [ ] **Step 1: Write the component**

Create `src/components/problems/ProblemFilterPanel.tsx`:

```tsx
import { Check } from "@phosphor-icons/react";
import {
  difficultyFilterChipClass,
  type Difficulty,
} from "@/lib/course/problemDifficulty";
import type { DifficultyFilter, StatusFilter } from "@/lib/course/problemsFilters";
import { cn } from "@/lib/utils";

export interface TopicOption {
  slug: string;
  label: string;
  count: number;
  solvedCount: number;
  /** Family accent hex from getFamilyTheme(id).accent, or a neutral fallback. */
  color: string;
}

const STATUS_OPTIONS: StatusFilter[] = ["All", "Unsolved", "Solved"];
const DIFFICULTY_OPTIONS: DifficultyFilter[] = ["All", "Easy", "Medium", "Hard"];

/**
 * The three filter controls (Status, Difficulty, Topics), rendered
 * identically in the desktop sidebar and inside the mobile bottom sheet —
 * this component has no idea which container it's in.
 */
export function ProblemFilterPanel({
  status,
  onStatusChange,
  difficulty,
  onDifficultyChange,
  topics,
  selectedTopics,
  onToggleTopic,
  hasActiveFilters,
  onClearFilters,
}: {
  status: StatusFilter;
  onStatusChange: (s: StatusFilter) => void;
  difficulty: DifficultyFilter;
  onDifficultyChange: (d: DifficultyFilter) => void;
  topics: TopicOption[];
  selectedTopics: Set<string>;
  onToggleTopic: (slug: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div role="group" aria-label="Filter by status">
        <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
          Status
        </p>
        <div className="flex gap-0.5 rounded-[length:var(--radius-md)] border border-border bg-code p-0.5">
          {STATUS_OPTIONS.map((level) => {
            const active = status === level;
            return (
              <button
                key={level}
                type="button"
                aria-pressed={active}
                onClick={() => onStatusChange(level)}
                className={cn(
                  "min-h-9 flex-1 touch-manipulation rounded-[length:var(--radius-sm)] text-xs font-medium transition-colors",
                  active
                    ? "bg-pop text-on-pop"
                    : "text-muted hover:text-foreground",
                )}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      <div role="group" aria-label="Filter by difficulty">
        <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
          Difficulty
        </p>
        <div className="flex flex-col gap-1.5">
          {DIFFICULTY_OPTIONS.map((level) => {
            const active = difficulty === level;
            return (
              <button
                key={level}
                type="button"
                aria-pressed={active}
                onClick={() => onDifficultyChange(level)}
                className={cn(
                  "min-h-9 touch-manipulation rounded-[length:var(--radius-md)] border px-3 py-1.5 text-left font-mono text-[11px] uppercase tracking-wide transition-colors",
                  difficultyFilterChipClass(level, active),
                )}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
          Topics
        </p>
        {/*
          21 modules is long enough to need a capped, scrollable height —
          same overflow-y-auto + bottom mask-image fade TableOfContents.tsx
          already uses, not a new scroll treatment.
        */}
        <div
          className="flex max-h-[420px] flex-col overflow-y-auto rounded-[length:var(--radius-lg)] border border-border bg-code"
          style={{
            maskImage:
              "linear-gradient(to bottom, black calc(100% - 24px), transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black calc(100% - 24px), transparent)",
          }}
        >
          {topics.map((t, i) => {
            const checked = selectedTopics.has(t.slug);
            const topicPct = t.count > 0 ? Math.round((t.solvedCount / t.count) * 100) : 0;
            return (
              <label
                key={t.slug}
                className={cn(
                  "flex min-h-11 touch-manipulation flex-col justify-center gap-1 px-3 py-1.5",
                  i > 0 && "border-t border-border",
                )}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleTopic(t.slug)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[length:var(--radius-xs)] border",
                      checked
                        ? "border-accent bg-accent"
                        : "border-border bg-transparent",
                    )}
                  >
                    {checked ? (
                      <Check size={10} weight="bold" className="text-on-pop" />
                    ) : null}
                  </span>
                  <span
                    aria-hidden
                    className="h-[7px] w-[7px] shrink-0 rounded-full"
                    style={{ backgroundColor: t.color }}
                  />
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-[12.5px]",
                      checked ? "text-foreground" : "text-muted",
                    )}
                  >
                    {t.label}
                  </span>
                  <span className="shrink-0 font-mono text-[10.5px] text-muted">
                    {t.solvedCount}/{t.count}
                  </span>
                </span>
                {/* Mini per-topic progress bar — the same solvedCount/count
                    ratio the old per-module section header showed, now
                    doing real work as filter context instead of a header. */}
                <span
                  aria-hidden
                  className="ml-[25px] h-1 overflow-hidden rounded-full bg-border/60"
                >
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${topicPct}%`, backgroundColor: t.color }}
                  />
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-left text-xs font-medium text-mark hover:opacity-80"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx eslint src`
Expected: no output from either (this component isn't wired into a page yet, so `tsc` is checking it in isolation — it must still compile clean).

- [ ] **Step 3: Commit**

```bash
git add src/components/problems/ProblemFilterPanel.tsx
git commit -m "feat(problems): add the shared Status/Difficulty/Topics filter panel"
```

---

### Task 3: `ProblemFilterSheet` — mobile bottom sheet

**Files:**
- Create: `src/components/problems/ProblemFilterSheet.tsx`

**Interfaces:**
- Consumes: `ProblemFilterPanel` and its full prop set from Task 2 (passed through unchanged, plus `resultCount: number` for this component's own footer button).
- Produces: `ProblemFilterSheet` component with props `{ open: boolean; onClose: () => void; resultCount: number } & ComponentProps<typeof ProblemFilterPanel>`.

- [ ] **Step 1: Write the component**

Create `src/components/problems/ProblemFilterSheet.tsx`:

```tsx
"use client";

import { useEffect, useId, useRef, type ComponentProps } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { ProblemFilterPanel } from "@/components/problems/ProblemFilterPanel";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Mobile filter sheet. Reuses the exact interaction MECHANISM
 * MobileLessonsSheet.tsx already established — scrim, body-scroll lock,
 * Tab focus trap, Escape closes, focus returns to the trigger on close —
 * but slides up from the bottom with soft-cornered top edges, not in from the
 * left: this is a bottom sheet, not a drawer, so the transform axis differs
 * even though the mechanics are identical.
 */
export function ProblemFilterSheet({
  open,
  onClose,
  resultCount,
  ...panelProps
}: {
  open: boolean;
  onClose: () => void;
  resultCount: number;
} & ComponentProps<typeof ProblemFilterPanel>) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const raf = requestAnimationFrame(() => closeRef.current?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const nodes = [
        ...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ].filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <motion.button
            type="button"
            aria-label="Dismiss filters"
            className="absolute inset-0 bg-foreground/35"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-[length:var(--radius-lg)] border border-border border-b-0 bg-elevated"
            initial={reduceMotion ? false : { y: "100%" }}
            animate={{ y: 0 }}
            exit={reduceMotion ? undefined : { y: "100%" }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
          >
            <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
              <span id={titleId} className="text-base font-semibold tracking-tight">
                Filters
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] border border-border text-muted transition hover:bg-surface hover:text-foreground"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" weight="bold" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <ProblemFilterPanel {...panelProps} />
            </div>
            <div className="shrink-0 border-t border-border p-4">
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-12 w-full items-center justify-center rounded-[length:var(--radius-md)] bg-pop text-sm font-semibold text-on-pop"
              >
                Show {resultCount} problem{resultCount === 1 ? "" : "s"}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx eslint src`
Expected: no output from either.

- [ ] **Step 3: Commit**

```bash
git add src/components/problems/ProblemFilterSheet.tsx
git commit -m "feat(problems): add the mobile filter bottom sheet"
```

---

### Task 4: `ProblemsFlatList` — the row list

**Files:**
- Create: `src/components/problems/ProblemsFlatList.tsx`

**Interfaces:**
- Consumes: `FlatProblem` from Task 1's `problemsFilters.ts`; `difficultyBadgeClass` from `@/lib/course/problemDifficulty`; `lessonId`, `problemHref` from `@/lib/course/nav`.
- Produces: `ProblemsFlatList` component with props `{ problems: FlatProblem[]; solved: Set<string>; hasActiveFilters: boolean; emptyMessage?: string; onClearFilters: () => void }`.

- [ ] **Step 1: Write the component**

Create `src/components/problems/ProblemsFlatList.tsx`:

```tsx
import Link from "next/link";
import { ArrowRight, Check, MagnifyingGlass } from "@phosphor-icons/react";
import { getFamilyTheme } from "@/lib/visual/familyTheme";
import { lessonId, problemHref } from "@/lib/course/nav";
import {
  difficultyBadgeClass,
  type Difficulty,
} from "@/lib/course/problemDifficulty";
import type { FlatProblem } from "@/lib/course/problemsFilters";
import { cn } from "@/lib/utils";

/** Neutral fallback for the (in practice unreachable, but typed) null-family case. */
const NEUTRAL_DOT = "var(--muted)";

export function ProblemsFlatList({
  problems,
  solved,
  hasActiveFilters,
  emptyMessage,
  onClearFilters,
}: {
  problems: FlatProblem[];
  solved: Set<string>;
  hasActiveFilters: boolean;
  /** Composed by the caller from the active filter values — e.g.
      `Nothing matches "foo" · Hard · Unsolved · Two Pointers.` The caller
      knows the filter state; this component only renders the sentence. */
  emptyMessage?: string;
  onClearFilters: () => void;
}) {
  if (problems.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-[length:var(--radius-lg)] border border-dashed border-border bg-elevated px-6 py-12 text-center">
        <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-surface text-muted">
          <MagnifyingGlass className="h-5 w-5" aria-hidden />
        </span>
        <p className="text-sm font-medium">No matches</p>
        <p className="mt-1 text-sm text-muted">
          {emptyMessage ?? "No problems to show yet."}
        </p>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-4 text-sm font-medium text-mark transition hover:opacity-80"
          >
            Clear filters
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <ol className="divide-y divide-border overflow-hidden rounded-[length:var(--radius-lg)] border border-border bg-elevated shadow-elevation">
      {problems.map((p) => {
        const id = lessonId(p.moduleSlug, p.slug);
        const isSolved = solved.has(id);
        const dotColor = p.familyId ? getFamilyTheme(p.familyId).accent : NEUTRAL_DOT;
        return (
          <li key={id}>
            <Link
              href={problemHref(p.slug)}
              className={cn(
                "group flex min-h-11 touch-manipulation items-center gap-3 px-4 py-3.5 text-sm transition-[background-color] duration-[var(--dur-fast)] ease-[var(--ease)] motion-reduce:transition-none sm:px-5",
                isSolved
                  ? "bg-good/[0.05] hover:bg-good/[0.08]"
                  : "hover:bg-accent/[0.07]",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  isSolved
                    ? "bg-good text-white"
                    : "border border-border bg-transparent",
                )}
              >
                {isSolved ? <Check size={12} weight="bold" aria-label="Solved" /> : null}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 truncate font-medium",
                  isSolved ? "text-foreground" : "text-foreground group-hover:text-mark",
                )}
              >
                {p.title}
              </span>
              <span className="hidden shrink-0 items-center gap-1.5 rounded-[length:var(--radius-xs)] bg-accent/[0.08] px-2 py-0.5 text-[11px] text-muted sm:inline-flex">
                <span
                  aria-hidden
                  className="h-[6px] w-[6px] shrink-0 rounded-full"
                  style={{ backgroundColor: dotColor }}
                />
                {p.moduleLabel}
              </span>
              {p.difficulty ? (
                <span
                  className={cn(
                    "shrink-0 rounded-[length:var(--radius-xs)] border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide",
                    difficultyBadgeClass(p.difficulty as Difficulty),
                  )}
                >
                  {p.difficulty}
                </span>
              ) : null}
              <ArrowRight
                className="h-4 w-4 shrink-0 text-muted opacity-50 transition-[opacity,transform,color] duration-[var(--dur-fast)] ease-[var(--ease)] group-hover:translate-x-0.5 group-hover:text-accent group-hover:opacity-100 motion-reduce:transition-none sm:opacity-0 sm:group-hover:opacity-100"
                weight="bold"
                aria-hidden
              />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx eslint src`
Expected: no output from either.

- [ ] **Step 3: Commit**

```bash
git add src/components/problems/ProblemsFlatList.tsx
git commit -m "feat(problems): add the flat problem row list and empty state"
```

---

### Task 5: Wire it into `ProblemsListClient`

**Files:**
- Modify: `src/components/problems/ProblemsListClient.tsx`

**Interfaces:**
- Consumes: everything produced by Tasks 1–4 — `flattenProblems`, `filterProblems`, `StatusFilter`, `DifficultyFilter` from `problemsFilters.ts`; `ProblemFilterPanel`, `TopicOption` from Task 2; `ProblemFilterSheet` from Task 3; `ProblemsFlatList` from Task 4.
- Produces: nothing consumed by later tasks (this is the last code task).

- [ ] **Step 1: Replace the file**

The current file groups by module and renders 21 sectioned accordions (read it first if you want the full before-state — it's the file at this path today). Replace its entire contents with:

```tsx
"use client";

import { useMemo, useState } from "react";
import { FunnelSimple, MagnifyingGlass } from "@phosphor-icons/react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { getFamilyTheme } from "@/lib/visual/familyTheme";
import { moduleFamily, type ProblemGroup } from "@/lib/course/manifest";
import {
  flattenProblems,
  filterProblems,
  type DifficultyFilter,
  type StatusFilter,
} from "@/lib/course/problemsFilters";
import { ProblemFilterPanel, type TopicOption } from "@/components/problems/ProblemFilterPanel";
import { ProblemFilterSheet } from "@/components/problems/ProblemFilterSheet";
import { ProblemsFlatList } from "@/components/problems/ProblemsFlatList";
import { cn } from "@/lib/utils";

const NEUTRAL_DOT = "var(--muted)";

export function ProblemsListClient({ groups }: { groups: ProblemGroup[] }) {
  const { solved, solvedCount, totalProblemCount } = useProgress();
  const [query, setQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [topicFilter, setTopicFilter] = useState<Set<string>>(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const flat = useMemo(() => flattenProblems(groups), [groups]);

  const filtered = useMemo(
    () =>
      filterProblems(flat, {
        query,
        difficulty: difficultyFilter,
        status: statusFilter,
        topics: topicFilter,
        solved,
      }),
    [flat, query, difficultyFilter, statusFilter, topicFilter, solved],
  );

  const topics: TopicOption[] = useMemo(
    () =>
      groups.map((g) => {
        const familyId = moduleFamily(g.module);
        const solvedInModule = g.problems.filter((p) =>
          solved.has(`${g.module.slug}/${p.slug}`),
        ).length;
        return {
          slug: g.module.slug,
          label: g.module.shortTitle,
          count: g.problems.length,
          solvedCount: solvedInModule,
          color: familyId ? getFamilyTheme(familyId).accent : NEUTRAL_DOT,
        };
      }),
    [groups, solved],
  );

  const toggleTopic = (slug: string) => {
    setTopicFilter((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const remaining = Math.max(0, totalProblemCount - solvedCount);
  const pct =
    totalProblemCount > 0 ? Math.round((solvedCount / totalProblemCount) * 100) : 0;

  const activeFilterCount =
    (difficultyFilter !== "All" ? 1 : 0) +
    (statusFilter !== "All" ? 1 : 0) +
    topicFilter.size;
  const hasActiveFilters = query.trim().length > 0 || activeFilterCount > 0;

  // Names whichever filters are actually active, so the empty state reads
  // "Nothing matches Hard · Unsolved · Two Pointers" rather than a generic
  // "try loosening a filter" that doesn't say which one to loosen.
  const emptyMessage = useMemo(() => {
    if (!hasActiveFilters) return undefined;
    const parts: string[] = [];
    if (query.trim()) parts.push(`"${query.trim()}"`);
    if (difficultyFilter !== "All") parts.push(difficultyFilter);
    if (statusFilter !== "All") parts.push(statusFilter);
    if (topicFilter.size > 0) {
      const labels = topics
        .filter((t) => topicFilter.has(t.slug))
        .map((t) => t.label);
      parts.push(labels.join(", "));
    }
    return `Nothing matches ${parts.join(" · ")}. Try loosening one filter.`;
  }, [hasActiveFilters, query, difficultyFilter, statusFilter, topicFilter, topics]);

  const clearFilters = () => {
    setQuery("");
    setDifficultyFilter("All");
    setStatusFilter("All");
    setTopicFilter(new Set());
  };

  const filterPanelProps = {
    status: statusFilter,
    onStatusChange: setStatusFilter,
    difficulty: difficultyFilter,
    onDifficultyChange: setDifficultyFilter,
    topics,
    selectedTopics: topicFilter,
    onToggleTopic: toggleTopic,
    hasActiveFilters,
    onClearFilters: clearFilters,
  };

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[22rem] bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--accent)_14%,transparent),_transparent_62%)]"
      />

      <div className="relative mx-auto max-w-5xl px-4 py-10 lg:px-8 lg:py-14">
        <p className="text-xs font-medium tracking-[0.14em] text-mark uppercase">
          Drill the course
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight text-balance uppercase sm:text-5xl">
          Practice
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {totalProblemCount} solve-first problems, one list. Search, filter to
          exactly what you need, and drill it.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
          <StatCard label="Problems" value={String(totalProblemCount)} hint="In the hub" />
          <StatCard
            label="Solved"
            value={String(solvedCount)}
            hint={`${pct}% complete`}
            tone="good"
          />
          <StatCard label="Remaining" value={String(remaining)} hint="Still to crack" />
        </div>

        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-border/60"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}% of problems solved`}
        >
          <div
            className="h-full rounded-full bg-pop transition-[width] duration-[var(--dur)] ease-[var(--ease)] motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>

        <label
          className={cn(
            "mt-6 flex min-h-11 items-center gap-3 rounded-[length:var(--radius-lg)] border border-border bg-elevated px-4 py-3",
            "transition-[border-color,background-color] duration-[var(--dur-fast)] ease-[var(--ease)] motion-reduce:transition-none",
            "focus-within:border-accent/45 focus-within:bg-accent/[0.04]",
          )}
        >
          <MagnifyingGlass className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by problem, module, or difficulty…"
            aria-label="Search problems"
            className="min-w-0 flex-1 appearance-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-xs font-medium text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:text-foreground motion-reduce:transition-none"
            >
              Clear
            </button>
          ) : null}
        </label>

        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          aria-label={
            activeFilterCount > 0
              ? `Open filters, ${activeFilterCount} active`
              : "Open filters"
          }
          className="mt-3 flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-[length:var(--radius-md)] border border-border bg-elevated text-sm font-medium text-foreground lg:hidden"
        >
          <FunnelSimple className="h-4 w-4" aria-hidden />
          Filters
          {activeFilterCount > 0 ? (
            <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-pop px-1 text-[10px] font-bold text-on-pop">
              {activeFilterCount}
            </span>
          ) : null}
        </button>

        <div className="mt-6 grid gap-6 lg:grid-cols-[272px_1fr] lg:items-start">
          <aside className="hidden lg:block">
            <ProblemFilterPanel {...filterPanelProps} />
          </aside>

          <div>
            <p className="mb-3 text-sm text-muted">
              Showing <span className="font-medium text-foreground">{filtered.length}</span>{" "}
              of {totalProblemCount}
            </p>
            <ProblemsFlatList
              problems={filtered}
              solved={solved}
              hasActiveFilters={hasActiveFilters}
              emptyMessage={emptyMessage}
              onClearFilters={clearFilters}
            />
          </div>
        </div>
      </div>

      <ProblemFilterSheet
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        resultCount={filtered.length}
        {...filterPanelProps}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "good";
}) {
  return (
    <div className="rounded-[length:var(--radius-lg)] border border-border bg-elevated shadow-elevation px-2.5 py-3 sm:px-4 sm:py-3.5">
      <p className="text-[10px] font-medium tracking-[0.12em] text-muted uppercase sm:text-[11px]">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-display text-xl font-semibold tracking-tight tabular-nums sm:text-2xl",
          tone === "good" && "text-good",
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-muted sm:text-xs">{hint}</p>
    </div>
  );
}
```

Note what's deliberately gone from the old file: `ModuleGlyph`, `STAGES`/`stageTitle`, the per-module `<section>` accordion, and the module-level "Playbook" link (`lessonHref(module.slug, "practice")` + `Target` icon). All four were part of the grouped-sections layout this replaces, per the design spec's "Modified file" section — none are used by the new flat-list layout, and the spec explicitly calls out the Playbook link's removal as a deliberate consequence, not an oversight.

- [ ] **Step 2: Verify the static battery**

Run: `npx tsc --noEmit && npx eslint src && npm test`
Expected: `tsc`/`eslint` silent; `npm test` reports all test files passing (28 files before this plan, plus `tests/problemsFilters.test.ts` from Task 1 — 29 total).

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: `✓ Compiled successfully` and the full static route table, including `/problems`, with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/problems/ProblemsListClient.tsx
git commit -m "feat(problems): wire the flat list and filters into the problems page"
```

---

### Task 6: Browser verification

**Files:** none modified unless a defect is found.

- [ ] **Step 1: Start the dev server and open /problems**

Use `mcp__Claude_Browser__preview_start` (never `Bash` for dev servers), navigate to `http://localhost:3002/problems` at a viewport ≥1024px wide.

- [ ] **Step 2: Verify the default (unfiltered) view**

Confirm via screenshot: the flat list renders (not 21 sectioned accordions), the desktop sidebar shows Status/Difficulty/Topics, and "Showing 116 of 116" (or the current total — read it off the stat card, don't assume the number).

- [ ] **Step 3: Verify each filter alone**

Click a Topic checkbox (e.g. "Two Pointers"). Confirm: the list narrows to only that module's problems, the "Showing N of 116" count updates, and "Clear filters" appears.

Click "Unsolved" in Status. Confirm every row shown has no checkmark circle. Click "Solved" and confirm the opposite. Click a Difficulty chip (e.g. "Hard") and confirm every visible difficulty badge reads "HARD".

- [ ] **Step 4: Verify filters combine (AND, not OR)**

With a topic and a difficulty both selected, confirm the list only shows rows matching both — not the union. Use `javascript_tool` to read `document.querySelectorAll` results and cross-check against what the filter selection implies, not just a visual scan.

- [ ] **Step 5: Verify the empty state**

Type a nonsense string into search (e.g. `zzzznotarealproblem`) with a topic filter also active (e.g. "Two Pointers" checked). Confirm the "No matches" state renders with its icon, and that its message names the actual active filters — it should read something like `Nothing matches "zzzznotarealproblem" · Two Pointers.`, not a generic "try loosening a filter" sentence. Then confirm "Clear filters" resets query + difficulty + status + topic all at once — check each of the four via `javascript_tool` after clicking Clear, not just that the list repopulates.

- [ ] **Step 6: Verify the Topics sidebar count matches the Status filter**

Pick one module (e.g. "Arrays"). Note its solved count from the sidebar's `TopicOption.solvedCount`-derived number. Then set Status to "Solved" and Topic to only "Arrays", and confirm the resulting row count matches. These two numbers come from the same `solved` Set via two different code paths (`ProblemsListClient`'s `topics` memo vs. `filterProblems`'s status branch) — a real place for a bug to hide that a purely visual check would miss.

- [ ] **Step 7: Verify the mobile filter sheet**

Resize to 375px width. Confirm the sidebar is hidden and the "Filters" button appears, showing an active-count badge when a filter is set. Click it, confirm the sheet slides up from the bottom (not in from the side), focus lands on the close button, Tab cycles within the sheet, Escape closes it, and focus returns to the "Filters" trigger button afterward — check `document.activeElement` via `javascript_tool` before and after, not just visually.

- [ ] **Step 8: Verify both themes**

Screenshot the filtered view in light and dark. Confirm the Topics sidebar's family-colour dots, the Status segmented control's active state, and the difficulty chips all read clearly in both.

- [ ] **Step 9: Final full battery**

Run: `npx tsc --noEmit && npx eslint src && npm test && npm run build`
Expected: everything green, matching Task 5 Steps 2–3 (confirming nothing regressed during manual browser testing).

- [ ] **Step 10: Report**

Report what was verified and how, per CLAUDE.md's reporting rule — distinguish "ran it and it passed" from anything left unproven. If any step surfaces a defect, fix it and re-run the full battery from Step 9 before reporting.
