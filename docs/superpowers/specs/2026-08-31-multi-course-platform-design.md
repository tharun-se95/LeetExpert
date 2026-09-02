# Multi-Course Platform Architecture — Design

**Status:** Architecture design only. Scope explicitly excludes designing the
Next.js course's actual curriculum — that gets its own spec once this
platform boundary exists. This document defines the boundary a second
course (Next.js, and others after it) plugs into.

## Problem

This app is currently fused with one course. There is no course-level
concept anywhere in the codebase:

- Routes are hardcoded: `/course/[module]/[lesson]`, `/problems/[slug]` —
  no course identifier in the URL or the data model.
- Content lives in an un-namespaced folder at the repo root: `course/
  <module>/<lesson>.md`.
- `web/src/lib/course/manifest.ts` encodes DSA's specific pedagogy as
  types — every lesson is exactly `concept | problem | practice`, nested
  under a fixed `Stage → Module → Lesson` hierarchy. That three-way split
  *is* the DSA teaching method (learn → prove you can solve it → drill
  it), not a generic content shape.
- The Sandbox (`components/sandbox/Sandbox.tsx`) is an algorithm judge —
  Pyodide/JS execution against hidden input/output test cases against a
  function signature. Right for "implement two-sum," structurally wrong
  for most other subject matter.
- "Family" theming (7 accent colors, one per DSA *pattern family*) is
  lifted into `AppShell` via a route regex and drives site-wide chrome
  tint. It's a DSA taxonomy, not a platform primitive.
- The Coach, cheatsheets, and concept maps are DSA-specific artifacts
  referenced by module/lesson slug throughout dozens of files.
- Manifest exports (`MODULES`, `getModule`, `moduleFamily`,
  `allModuleSlugs`, …) are imported as globals by `AppShell`, `Sidebar`,
  `Breadcrumbs`, `SearchDialog`, the cheatsheets/concept-map registries,
  the Coach's corpus builder, and the landing page — none go through a
  course-scoped accessor.
- Site identity is singular: root metadata, `<title>` template, and the
  landing page all say "DSA Course."

Adding a second course with genuinely different pedagogy (different
lesson taxonomy, different practice mechanism, possibly different content
format entirely) requires introducing a real course boundary — not
widening the existing DSA-shaped schema to fit two subjects.

## Core principle

**A course is a route-tree owner, not a row in a shared manifest.**

Rather than designing a richer shared lesson schema that both DSA and
future courses bend to fit, each course owns its own manifest shape,
route tree, and practice mechanism outright. The platform shares only a
thin, deliberately small set of contracts: a catalog entry, a
progress-tracking storage mechanism, a search-document shape, and a CSS
theming variable contract. Everything else — how a course structures its
content, what "doing the work" looks like, what its lessons are even
called — is that course's own decision.

This is what actually delivers "not all courses have to follow the same
structure": the boundary is a real seam in the code, not a comment saying
courses *could* differ.

## Product framing

The product becomes a multi-course platform starting now, not
DSA-primary-with-extras. The root landing page (`app/page.tsx`) becomes a
course catalog; DSA is the first, most complete entry in it, not the
site's permanent identity. Site metadata (`<title>` template, root
description) goes course-agnostic: "codeMacha" rather than "codeMacha —
DSA Course."

## Routing

Each course gets a literal folder under `app/courses/<slug>/` and owns
whatever route shape it wants underneath:

- DSA: `app/courses/dsa/[module]/[lesson]/page.tsx` and
  `app/courses/dsa/problems/[slug]/page.tsx` (see "Problems route,"
  below) — moved from today's `app/course/` and `app/problems/`, largely
  unchanged internally.
- A future course is under no obligation to mirror that shape — it could
  be `app/courses/nextjs/[track]/[chapter]/[step]/page.tsx`, or
  something flatter. Nothing above the course boundary cares, because
  nothing above the course boundary parses that URL structure.

