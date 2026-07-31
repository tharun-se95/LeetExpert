# Practice Cheatsheets

**Date:** 2026-07-31  
**Status:** implemented (v1.1 — gold set expanded; diagram primitives + depth gates)  
**Approach (approved via autonomous product decision):** Hybrid typed registry + React renderer  
**Plan:** `docs/superpowers/plans/2026-07-31-practice-cheatsheets.md`  
**Extends:** `docs/superpowers/specs/2026-07-31-lessons-practice-split-design.md`

**Out of scope:** Remotion / `video/`, sandbox embeds in practice chapters, full solutions, per-problem solution spoilers, markdown-fence authoring of SVG blocks.

---

## 1. Problem

Practice chapters teach *what to drill* (problem list + briefs) but give
learners no compact **pattern memory surface** before they open the IDE.
A plain prose playbook does not imprint the module’s classic moves — two
pointers meeting, window grow/shrink, hash buckets, LIFO strips — the way a
well-designed visual cheatsheet does.

The product gap: practice lessons need a flagship, handbook-press cheatsheet
that feels premium, colour-coded, and diagram-led — without leaking answers
to the module’s sandboxed problems.

---

## 2. Goals

1. Every `type: practice` module shows a **Cheatsheet** section above the
   Problems list.
2. Visual imprint: module glyph header, colour-coded pattern cards, reusable
   SVG diagram primitives, complexity strip, smell→pattern cues, trap
   callouts.
3. Content is pattern memory — not starter code, not expected outputs, not
   full algorithms for the module’s problems.
4. CI fails if any practice-bearing module lacks a registry entry.
5. Both themes (light/dark), token-only colour, flat print language, a11y.

### Non-goals (v1)

- Authoring cheatsheets as markdown fences (registry is the source of truth).
- Interactive tracers / VizPlayer inside the cheatsheet.
- Printing/PDF export.
- Deepening every module to gold richness (template tier is intentional).

---

## 3. Approaches considered

