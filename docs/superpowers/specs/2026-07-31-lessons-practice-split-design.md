# Lessons vs Practice separation

**Date:** 2026-07-31  
**Status:** implemented (v1)  
**Approach (approved):** Finish Problems hub + add Practice chapters (approach 1)  
**Lessons sidebar (approved):** concepts + Practice chapter only (option A)  
**Practice chapter content (approved):** module playbook **and** per-problem briefs + links (option C)  
**Plan:** `docs/superpowers/plans/2026-07-31-lessons-practice-split.md`

**Supersedes / extends:** `docs/superpowers/specs/2026-07-30-problems-hub-design.md`  
(see §11 for what that spec already shipped vs what this one replaces)

**Out of scope:** Remotion / `video/`, waitlist, brand renaming.

---

## 1. Problem

The course still treats teaching and drilling as one mixed path. The Lessons
sidebar lists every concept and every problem interleaved. There is no
`/problems` index, Header has no Lessons / Practice entry points, search
always routes to `/course/…`, and old course URLs for problems still render
the IDE instead of redirecting to the hub.

`2026-07-30-problems-hub-design.md` started the split (flat problem URLs +
solved tracking) but explicitly kept problem rows in the course sidebar.
That IA is wrong for a product with two jobs: **learn the idea**, then
**practice the problems**.

---

## 2. Information architecture (approved)

| Surface | Route | Job |
| --- | --- | --- |
| Lessons | `/course…` | Teaching only. Sidebar = concept lessons + one Practice chapter per module that has problems (last in that module). |
| Practice hub | `/problems` | All 116 problems, grouped by module, client search, “X of 116 solved”. Top-nav label: **Practice**. |
| Problem page | `/problems/<slug>` | Existing split-pane / IDE workspace. Unchanged in substance. |
| Practice chapter | `/course/<module>/practice` | Real lesson in the Lessons tree: module playbook + per-problem briefs + links into the hub. |
| Legacy problem URL | `/course/<module>/<problem-slug>` | **Permanent** redirect → `/problems/<slug>`. |

Landing (`/`) stays the marketing / continue surface. Header **Lessons** and
**Practice** are how learners enter the two product modes from any page
that uses the app chrome (including landing when the header is shown).

---

## 3. Relationship to 2026-07-30 Problems Hub

### Already shipped (keep; this spec builds on it)

- Manifest helpers: `findProblemBySlug`, `getProblemNeighbors`,
  `groupedProblems`, `allProblemSlugs`
- `problemHref`, `lessonIdFromPathname` understanding `/problems/[slug]`
- `ProgressProvider` `solved` / `markSolved` / `totalProblemCount`
  (`dsa-course-solved`)
- `/problems/[slug]` rendering `ProblemWorkspace` (split-pane IDE)
- Sandbox `onSolved` → `markSolved`
- Problem-slug global uniqueness as a content-test invariant

### Specified in 2026-07-30 but not shipped (finish under this spec)

- `/problems` list page (grouped, search, solved summary + row checks)
- Redirect of `type: problem` off `/course/[module]/[lesson]`
- Wiring problem hrefs in nav / module overview to `/problems/<slug>`
  (then **removing** those rows from Lessons chrome — see below)

### Explicitly superseded by this spec

| 2026-07-30 claim | This spec |
| --- | --- |
| Sidebar keeps interleaved problem rows, only changing href to the hub | Sidebar **drops** individual problem rows; Practice chapter is the Lessons-side entry |
| Module overview lists every problem as a primary lesson row | Module overview lists concepts + Practice chapter; problem count as metadata / via Practice |
| Optional sidebar “Problems” link as the only hub entry | Header **Lessons** / **Practice** are primary; sidebar stays Lessons-scoped |
| “No new Practice-chapter content” | Each problem-bearing module gets a Practice chapter (option C) |

Solved-state UX from 2026-07-30 (badge on the problem page, check on hub
rows, `bg-good/15 text-good` + `Check` vocabulary) remains the standard.
Solved checkmarks do **not** return on Lessons sidebar rows (those rows
are gone).

---

## 4. Nav chrome

### Header

Add two text links between brand and search (desktop); same two in the
compact header row on small screens (visible without opening the course
sidebar):

| Label | `href` | Active when |
| --- | --- | --- |
| **Lessons** | `/course` | pathname is `/course` or starts with `/course/` |
| **Practice** | `/problems` | pathname is `/problems` or starts with `/problems/` |