`next.config.ts` gets redirect rules so existing DSA links survive:

```
/course/:module*   → /courses/dsa/:module*
/problems/:slug*    → /courses/dsa/problems/:slug*
```

The only thing every course *must* export is a small `CourseRegistryEntry`:

```ts
interface CourseRegistryEntry {
  slug: string;
  title: string;
  tagline: string;
  accent: string;       // single accent hex for catalog card + nav chip
  status: "available" | "coming-soon";
  href: string;          // e.g. "/courses/dsa"
  stats?: { label: string; value: string }[]; // e.g. "24 modules", "191 lessons"
}
```

This is enough for the landing catalog, the top-nav course switcher, and
route-to-course matching (e.g. "which course owns `/courses/nextjs/...`
for theming/progress purposes") — without the platform knowing anything
else about that course's internals. Registration is a single static
import into a top-level aggregator (`courses/registry.ts`) — this is a
compile-time convention, not a dynamic/runtime plugin loader. A
runtime-loaded plugin system would be real over-engineering for going
from one course to a handful; a flat array of statically-imported
entries is the right size for this.

## Problems route (DSA-specific decision, made explicit)

`/problems/[slug]` is currently a top-level route, sibling to
`/course/`, not nested under it — exactly the kind of "special top-level
route" this redesign exists to eliminate. It moves to
`/courses/dsa/problems/[slug]`. It is DSA's algorithm judge's problem
list, not a platform primitive; no other course is implied to have a
"problems" concept at all.

## Ownership boundary: shared chrome vs. course-owned

**Global chrome (platform-owned, identical for every course):**

- `AppShell`, `Header`, `Sidebar` skeleton, mobile nav shell,
  `SearchDialog` shell, `ThemeProvider`
- The course catalog / landing page
- The progress-ledger *storage mechanism* (not its contents)
- The Coach's chat UI shell (panel, composer, launcher) — mounting is
  gated per-course, see below

**Course-owned (each course brings its own):**

- Its manifest shape / lesson taxonomy
- Its route pages and layout
- Its practice mechanism — DSA's algorithm-judge Sandbox is *one
  course's* choice, not a platform primitive
- Its content source format (markdown-in-folder is a reasonable default;
  not mandated — a video-first or fully interactive course doesn't have
  to use it)
- Its module/theme color logic, as long as it resolves to the shared CSS
  variable contract (`--accent/--pop/--highlight/--on-pop`)
- Its UI components, physically co-located under its own route folder:
  `app/courses/dsa/_components/` (Next.js private-folder convention, not
  routable). This is stated explicitly so the next course doesn't have
  to guess — today's `components/course/*` (`ModuleGlyph`,
  `ModulePracticeProgress`, etc.) moves here as part of the DSA
  migration.

**The middle layer — an opt-in "lesson kit," not a mandate:** markdown-
to-React rendering with custom fence types, TOC extraction, reading-time
estimation, breadcrumbs, quiz/reveal components. These already exist for
DSA in `lib/content` and `components/md`; the change is packaging them as
utilities a course's route files can *choose* to import, not something a
shared page template invokes implicitly. A course with different content
mechanics (video-first, live-playground-only) simply doesn't import them.

**Sandbox split (refinement over the original DSA Sandbox):** rather than
leaving `Sandbox.tsx` as one monolithic DSA-owned component, split it
into:

- **`CodeEditor` primitive** (kit-layer): the CodeMirror setup, editor
  theme, tab chrome — genuinely generic, moves to the shared kit so a
  future code-focused course doesn't rebuild editor wiring from scratch.
- **`AlgorithmJudge`** (DSA-owned): the Pyodide/JS test-case runner
  against a function signature — stays under `app/courses/dsa/`,
  composed on top of the shared `CodeEditor`.

## Cross-cutting concerns

