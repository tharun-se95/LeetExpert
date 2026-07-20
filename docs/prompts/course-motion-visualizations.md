# Task Brief: Animated Concept Visualizations for the DSA Course

You are working in `/Users/tharunk/DSA` — a DSA course website. The Next.js
app lives in `web/` (App Router, Tailwind v4, `motion` v12 aka Framer
Motion, already installed). Course content is markdown in `course/<module>/
<lesson>.md`, rendered by `web/src/components/md/Markdown.tsx`, which maps
custom fenced-code languages to interactive components (`quiz`, `tabs`,
`reveal`, `complexity`, `mermaid`). Read those files first.

## Goal

Lessons currently explain algorithms with prose, static ASCII diagrams, and
code. Add **step-through animated visualizations** (using `motion/react`)
for the core algorithm mechanics, embedded inline in lessons at the point
where the concept is taught. The bar: a learner who scrubs through the
animation should *see* the invariant hold at every step — visualizations
exist to show state changes and invariants, not to decorate.

## Architecture (follow this; don't invent a parallel system)

1. **New fence type `viz`** in `Markdown.tsx`, consistent with the existing
   `quiz`/`complexity` pattern. Fence body is JSON:

   ````text
   ```viz
   { "id": "write-pointer", "data": [0, 1, 0, 3, 12], "speed": 900 }
   ```
   ````

   `id` selects a component from a registry
   (`web/src/components/viz/registry.ts`); everything else is passed as
   props. Unknown id → render a small error card (see how `Quiz` handles
   bad JSON).

2. **One shared player shell** (`web/src/components/viz/VizPlayer.tsx`)
   providing: play/pause, step forward/back, reset, a scrub slider, a step
   counter ("step 4 / 11"), and a **caption line** describing the current
   step in words. Every visualization is a pure function
   `(props) => Step[]` where a `Step` is a serializable snapshot of the
   algorithm's state plus a caption string; the player renders snapshots
   and animates between them with `motion`. This keeps visualizations
   deterministic, testable, and trivially scrubbable — do NOT drive
   animation off timers inside each viz.

