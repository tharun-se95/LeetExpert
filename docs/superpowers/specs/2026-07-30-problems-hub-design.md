# Problems Hub

**Date:** 2026-07-30
**Scope:** A centralized, LeetCode-style home for all 116 problems, addressed
independently of the course's module/lesson structure. Course chapters keep
teaching the general technique and link out to specific problems; all
problem-specific content (statement, hints, sandbox, solution, variants,
quiz) lives in the hub. Solved-state tracking is part of this spec.

## Problem

The split-pane layout just shipped puts problem-solving inside the course's
`/course/[module]/[lesson]` structure — one problem, nested one level below
the chapter that introduced it, reachable only by paging through that
chapter. There is no single place to see or reach all 116 problems, no
"solved" indicator, and no way to jump straight to a problem without going
through its module. That's a real gap from what a course teaching DSA
problems is expected to offer.

## Approach

### Content split

Course chapters (`type: concept` lessons) are unchanged in content —
teaching stays exactly where it is. What moves: `type: problem` lessons
stop having their own page under `/course/[module]/[lesson]` and instead
live at `/problems/[slug]`, carrying everything they carry today (Problem,
Examples, Constraints, Attempt it first, Hints, the sandbox, Brute force,
The insight, Solution, Variants, Quiz) — the split-pane layout just built
(`ProblemLessonView`, `extractSandboxFence`) is the right shape for this
page essentially unchanged. Nothing about a problem's content is authored
differently; only its address and how it's reached changes.

The sidebar and module page keep listing problem rows in their current
position and order (interleaved with concept rows, matching today's
module structure) — they link to `/problems/<slug>` instead of a course
page. That interleaved listing is what satisfies "chapters are linked to
their problems": no new inline "related problems" content is authored into
concept lessons for this spec.

### Routing and data

Two new routes:

- `/problems` — the list, grouped by module (same grouping the sidebar
  already uses), with a client-side title search across all 116 and a
  "X of 116 solved" summary line.
- `/problems/[slug]` — the individual problem page, statically generated
  for all 116 slugs.

`/course/[module]/[lesson]` is unchanged for concept lessons. For a
`type: problem` lesson it **redirects** (`next/navigation`'s `redirect()`,
permanent) to `/problems/<slug>` rather than 404ing — this is not a fully
static export (`next.config.ts` sets no `output: "export"`), so a
server-evaluated redirect works even though the page is otherwise
statically generated via `generateStaticParams`.

New lookup in `lib/course/manifest.ts`:

```ts
export function findProblemBySlug(
  slug: string,
): { module: ModuleMeta; lesson: LessonMeta } | undefined {
  for (const mod of MODULES) {
    const lesson = mod.lessons.find(
      (l) => l.slug === slug && l.type === "problem",
    );
    if (lesson) return { module: mod, lesson };
  }
  return undefined;
}
```

Safe and unambiguous only because every problem slug is globally unique —
verified against all 116 problem lessons before writing this, and made a
permanent content-test invariant (not just today's observation) alongside
the fence-safety invariants from the split-pane work. `loadLesson` itself
is untouched; `findProblemBySlug` only resolves `slug → {moduleSlug,
lessonSlug}`, then hands off to the existing loader.

### Progress: extending what already exists, not a parallel system

`ProgressProvider` (mounted at the app root via `AppShell`) already tracks
*visited* lessons in `localStorage` under `dsa-course-progress`, keyed by
`moduleSlug/lessonSlug` (`lessonId()`). `VisitTracker` marks a lesson
visited on every route change by matching the pathname via
`lessonIdFromPathname`; `Sidebar` reads `visited` for its per-lesson dot
and each module's "X/Y" count, `Header` reads it for the sitewide "X/191"
counter.

Two changes, both to existing files rather than new parallel
infrastructure:

1. **`ProgressProvider` gains a second tracked set.** `solved: Set<string>`
   and `markSolved(id: string)`, same `moduleSlug/lessonSlug` id format as
   `visited`, its own `localStorage` key (`dsa-course-solved` — a
   distinct fact from having merely visited, so a distinct key). Mirrors
   `visited`'s shape exactly: `solvedCount`, and a `totalProblemCount`
   prop `AppShell` computes and passes in the same way it already computes
   `totalCount` (`allLessonIds().length`) — `MODULES.flatMap(m =>
   m.lessons).filter(l => l.type === "problem").length`.
2. **`lessonIdFromPathname` learns the new URL shape.** Today it only
   matches `/course/[module]/[lesson]`. Moving problems to
   `/problems/[slug]` would otherwise silently stop `VisitTracker` from
   recording visits to all 116 of them — a real regression this work
   would introduce unless fixed here. It gains a second match arm for
   `/^\/problems\/([^/]+)\/?$/`, resolving the slug via
   `findProblemBySlug` to the same composite id `visited`/`solved` already
   use. `VisitTracker` itself needs no changes — it only calls this
   function and doesn't know or care about URL shape.

`Sandbox` does not learn about lesson ids or `ProgressProvider` at all. It
keeps a plain `onSolved?: () => void` callback, called once on the
pass-transition (not written during render). `ProblemLessonView` — which
already knows its own `moduleSlug`/`lessonSlug` and lives inside the
Context tree — is what calls `useProgress().markSolved(lessonId(...))`
from that callback. This keeps `Sandbox` a generic, context-free code
runner, exactly as it is today.

### Individual problem page

`ProblemLessonView` is reused as-is for its layout. Two changes to what
wraps it:

- Route moves from `/course/[module]/[lesson]` to `/problems/[slug]`,
  resolved via `findProblemBySlug`. This is a caller-side change only —
  `/problems/[slug]/page.tsx` computes different values to pass in;
  `ProblemLessonView`'s own prop types (`breadcrumbs: Crumb[]`,
  `prev`/`next: NeighborLink | null`) don't change.