**Progress tracking.** Today: `localStorage["dsa-course-progress"]` /
`["dsa-course-solved"]`, flat unnamespaced `Set<string>`. A future
course's lesson slug could collide with DSA's. Fix: namespace the
storage key by course (`course-progress:<courseSlug>`,
`course-solved:<courseSlug>`), and change `ProgressProvider`'s consumed
shape from "the DSA lesson list" to a generic `ProgressableItem`
(`{id, kind}`) that each course computes for itself and passes in. The
provider becomes course-agnostic; "what counts as done" stays
course-owned.

*Required migration step, not optional cleanup:* this product already
has real users mid-course (early-bird waitlist, landing copy implies
active study). `ProgressProvider`'s init must read the legacy flat keys
once, and if the new namespaced key (`course-progress:dsa`) is empty,
seed it from the legacy key before dropping the legacy key. Skipping this
silently erases existing users' progress on first load post-migration.

**Search.** Today: `SearchDialog` imports `MODULES` from the DSA manifest
directly and hardcodes the entry shape `{m, s, t, y, h}`
(module/slug/title/type/headings). Fix: define a minimal
`SearchDocument` interface (`{courseSlug, url, title, kind, headings}`);
each course exports a `buildSearchIndex()` producing its own documents
(markdown-based courses reuse a shared indexer; others write their own);
the dialog aggregates all registered courses' indices and ranks across
them with the existing heuristic (title-match beats heading-match,
word-start beats mid-word), now course-blind.