3. **Code-synchronized tracing — this is the product's core feature.**
   Each viz is an *algorithm tracer*: the player shows the code snippet
   beside (desktop) or above (mobile) the animated state, and highlights
   the line being "executed" at the current step, moving in lockstep with
   play/step/scrub. Contract details:

   - The viz definition OWNS its code — a short canonical implementation
     in BOTH Python and TypeScript (mirroring the lesson's solution code,
     trimmed to ≤ ~15 lines; simplify if needed so every step maps to a
     real line). Code in the markdown fence is never used for tracing —
     line numbers must be stable.
   - Each `Step` carries `line: { python: number; typescript: number }`
     (1-indexed into the viz's own snippets). The code panel has the same
     Python/TypeScript tabs as `CodeTabs` (reuse its styling); the
     highlight follows the active tab's line for the current step.
   - Highlight = a `motion` layout-animated bar behind the active line
     (`layoutId` so it glides between lines; instant under reduced
     motion). Auto-scroll the code panel if the snippet exceeds the
     visible height — without scrolling the page.
   - Steps must correspond to *observable* state changes: one step per
     loop iteration or meaningful assignment, not per token. A loop
     iteration that changes two things may be two steps if the caption
     reads better that way. Rule of thumb: 8–25 steps per viz.
   - The caption + highlighted line + state snapshot must AGREE at every
     step. Hand-verify the full trace of each viz against a mental (or
     actual) execution of the snippet before committing — a desynced
     trace is worse than no viz.

4. **Reuse before building.** `web/src/components/lab/primitives/` and
   `web/src/components/explorers/BigOObservatory.tsx` are kept v1
   investments — mine them for cell/pointer/pill rendering patterns and
   the DemoPlayer's conventions. `web/src/components/course/embeds.tsx`
   maps "module/lesson" → full-width explorers ABOVE a lesson; the new
   `viz` fence is for inline placement WITHIN the prose. Both mechanisms
   stay.

## Hard requirements

- **Theme:** use the CSS variables (`--accent`, `--border`, `--surface`,
  `--muted`, `--foreground`, `--background`) — must look right in light
  AND dark mode. No hardcoded hex except via `color-mix` on the vars.
- **Reduced motion:** respect `useReducedMotion()` from `motion/react` —
  when set, jump between steps with no tweening (the player still works).
- **Determinism:** same props → same steps. No randomness, no clocks.
- **Size:** small inputs only (5–8 elements) — legibility beats realism.
- **Responsive:** must not overflow on a 375px viewport; wrap in
  `overflow-x-auto` if a viz is intrinsically wide. No layout shift when
  stepping.
- **No new dependencies.** `motion` + Tailwind + React only.
- **Accessibility:** player buttons keyboard-operable with aria-labels;
  captions are text (they double as the screen-reader narrative).
- **Print:** hide players under `print:hidden` (see how lessons use it).

## Scope, revised for code sync

Code-synchronized tracing roughly doubles per-viz effort. Quality over
coverage: ship items 1–5 below as full tracers, hand-verified, before
touching 6–10. Five excellent tracers beat ten desynced ones — and the
user has explicitly preferred depth over volume in past feedback.

## Backlog — build in this order

Each item names the lesson file to embed into and the state the steps must
show. Insert the `viz` fence directly after the prose paragraph that
teaches the mechanic (you may lightly edit one sentence to reference the
animation, but do not rewrite lessons).

1. **`write-pointer`** — `course/arrays/in-place-techniques.md` (and reuse
   in `move-zeroes.md`). Array cells; `read`/`write` pointer arrows below;
   the three regions (kept / junk / unread) as background tints; caption
   states the invariant each step.
2. **`dynamic-array-growth`** — `course/big-o/best-worst-average-amortized.md`
   and `course/arrays/dynamic-arrays.md`. Appends into capacity slots; on
   overflow, a new twice-as-wide array slides in and elements copy over
   one-by-one; running total-cost counter proves the amortized claim.
3. **`converging-pointers`** — `course/two-pointers/converging-pointers.md`
   (reuse in `two-sum-ii.md`). Sorted array, L/R pointers, each step tints
   the eliminated index red and shows the count of pairs discarded.
4. **`monotonic-stack`** — `course/stacks/monotonic-stack.md` (reuse in
   `daily-temperatures.md`). Input array on top, stack as a vertical column;
   arriving element pops smaller entries (animate them flying out, their
   answer slot filling in below).
5. **`ring-buffer`** — `course/queues/ring-buffer.md`. Circular slot ring;
   head/tail markers stepping with mod arithmetic; enqueue past the end
   visually wraps.
6. **`list-reversal`** — `course/linked-lists/reverse-linked-list.md`
   (concept intro also in `pointer-surgery.md`). Nodes with next-arrows;
   prev/curr/nxt labels; each step flips one arrow — the flipped region
   grows visibly.
7. **`fast-slow`** — `course/linked-lists/linked-list-cycle.md` and
   `middle-of-list.md`. Two tokens walking the same list at speed 1 and 2;
   cycle variant shows the gap shrinking by 1 per step until meeting.
8. **`hash-buckets`** — `course/hash-tables/collision-resolution.md`.
   Keys dropping into buckets via a visible `hash mod m`; a chain growing;
   then a resize doubling the buckets and re-filing every key.
9. **`fib-call-tree`** — `course/big-o/analyzing-code.md`. The fib(4) tree
   growing call-by-call in DFS order; repeated subproblems flash and get a
   "recomputed!" tally — the memoization motivation, animated.
10. **`sliding-window`** — hold until Module 11 exists; design the Step
    shape so a window (two same-direction pointers + a highlighted range)
    is expressible.

## Working method

- Work on a branch off `main`? No — commit to `main` in small commits, one
  viz (component + lesson embeds) per commit, message style matching
  `git log` (imperative, body explains what/why).
- After each viz: `cd web && npm run lint && npm run build` must pass.
  Then start the dev server from `.claude/launch.json` (`web-dev`), open
  the lesson page, step through the animation, check the browser console
  for errors, and screenshot for the final report. Test dark mode and a
  375px viewport for at least the first two vizzes.
- Do NOT redesign the lesson layout, the markdown pipeline beyond the one
  new fence, or the existing `quiz`/`tabs`/`reveal`/`complexity`
  components. Do not touch `video/` — that's a separate Remotion project.
- If a lesson's prose contradicts what animating it reveals (it happens),
  fix the prose minimally and note it in the commit message.

## Definition of done (per viz)

- Registered id, JSON-configurable, rendered via the `viz` fence in at
  least one lesson listed above.
- Steps + captions tell the invariant story; scrubbing to any step shows a
  consistent state.
- Code panel synced: both language tabs, line highlight correct at EVERY
  step in both languages — verified by hand-tracing the snippet end to
  end, not by eyeballing two steps.
- Reduced-motion, dark mode, mobile (stacked layout), print all handled.
- Lint + build green; no console errors on the lesson page; screenshot
  taken showing mid-trace state (highlight + moved elements visible).