| Approach | Pros | Cons |
| --- | --- | --- |
| **A. Markdown fence only** (` ```cheatsheet ` YAML) | Matches `practice-problems` authoring | Hard to express rich SVG; authors invent inconsistent structures; weak type safety |
| **B. Pure React registry** | Typed, reusable diagrams, CI-complete | Content lives in TS, not `course/` markdown |
| **C. Hybrid (recommended)** | Registry for visuals + typed blocks; practice.md stays intro playbook; optional future fence for prose overlays | Two places to look (acceptable: visuals need code) |

**Decision: C — Hybrid, registry-primary.**

Practice markdown keeps the short “How to practice” playbook. The cheatsheet
is a typed `ModuleCheatsheet` looked up by module slug and rendered by React
between the intro and the Problems list. Diagrams are parameterized SVG
components selected by a `DiagramId` discriminant — never free-form SVG in
markdown.

Why not A: the product requirement is “rich visual imprint / SVGs,” which
fights YAML. Why not B alone without a clear page slot: we still need the
practice page composition and TOC rewrite; “hybrid” names the split between
markdown intro and registry visuals.

---

## 4. Information architecture

On `/course/<module>/practice`:

```
[Breadcrumbs / title]
## How to practice…          ← from practice.md (intro only)
## Cheatsheet                ← registry renderer
  header band + ModuleGlyph
  smell → pattern cues
  pattern cards (+ diagrams)
  complexity strip
  traps
## Problems                  ← React heading + PracticeProblemsList
```

The `## Problems` heading is **stripped from the markdown body** at render
time (same spirit as stripping the `practice-problems` fence) and re-emitted
in React after the cheatsheet so order cannot drift. TOC is rebuilt for the
practice page: intro headings + Cheatsheet + Problems.

---

## 5. Data model

```ts
type CueTone = "accent" | "good" | "warn" | "bad" | "muted" | "mark";

type DiagramId =
  | "array-cells"
  | "two-pointers"
  | "sliding-window"
  | "hash-buckets"
  | "stack-lifo"
  | "queue-fifo"
  | "linked-list"
  | "fast-slow-list"
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
  | "greedy-choice"
  | "union-find";

interface PatternCard {
  title: string;
  summary: string;
  tone: CueTone;
  /** Interview “smell” that points at this pattern — optional. */
  smell?: string;
  diagram?: DiagramId;
}

interface ComplexityRow {
  label: string;
  time: string;
  space: string;
  note?: string;
}

interface SmellCue {
  smell: string;
  pattern: string;
}

interface Trap {
  title: string;
  detail: string;
  tone: "warn" | "bad";
}

interface ModuleCheatsheet {
  moduleSlug: string;
  tier: "gold" | "template";
  tagline: string;
  patterns: PatternCard[]; // gold: 4–6; template: 3–5
  complexity: ComplexityRow[]; // ≥ 2
  smells: SmellCue[]; // ≥ 2
  traps: Trap[]; // ≥ 1
}
```

**Tone semantics (stable meaning, not decoration):**

| Tone | Use |
| --- | --- |
| `accent` / `mark` | Core pattern, “reach for this” |
| `good` | Safe / preferred complexity or invariant |
| `warn` | Easy to miss edge; caution |
| `bad` | Classic foot-gun / wrong approach |
| `muted` | Secondary / fallback idea |

---

## 6. Visual language

- **Header band:** `bg-accent/[0.06]` (or surface wash) + `ModuleGlyph` +
  module short title + tagline. Flat; no shadow/blur. Halftone optional via
  existing `.riso-halftone` utilities if already in globals — otherwise a
  simple rule + wash.
- **Pattern cards:** border + left rule in tone colour; optional diagram
  panel (SVG) with `role="img"` + `aria-label`.
- **Complexity strip:** mono chips for time/space; `good` when O(n)/O(1)
  is the target cue, `warn` when log factors matter — still token classes.
- **Smell → pattern:** short arrow rows (text + chevron), not a graph lib.
- **Traps:** callout blocks using `border-warn` / `border-bad` + tinted wash.
- **Motion:** optional subtle card enter via existing duration tokens;
  `motion-reduce:transition-none`. No continuous animation required.

Colour: semantic tokens only (`accent`, `pop`, `good`, `warn`, `bad`,
`muted`, `mark`, `tone-sky` if needed for a third info cue). No
`emerald-500` / hardcoded Tailwind palette.

---

## 7. Content tiers

| Tier | Modules (v1.1) | Bar |
| --- | --- | --- |
| **Gold** | `arrays`, `strings`, `hash-tables`, `two-pointers`, `sliding-window`, `linked-lists`, `stacks`, `binary-search`, `graphs` | ≥4 patterns; ≥3 diagrammed; ≥2 distinct DiagramIds; card-level smells; ≥4 smell cues; ≥2 traps; summaries ≥60 chars |
| **Template** | Remaining practice modules (12), including deepened `dynamic-programming` | Glyph header + ≥3 patterns (each with smell + ≥1 diagram overall) + complexity + ≥2 smells + ≥2 traps |

Every practice-bearing module (21) **must** have a registry entry.

### Solution-leak rule

Cheatsheets may name patterns (“write pointer”, “expand/shrink window”) and
show generic diagrams. They must **not** paste reference solutions, case
answers, or problem-specific closed-form tricks that skip the sandbox.

---

## 8. File map

| Path | Role |
| --- | --- |
| `web/src/lib/course/cheatsheets/types.ts` | Types |
| `web/src/lib/course/cheatsheets/registry.ts` | `CHEATSHEETS` map + `getCheatsheet` + `practiceModuleSlugs` |
| `web/src/lib/course/cheatsheets/content/*.ts` | Per-module (or batched) content |
| `web/src/lib/content/splitPracticeBody.ts` | Strip `## Problems` from intro |
| `web/src/components/cheatsheet/Cheatsheet.tsx` | Section shell |
| `web/src/components/cheatsheet/PatternCard.tsx` | Card |
| `web/src/components/cheatsheet/ComplexityStrip.tsx` | Complexity table/chips |
| `web/src/components/cheatsheet/SmellCues.tsx` | Smell → pattern |
| `web/src/components/cheatsheet/TrapList.tsx` | Traps |
| `web/src/components/cheatsheet/diagrams.tsx` | SVG primitives + `CheatsheetDiagram` |
| `web/src/app/course/[module]/[lesson]/page.tsx` | Wire cheatsheet + split body + TOC |
| `web/tests/cheatsheets.test.ts` | Completeness + shape invariants |

---

## 9. Validation

`web/tests/cheatsheets.test.ts` (and optionally a content.test hook):

1. Every module with a `practice` lesson has a `CHEATSHEETS[slug]` entry.
2. No orphan cheatsheet for a non-practice module.
3. Each sheet: `patterns.length` ≥ 3, `complexity.length` ≥ 2,
   `smells.length` ≥ 2, `traps.length` ≥ 1.
4. Gold tier modules match `GOLD_MODULE_SLUGS` (nine modules as of v1.1).
5. Every `diagram` id is a known `DiagramId`; every DiagramId is used ≥ once.
6. Summaries/taglines are non-empty strings; gold depth thresholds in tests.
7. Template sheets: ≥2 traps; every pattern carries a card-level smell.

---

## 10. Accessibility

- Cheatsheet root: `<section aria-labelledby="cheatsheet-heading">`.
- Diagrams: `role="img"` + descriptive `aria-label` (not `aria-hidden`
  unless purely decorative duplicate of adjacent text).
- Focus: interactive elements (if any) use existing focus-ring tokens;
  v1 is mostly static — links stay in the Problems list.
- `prefers-reduced-motion`: no required motion; any transition uses
  `motion-reduce:transition-none`.

---

## 11. Authoring guide (v1)

To add or deepen a cheatsheet:

1. Open or create `web/src/lib/course/cheatsheets/content/<module>.ts`.
2. Export a `ModuleCheatsheet` satisfying the shape above.
3. Register it in `registry.ts`.
4. Prefer an existing `DiagramId`; add a new primitive in `diagrams.tsx`
   only when no existing diagram carries the idea.
5. Run `npx vitest run tests/cheatsheets.test.ts`.
6. Promote `tier: "template"` → `"gold"` when the module reaches gold bar
   (update the gold-set assertion in the test).

Do **not** put cheatsheet YAML into `practice.md` in v1.

---

## 12. Follow-ups

- Promote remaining templates → gold (priority: `dynamic-programming`,
  `heaps`, `binary-trees`, `intervals`, `recursion-backtracking`).
- Optional later: thin markdown fence for *extra* prose under the registry
  header (not a replacement for typed cards).
- Optional: print stylesheet polish for cheatsheet pages.
