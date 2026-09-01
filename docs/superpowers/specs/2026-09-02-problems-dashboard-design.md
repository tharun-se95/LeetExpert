# Problems dashboard — design

Mockup reference: https://claude.ai/code/artifact/ea1fc6e9-8c39-4d71-b131-e862524876e9
(three artboards — Desktop, Mobile, Mobile filter sheet — built from the app's
real Blueprint dark tokens and real module/problem data, approved by the user)

## Problem

`/problems` currently renders 21 stacked, individually-bordered module
sections (`ProblemsListClient.tsx`), each a mini accordion of its own
problems. The only filter is difficulty. Finding a specific problem across
modules means scrolling past everything else; there's no way to say "just
show me what I haven't solved yet" or "just Two Pointers and Sliding Window."

This spec turns it into one flat, filterable list — Status (Solved/Unsolved),
Difficulty (existing), and Topic/Module (multi-select) — matching the filter
set settled in brainstorming and the layout approved in the design mockup.

## Scope

**In scope:** the flat list, the three filters, the desktop sidebar, the
mobile filter sheet, search (existing, kept).

**Explicitly out of scope** — the mockup's canvas note marks these
"good-to-have, not required for v1," and they stay deferred here:
- "Continue where you left off" card
- Easy/Medium/Hard breakdown strip
- Sort control and flat/grouped view toggle

None of the deferred items are referenced by anything in scope, so leaving
them out doesn't create a half-built feature — the flat list and its three
filters are a complete, shippable unit on their own.

## Data flow