Active treatment matches existing pop / accent active language used in the
sidebar (filled pop block or equivalent tokenized active style — no new
palette). Landing (`/`) activates neither.

Do **not** add a third “Course Overview” competitor in the header; `/course`
is Lessons home. The sidebar’s existing “Course Overview” link may stay as
an in-Lessons jump target, or be retitled “All modules” — either is fine
as long as it still points at `/course`.

### Sidebar (Lessons only)

Shown on Lessons routes as today. On `/problems` and `/problems/[slug]`,
the course sidebar may remain mounted (current `AppShell` behaviour) but
must not be the primary way to browse problems — the hub list is. Prefer
keeping the shell consistent rather than inventing a second nav tree for
v1; Header **Practice** + hub grouping is enough.

### Landing

No IA change required beyond Header links being available. Existing
landing CTAs that deep-link into a first lesson or first problem keep
working; prefer first-problem links already using `/problems/…` where they
exist.

---

## 5. Lessons sidebar

### What appears

For each module, sidebar lesson rows are:

1. Every `type: "concept"` lesson, in authored order  
2. If the module has ≥1 `type: "problem"` lesson: one **Practice** row last  

Individual `type: "problem"` lessons **do not** appear.

### Practice chapter representation

| Field | Value |
| --- | --- |
| Manifest / frontmatter `type` | **`practice`** (new `LessonType` alongside `concept` \| `problem`) |
| Slug | `practice` (unique within the module; path `/course/<module>/practice`) |
| Title | `Practice` |
| Position | Last lesson in that module’s `lessons` array |

**Why a new type, not `concept` + slug special-case:** sidebar filtering,
module overview icons, progress denominators, and search badges need a
stable discriminator. Slug `=== "practice"` alone is brittle if a future
concept is ever named similarly.

**Modules without problems** (today: `getting-started`, `big-o`,
`math-for-dsa`) get **no** Practice chapter. “Every module” in the product
sense means every module that has problems to practice — 21 of 24. Empty
Practice chapters are not shipped.

### `buildCourseNav`

Filter to `type === "concept" || type === "practice"`. Practice href is
`lessonHref(module, "practice")` (a course lesson URL, not `/problems`).

Sidebar active-state for a Practice row matches `/course/<module>/practice`.
Visiting `/problems/<slug>` does **not** highlight the Practice row (the
learner is in Practice hub mode). Optional later enhancement: highlight
Practice when any of that module’s problems is open — **out of v1**.

### Progress counting

Two independent meters; do not collapse them.

| Meter | Storage | Denominator | Numerator | Where shown |
| --- | --- | --- | --- | --- |
| **Lessons progress** | existing `dsa-course-progress` (`visited`) | Count of Lessons-sidebar lessons only (`concept` + `practice`) | Visited ids in that same set | Header progress chip; sidebar per-module `done/total` |
| **Practice solved** | existing `dsa-course-solved` (`solved`) | 116 (`allProblemSlugs().length`) | `solvedCount` | Practice hub summary; problem-page Solved badge |

**Rules:**

1. Visiting `/problems/<slug>` may still call `markVisited` with the
   problem’s composite id (no behaviour change required in
   `lessonIdFromPathname`), but **displayed** Lessons progress **filters
   out** `type: "problem"` ids from both numerator and denominator. That
   prevents the header chip from counting drills as “lessons read.”
2. Visiting a Practice chapter marks that chapter visited (same as any
   concept). Visiting / solving hub problems does **not** auto-complete
   the Practice chapter.
3. Solving a problem marks `solved` only (via existing `onSolved` path).
4. After this ships, `totalCount` passed into `ProgressProvider` is the
   Lessons-sidebar lesson count (concepts + Practice chapters), **not**
   191. Problem markdown files remain in the repo and manifest; they
   simply leave the Lessons progress denominator.

Neighbor prev/next on **concept / practice** pages must walk the same
Lessons-sidebar order (skip individual problems). Problem pages keep
module-scoped problem neighbors via `getProblemNeighbors`.

---

## 6. Practice hub (`/problems`)

Finish the list page described in 2026-07-30, with these requirements
binding:

- Group by module in stage/module order; omit modules with zero problems
- Each row: title + link to `/problems/<slug>` + solved check when
  `solved.has(lessonId(module, slug))`
- Top summary: `{solvedCount} of {totalProblemCount} solved`
- Client-side title filter across all 116 (no server round-trip)
- Empty filter state copy when nothing matches
- Page title / metadata: **Practice** or **Problems** — prefer **Practice**
  to match the nav label; H1 may read “Practice” with a muted subtitle
  “116 problems” if useful