**Theming.** Family theming (DSA's 7 pattern families) stays exactly
as-is *inside* DSA's own code — it doesn't need to generalize. The
platform only needs the existing CSS-variable contract already used by
`familyCssVars()`. `AppShell`'s route-to-theme resolver becomes
`activeThemeFor(pathname)`, dispatching by course-path-prefix to that
course's own resolver — DSA's stays a 7-family lookup; a future course
could supply one accent per module, or nothing at all (monochrome).

**Coach.** Its corpus/prompt/diagnose pipeline is entirely DSA-shaped
(problems, Python/JS sandboxes, hints). Generalizing it now is scope
creep this design doesn't need to take on. Decision: the Coach stays
DSA-only, gated by course — `AppShell` uses the same course-prefix
resolver already needed for theming to decide whether to mount the
launcher at all. `/courses/nextjs/...` simply doesn't render it.
Extending the Coach to other courses is a future design, made once a
second course actually wants one.

**CI content validation.** `web/tests/` currently hardcodes the single
`course/` folder path for registry-id and sandbox-spec validation
(required per project standard: "a string id typo must fail CI, not
render an error card in production"). This must iterate the course
registry rather than a single hardcoded path — otherwise a second
course's content gets zero validation coverage by default, silently.

## Content storage

`course/` (repo root, outside `web/` — a deliberate existing choice that
keeps lesson content out of the Next.js build tree and independently
editable) becomes `courses/dsa/`, sibling folders per course.
`resolveCourseRoot()` in `lib/course/load.ts` changes its existence-check
from `course/` to `courses/<slug>/`.

## Migration path for DSA

This is a real rewiring pass, not a folder rename — stated plainly so
it's scoped correctly at plan time. Manifest globals (`MODULES`,
`getModule`, `moduleFamily`, `allModuleSlugs`, `allLessonsNavIds`,
`allProblemSlugs`, `findProblemBySlug`, …) are currently imported
directly by: `AppShell`, `Sidebar`, `Breadcrumbs`, `SearchDialog`, the
cheatsheets registry, the concept-maps registry, the Coach's corpus
builder, `ModulePracticeProgress`, and the landing page content module —
none go through a course-scoped accessor today. Every one of those
call-sites needs to be touched or re-pointed.

Ordered steps:

1. `course/` → `courses/dsa/`
2. `app/course/[module]/[lesson]/` → `app/courses/dsa/[module]/[lesson]/`;
   `app/problems/[slug]/` → `app/courses/dsa/problems/[slug]/`
3. `components/course/*` → `app/courses/dsa/_components/*`
4. `lib/course/*` stays largely as-is in shape but is understood as
   "DSA's manifest/loader," not a shared platform module — audit and
   re-point every call-site listed above
5. Split `Sandbox.tsx` into shared `CodeEditor` (kit) + DSA-owned
   `AlgorithmJudge`
6. Add the two redirect rules
7. Export DSA's `CourseRegistryEntry`, register it in
   `courses/registry.ts`
8. Namespace DSA's progress-storage keys, with the legacy-key
   read-through migration described above
9. Wire DSA's search index into the new aggregator; update `SearchDialog`
   to consume `SearchDocument[]` instead of the DSA-specific entry shape
10. Update `web/tests/` content validation to iterate the course registry
11. Root landing page (`app/page.tsx`) becomes the course catalog; DSA's
    existing rich landing content moves to `app/courses/dsa/page.tsx` (or
    stays reachable as a catalog card linking there) — exact split is a
    plan-time decision, not an architecture-time one
12. Site metadata/title template goes course-agnostic

## Onboarding a new course (e.g. Next.js), going forward

1. Create `courses/<slug>/` for content, in whatever format that course
   needs
2. Create `app/courses/<slug>/...` — own route shape, own layout, opt
   into whichever lesson-kit pieces are useful (including the shared
   `CodeEditor` primitive, if it wants code editing without DSA's judge
   semantics)
3. Export a `CourseRegistryEntry` from `courses/<slug>/registry.ts`;
   register it in the top-level `courses/registry.ts` aggregator — this
   is the one file every new course must touch to appear in the
   catalog/nav/search
4. Implement its own progress-counting and practice mechanism
5. Decide its own theming: reuse the family-per-module pattern, or a
   single per-course accent, or nothing
6. Coach stays unmounted for the course unless/until a future design
   extends it

The touch-surface for a new course is deliberately small: one registry
file, whatever kit pieces it opts into, and its own isolated route
folder. Everything else is additive.

## Implementation status (2026-09-01)

Implemented per `docs/superpowers/plans/2026-08-31-multi-course-platform.md`
(14 tasks, subagent-driven, final whole-branch review clean — see
`.superpowers/sdd/progress.md` for the full task-by-task record). One
deliberate divergence from this spec's migration step 10, made during
planning and confirmed acceptable at final review:

**Tracked follow-up, gates onboarding any course beyond DSA:**
`web/tests/content.test.ts` was **not** generalized to iterate the course
registry. Its deep validation (registry-id resolution for `viz`/`diagram`
fences, sandbox-fence spec checks) is DSA-shaped by design — the same
reasoning as the deliberately-deferred lesson-kit reclassification — and
a lighter `web/tests/courseContentCoverage.test.ts` guard was added
instead, asserting only that every registered course has a non-empty
content directory. **End condition:** before a second course is
registered in `COURSES`, decide explicitly whether its content needs
registry-id/sandbox-spec-equivalent CI validation of its own (its own
test file, or a generalized version of `content.test.ts`) — do not ship
a second course with silent zero coverage on this axis, per CLAUDE.md
§5's "a string id typo must fail CI, not render an error card in
production."

Also noted, not tracked as blocking: `SearchDialog.tsx` still resolves a
search hit's module title via a direct `MODULES` import from DSA's
manifest (`MODULE_TITLE = new Map(MODULES.map(...))`), predating this
migration. Harmless with one course registered; will need generalizing
(e.g. sourcing titles from each course's own registry entry) whenever a
second course's search results need a real title instead of a raw slug.

## Explicitly out of scope for this design

- The Next.js course's actual module/lesson structure and pedagogy
- Generalizing the Coach beyond DSA
- Any authentication/user-account system (courses are still fully
  anonymous/localStorage-based)
- A dynamic/runtime-loaded plugin system for courses (static registry is
  the right size for the current scale)