- Breadcrumbs become `[{ label: "Problems", href: "/problems" }, { label:
  mod.shortTitle, href: moduleHref(mod.slug) }, { label: problem title }]`
  — same three-level shape as today's course breadcrumb, with "Problems"
  standing in for "Course" as the top-level section, since the page now
  lives under the hub rather than under a specific course reading path.
- Prev/next stop meaning "course reading order" (meaningless reached from
  a flat list) and become **prev/next problem within the same module** —
  the module's own lesson list, filtered to `type: "problem"`, in existing
  order; both are `null` for a module with only one problem.
- `ProblemLessonView` itself gains a "Solved" badge in the header (same
  position as the existing type pill + reading-time line) and wires
  `Sandbox`'s `onSolved` to `useProgress().markSolved(...)` — the one
  actual change to this component's own source, as opposed to the
  route-level changes above. The badge reflects `solved.has(lessonId)`
  from mount, and updates immediately within the same session via that
  callback — no need to leave and return to see it flip.

### List page

Grouped by module, in the same stage/module order the sidebar already
uses. Each row: title, and a solved checkmark (small tinted circle +
`Check` icon, same vocabulary the sandbox's own per-case pass pips
already use — not the rotated `riso-stamp`, which stays reserved for the
one-time "you just solved this" moment inside the sandbox itself). A
plain client-side text filter across all 116 titles — no server round
trip needed at this scale. A summary line at the top: "X of 116 solved."

### Components

| Unit | Change | Depends on |
| --- | --- | --- |
| `lib/course/manifest.ts` | New `findProblemBySlug` | existing `MODULES` |
| `lib/course/nav.ts` | `lessonIdFromPathname` gains a `/problems/[slug]` match arm | `findProblemBySlug` |
| `components/providers/ProgressProvider.tsx` | New `solved`/`markSolved`/`solvedCount`, new `totalProblemCount` prop | none new |
| `components/layout/AppShell.tsx` | Computes and passes `totalProblemCount` | `manifest.ts` |
| `components/layout/Sidebar.tsx` | Problem rows only: `href` → `/problems/<slug>`, plus a solved checkmark alongside the existing visited dot. Concept rows unchanged — no solved concept applies to them. | `ProgressProvider` |
| `app/course/[module]/page.tsx` | Problem rows only: `href` → `/problems/<slug>`. Concept rows unchanged. | `nav.ts` |
| `app/course/[module]/[lesson]/page.tsx` | Redirects `type: problem` lessons to `/problems/<slug>` | `findProblemBySlug` |
| `app/problems/page.tsx` (new) | The list | `MODULES`, `ProgressProvider` |
| `app/problems/[slug]/page.tsx` (new) | Individual problem page: resolves the slug, computes module-scoped prev/next and the new breadcrumb shape, renders `ProblemLessonView` | `findProblemBySlug`, `loadLesson`, `ProblemLessonView` |
| `components/course/ProblemLessonView.tsx` | Adds the Solved badge; wires `Sandbox`'s `onSolved` to `useProgress().markSolved(...)` | `ProgressProvider` |
| `components/sandbox/Sandbox.tsx` | Gains `onSolved?: () => void`, called once per pass-transition | none new |

### Content-test invariant

One new invariant, alongside the split-pane work's three: every `type:
problem` lesson's slug is globally unique across the whole course
(verified against all 116 before writing this spec; enforced in CI from
here on, since `findProblemBySlug`'s correctness depends on it
permanently, not just today).

## Verification

- `findProblemBySlug` and the slug-uniqueness invariant: unit/content
  tests, plus a sabotage (duplicate a slug across two modules, confirm the
  invariant test fails) before restoring.
- `lessonIdFromPathname`'s new match arm: unit test confirming both
  `/course/[module]/[lesson]` and `/problems/[slug]` resolve to the same
  composite id for the same lesson.
- Browser: visiting a problem at its new URL still increments the
  sitewide visited counter and the module's "X/Y" — confirming the
  regression is actually fixed, not just addressed in theory.
- Browser: solving a problem flips its Sidebar solved checkmark (distinct
  from the existing visited dot), its badge on the problem page, and its
  row on `/problems`, all without a reload.
- Browser: the old `/course/[module]/[lesson]` URL for a problem lesson
  redirects to `/problems/<slug>` rather than 404ing.
- `npx tsc --noEmit`, `npx eslint src tests`, `npm test`, `npm run build`
  all pass; behavior confirmed in the browser at each step, not asserted
  from a green typecheck alone.