- Visual language: handbook tokens only; solved indicator =
  `bg-good/15 text-good` + `Check` (not `riso-stamp`)

Implementation may follow the planned `ProblemsListClient` shape from
`docs/superpowers/plans/2026-07-30-problems-hub.md` Task 9, adjusted for
the Practice naming above.

Breadcrumbs / back-links on `/problems/[slug]` should treat the hub as
parent (e.g. Practice → module short title → problem), not the old
“Course” crumb. Module short-title crumb may point at
`/course/<module>/practice` (Practice chapter) or `/course/<module>` —
prefer **Practice chapter** when it exists, else module overview.

---

## 7. Practice chapter content

### Goal (option C)

Each Practice chapter teaches **how to approach this module’s drills**
(playbook) and then lists **every problem in the module** with a short
brief and a link into the hub.

### Honest scope (phased authorship)

Writing 21 fully rich playbooks + ~116 briefs in one implementation
pass is a content programme, not a chrome change. v1 ships **complete
infrastructure and usable chapters for every problem-bearing module**,
not a fiction that all briefs are polished on day one.

| Phase | Ships | Content quality |
| --- | --- | --- |
| **v1 (this spec)** | Nav, hub, redirects, search routing, sidebar/module filtering, `type: practice`, all 21 `practice.md` files, renderer that **always** lists every module problem with a hub link | Short authored playbook (or explicit placeholder paragraph) on every module; **one gold-template module** with full per-problem briefs; other modules use auto titles + link, optional brief fields filled when present |
| **Follow-up (tracked)** | Fill remaining modules’ playbooks + briefs to the gold-template standard | Same renderer; no further IA change |

**Recommendation:** do **not** ship stub chapters that only say “TODO.”
Ship real files + auto-list so a learner can open Practice and reach every
problem immediately. Mark incomplete briefs honestly in the follow-up
list, not with fake filler difficulty/pattern text.

**Gold-template module for v1:** `arrays` (first problem-bearing module in
curriculum order — sets the pattern early). If arrays briefs are thinner
than expected at authoring time, `hash-tables` is the alternate.

### File + frontmatter

Path: `course/<module>/practice.md`

```yaml
---
title: Practice
type: practice
---
```

Manifest entry (last in module): `practiceLesson()` helper or
`{ slug: "practice", title: "Practice", type: "practice" }`.

### Authored markdown shape

```markdown
## How to practice this module

<1–3 short paragraphs: patterns this module drills, suggested order,
what “done” means here. Placeholder allowed in v1 outside the gold module.>

## Problems

```practice-problems
# Optional YAML list. When omitted or partial, the renderer fills
# missing entries from the module’s manifest problem list.

- slug: remove-duplicates-sorted
  pattern: Two pointers / write pointer
  difficulty: Easy
  watch_for: Off-by-one on the write index; do not allocate a second array
- slug: move-zeroes
  pattern: Partition pointers
  difficulty: Easy
  watch_for: Stability of non-zero order
```
```

### Renderer behaviour (concrete)

1. Parse an optional `practice-problems` fence (YAML array).  
2. Load the module’s problem list from the manifest (source of truth for
   **which** problems exist and their order).  
3. For each manifest problem, merge authored brief fields by `slug`.  
4. Render a list/card row per problem:
   - Title (from manifest)  
   - Link → `/problems/<slug>`  
   - Optional: pattern, difficulty, watch-for when authored  
   - Solved check from `useProgress().solved` (client island or whole
     page client section — match hub vocabulary)  
5. If the fence is missing entirely, still render the full auto-list
   (title + link + solved only).  
6. If the fence references an unknown slug, fail CI / show an error card
   in dev — do not silently drop manifest problems.  
7. Manifest problems missing from the fence still appear (auto row).

This is the “auto-list + optional authored overlay” model: infrastructure
guarantees completeness; authorship upgrades density.

### What Practice chapters must not do

- Embed full problem statements, sandboxes, or solutions (those live on
  `/problems/<slug>`)
- Duplicate the concept curriculum
- Link to `/course/<module>/<problem-slug>` (always hub URLs)

---

## 8. Routing and redirects

1. **`/course/[module]/[lesson]`**  
   - `type: "problem"` → `permanentRedirect(problemHref(slug))`  
     (use Next’s `permanentRedirect`, not temporary `redirect`)  
   - `type: "concept" | "practice"` → render `LessonView` as today  
   - Stop rendering `ProblemLessonView` / `ProblemWorkspace` on the course
     lesson route