No server-side change. `src/app/problems/page.tsx` still calls
`groupedProblems()` and passes `groups: ProblemGroup[]` to
`ProblemsListClient` unchanged — `ProblemGroup` already carries everything
needed (`module.stage`, `module.number`, `module.shortTitle`, and each
problem's `slug`/`title`); difficulty comes from the existing
`getProblemDifficulty(slug)`, and family/accent colour from the existing
`moduleFamily(module)` + `getFamilyTheme(id)`.

The client flattens `groups` into one ordered list on mount (module order,
then in-module order — the same order the page already uses, so "jump to
anything, work it in order" still holds for the default unfiltered view).
Filtering — search, difficulty, status, topic — runs client-side over that
flat list, the same as today's search+difficulty filtering already does.

## New files

- **`src/lib/course/problemsFilters.ts`** — pure, testable logic. A
  `FlatProblem` type (slug, title, difficulty, moduleSlug, moduleLabel,
  moduleNumber, familyId), `flattenProblems(groups)`, and
  `filterProblems(flat, { query, difficulty, status, topics, solved })`.
  Kept out of the component specifically so it can be unit tested directly
  (`tests/problemsFilters.test.ts`) rather than only through rendered
  output — this is the piece most likely to grow a wrong-boundary bug
  (an off-by-one in "which modules count as unsolved," a status/topic
  interaction) and pure functions are what CLAUDE.md's "correctness is
  verified, never assumed" rule is asking for here.
- **`src/components/problems/ProblemFilterPanel.tsx`** — the filter
  controls themselves (Status segmented control, Difficulty chips —
  reusing the existing `difficultyFilterChipClass`, unchanged — and a
  Topics checkbox list: family-colour dot, module label, count, a mini
  solved/total progress bar). Pure props in (`value`, `onChange` per
  filter) and callbacks out — no knowledge of whether it's rendered in
  the desktop sidebar or the mobile sheet, so it renders in both without
  duplication. The Topics list is the one section long enough to need a
  capped, scrollable height (21 modules) — same `max-height` +
  `overflow-y-auto` + bottom mask-image fade `TableOfContents.tsx`
  already uses (`EDGE_FADE_MASK`), not a new scroll treatment. A "Clear
  filters" link sits under the Topics list, visible only when at least
  one filter differs from its default — matching how the page's existing
  no-matches empty state already gates its own "Clear filters" button.
- **`src/components/problems/ProblemFilterSheet.tsx`** — the mobile
  bottom sheet wrapping `ProblemFilterPanel`. Reuses the *mechanism*
  `MobileLessonsSheet.tsx` already established (scrim, body-scroll lock,
  Tab focus trap, Escape closes, focus returns to the trigger on close) —
  but slides up from the bottom with rounded top corners, not in from the
  left, because this is a bottom sheet, not a drawer. The mockup's
  annotation calling it "the same pattern" meant the interaction
  mechanics, not the slide axis; noting that precisely here so the
  implementer doesn't copy the wrong transform.
- **`src/components/problems/ProblemsFlatList.tsx`** — the dense row
  list: a status circle (filled + check if solved, outline if not), title,
  a small module-tag pill (family dot + module label), the existing
  difficulty badge, hover arrow. Also owns the existing no-matches empty
  state, with its copy extended to name whichever filters are active
  (today it only ever mentions query + difficulty).

## Modified file

- **`src/components/problems/ProblemsListClient.tsx`** — becomes the
  orchestrator: owns `query`, `difficultyFilter` (existing), new
  `statusFilter` (`"All" | "Solved" | "Unsolved"`), new `topicFilter`
  (`Set<string>` of module slugs — empty set means "no topic
  restriction," not "match nothing"), and `mobileFiltersOpen`. Computes
  the flat, filtered list via the new lib functions. Renders the existing
  header, stat cards, and search bar unchanged; below that, a responsive
  two-column area — `ProblemFilterPanel` in a persistent `lg:block`
  sidebar, `ProblemsFlatList` as the main content, and (below `lg`) a
  "Filters" trigger button carrying an active-filter-count badge that
  opens `ProblemFilterSheet`. `clearFilters` extends to reset all four
  filter dimensions, not just query + difficulty.

Module section grouping, per-module progress bars, and the module-level
"Playbook" links are removed from the main list (they were the accordion
this replaces) — the same per-module solved/total data now lives in the
Topics sidebar instead, doing real work as filter UI rather than as a
section header.

## Filter semantics

- **Status**: `All` (default) / `Solved` / `Unsolved`. Solved is computed
  the same way the page already computes it — `solved.has(lessonId(module.
  slug, problem.slug))` from `useProgress()`.
- **Difficulty**: unchanged from today — `All` / `Easy` / `Medium` / `Hard`,
  single-select.
- **Topic**: multi-select by module slug. Empty selection = every module
  eligible (not "show nothing," which is what an empty-Set intersection
  would naively do — `filterProblems` treats an empty `topics` set as
  "unrestricted" explicitly, and this needs its own test case).
- All three combine with **AND** logic alongside the existing search query
  (a problem must match query AND difficulty AND status AND — if any
  topics are checked — be in one of them).

## Accessibility

- Desktop sidebar: a labelled `<fieldset>`-equivalent per filter group
  (`role="group"` + `aria-label`, matching the existing difficulty filter's
  own pattern), topic checkboxes are real `<input type="checkbox">` inside
  `<label>`, not `role="checkbox"` divs.
- Mobile sheet: `role="dialog"` `aria-modal="true"`, focus moves to the
  sheet on open and returns to the trigger button on close (identical
  contract to `MobileLessonsSheet`), Escape closes it.
- The "Filters" trigger's badge count is exposed via its accessible name
  (`aria-label="Open filters, N active"`), not colour/shape alone.

## Testing

- `tests/problemsFilters.test.ts` (new): `flattenProblems` preserves module
  and in-module order; `filterProblems` covers each filter alone, all four
  combined, the empty-topics-means-unrestricted case, and the
  no-matches-at-all case.
- Existing `web/tests/` suite must stay green — nothing in `manifest.ts`,
  `problemDifficulty.ts`, or the page/server layer changes.
- Browser verification: search, each filter alone and combined, clear
  filters, empty state, the mobile sheet's open/close/focus-return, both
  themes, and confirming solved counts in the Topics sidebar match the
  Status filter's own Solved count for the same module (the two are
  computed from the same `solved` Set but by different code paths, so
  they can drift if one is wrong — worth a direct check, not just visual
  inspection).
