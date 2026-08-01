# IDE Insight / Trace Panel

**Date:** 2026-07-31  
**Status:** v1 shipping  
**Surfaces:** Problem IDE (`Sandbox` `variant="ide"`) — desktop split and mobile Code tab

---

## Problem

On the problem IDE, the vertical split leaves a large empty band between the
code editor and the testcases panel. That space reads as unfinished chrome.
codeMacha’s differentiator is teaching while coding — the gap should carry
algorithm intuition (memory shape, invariants, complexity, case-bound
variables), not blank gray.

A true step debugger (instrumented Python/JS snapshots) does **not** exist
in the runner today. Workers return raw outcomes only; VizPlayer step traces
are hand-authored lesson visuals, not live learner-code traces. v1 must be
honest about that and still ship real teaching value.

---

## Architecture decision

**Ship a problem-aware teaching panel** driven by:

1. **Live data we already have** — selected testcase args, expected value,
   last-run output / pass-fail / logs.
2. **Lesson + module metadata** — complexity fences (often nested inside
   `reveal`), module cheatsheet patterns / complexity rows.
3. **Optional gold configs** — schematic memory overlays (e.g. L/R markers
   for Valid Palindrome) keyed by sandbox `id`, never solution source.

**Do not** instrument the workers in v1. Label every block as
“From selected case”, “After run”, “Target complexity”, or “Pattern cues”
so speculative teaching never looks like a live debugger.

```
IDE column
├── toolbar (lang / Reset / Run)
├── PanelSplit (vertical)
│   ├── primary: CodeEditor
│   └── secondary:
│       ├── InsightPanel (fills former empty band; collapsible)
│       └── IdeTestcases (shared active-case index)
```

Mobile Code tab uses the same stack inside the full-height Sandbox.

---

## Content model (v1)

| Region | Source | Live? |
| --- | --- | --- |
| **Complexity** | Extracted ` ```complexity ` JSON from lesson markdown; else first meaningful row from module cheatsheet | Curated / static |
| **Algorithm state** | Module cheatsheet pattern titles + one-line summaries (capped); gold configs may pin a short invariant checklist | Curated / static |
| **Memory** | Schematic SVG cells from parsed selected-case input (string / array / number list); gold overlays (pointers, window) | Schematic from case |
| **Current variables** | Parsed args for selected case; after Run, got / expected / status for that case | Live for I/O; not mid-execution locals |

**Hard rule:** never dump solution code, reveal bodies, or reference
implementations into the panel.

---

## Layout & design

- Collapsible header: “Insight” + source badge (e.g. “Case-bound · not a live debugger”).
- Default **expanded** on desktop so the empty band is occupied; collapsed state remembers via `localStorage` key `dsa:insight:collapsed`.
- Compact density: chips, SVG strip, short checklist — not a wall of prose.
- Tokens only (`bg-surface`, `bg-code`, `border-border`, `text-accent`,
  `text-muted`, tone chips). No hardcoded hex; another agent may retarget
  primary/layers.
- Flat handbook press: borders / washes, no blur or drop shadows.
- `prefers-reduced-motion`: no layout thrash animations; instant collapse.
- Keyboard: collapse control is a real button with `aria-expanded`.

---

## Data plumbing

```
ProblemWorkspace
  moduleSlug, lessonMarkdown (or pre-extracted insight meta)
       │
       ▼
Sandbox (ide) ── activeCaseIndex (lifted) ──► InsightPanel
                 results / idle                    │
                 SandboxSpec                       ▼
                                      resolveInsight(spec, module, meta, case)
```

- `extractComplexityFromMarkdown(md)` — finds the first
  ` ```complexity ` … ` ``` ` fence even when nested inside a reveal
  string (regex on fence text; complexity JSON is always a small object).
- `resolveInsight({ sandboxId, moduleSlug, complexity, case, result })`
  merges gold override → extracted complexity → cheatsheet defaults.
- Input → memory: `parseCaseMemory(args, shape)` truncates long strings/
  arrays (display cap ~24 cells) with an overflow marker.

### Gold configs (v1 seed)

| Sandbox id | Memory overlay |
| --- | --- |
| `valid-palindrome` | Character strip + L/R end markers (schematic, not animated steps) |
| `two-sum` / `two-sum-ii` | Array strip (plain values) |
| `move-zeroes` | Array strip |
| Module default | Best-effort parse of `args[0]` as string or array |

Gold configs may add 2–4 **invariant checklist** lines that name the
pattern without revealing the solution (e.g. “Skip non-alphanumeric before
comparing”).

---

## Graceful fallbacks

- No complexity fence and no cheatsheet match → hide Complexity region (or
  show “—“ only if at least one other region has content).
- Unparseable / structural args (tree, graph, sequence construct) → Memory
  shows a short typed label (“Tree · level-order”, “Graph · adj”, …) instead
  of cells.
- Insight always mounts for `ide` variant; empty regions collapse so the
  panel never looks broken.

---

## Out of scope (follow-ups)

- Worker instrumentation / variable snapshots / breakpoints.
- Replaying VizPlayer steps against learner code.
- Editing insight from markdown authoring UI.
- Card-variant sandbox embed (lesson inline) — keep unchanged in v1.

---

## Verification

- Unit tests for `extractComplexityFromMarkdown`, `parseCaseMemory`,
  `resolveInsight` (including nested-in-reveal extraction and gold merge).
- Prove new tests can fail (sabotage expectation, restore).
- `tsc` / eslint on touched files; focused vitest run.
- Manual: Valid Palindrome IDE shows Memory / Variables / State / Complexity
  between editor and tests; collapse frees space for tests.