2. **`/course/[module]/practice`**  
   Real statically generated lesson page (included in
   `generateStaticParams` via manifest). Uses `LessonView` plus the
   `practice-problems` fence handling in `Markdown` (or a thin wrapper
   that injects the auto-list when the fence is absent).

3. **`/problems`** — new list page (§6)

4. **`/problems/[slug]`** — unchanged destination; breadcrumbs updated per
   §6

5. **`allLessonParams` / neighbors**  
   - Static params still include problem slugs under the course route
     **only if** those paths must exist to emit redirects; prefer
     generating redirecting pages for old problem course URLs so bookmarks
     keep working.  
   - `getLessonNeighbors` flattens `concept` + `practice` only (available
     modules), so prev/next never lands on a problem course URL.

6. **Content tests**  
   - Every module with ≥1 problem has exactly one `type: practice` lesson
     with slug `practice`, last in the module  
   - No module without problems has a practice lesson  
   - `practice-problems` fence slugs ⊆ that module’s problems  
   - Problem course URLs redirect (browser / route test)

---

## 9. Search

`SearchDialog` today always `router.push(/course/${m}/${s})`. Change:

| Index entry `y` | Destination |
| --- | --- |
| `problem` | `/problems/<slug>` (`s`) |
| `concept` / `practice` / other | `/course/<module>/<slug>` |

`build-search-index.mjs` already stores frontmatter `type` as `y` — once
`practice.md` files exist they index automatically. Optional: show a
small “practice” badge analogous to today’s “problem” badge.

Aria / placeholder copy may say “Search lessons and problems” (not only
lessons).

---

## 10. Module overview (`/course/[module]`)

Primary list:

- Concept lessons (same order)  
- Practice chapter last (if present), labelled Practice / `practice` type  

Do **not** list individual problems as primary rows.

Allowed metadata (pick one in implementation; both are fine):

- A single line under the module description: “N problems in Practice”,
  linking to `/course/<module>/practice` or `/problems` filtered later —
  prefer the Practice chapter link  
- Or a muted count on the Practice row only  

Coming-soon modules unchanged.

---

## 11. Manifest / type system changes (summary)

```ts
export type LessonType = "concept" | "problem" | "practice";
```

- Add `practice(slug, title)` helper (or fixed `practiceLesson()` →
  `{ slug: "practice", title: "Practice", type: "practice" }`)  
- Append to each of the 21 problem-bearing modules  
- `buildCourseNav`, module page, Lessons progress denominator, and
  `getLessonNeighbors` all key off the new type  
- `findProblemBySlug` remains problem-only  
- Header progress uses filtered totals (§5)

---

## 12. Verification

- `/problems` lists 116, search filters, solved summary updates after a
  real sandbox pass  
- Header **Lessons** / **Practice** active states correct on `/course…`
  and `/problems…`; neither active on `/`  
- Sidebar for e.g. `recursion-backtracking` shows concepts + Practice
  only — no Subsets / Permutations rows  
- `/course/recursion-backtracking/subsets` permanently redirects to
  `/problems/subsets`  
- `/course/arrays/practice` renders playbook + all array problems with
  hub links; gold-template briefs visible on arrays  
- Search “two sum” → `/problems/two-sum`; search a concept title →
  `/course/…`  
- Header lessons chip denominator equals concept + practice count (not
  191); solving a problem increments hub solved, not lessons total  
- Concept prev/next skips problems; problem prev/next stays
  module-scoped  
- `tsc`, `eslint`, `npm test`, `npm run build` green; browser-confirmed
  for the behaviours above  

---

## 13. Self-review notes (resolved in this draft)

| Risk | Resolution |
| --- | --- |
| “Every module” vs 3 concept-only modules | Practice chapters only where problems exist (21) |
| Option C vs authorship capacity | Auto-list + overlay; one gold module; tracked fill-in |
| Progress double-counting drills as lessons | Filter Lessons meter; keep solved separate |
| 2026-07-30 sidebar-interleave conflict | Explicitly superseded (§3) |
| Temporary vs permanent redirect | Require `permanentRedirect` |
| New type vs slug hack | `type: "practice"` |

---

## 14. Status

**Approved — implementing.** Implementation plan:
`docs/superpowers/plans/2026-07-31-lessons-practice-split.md`.
