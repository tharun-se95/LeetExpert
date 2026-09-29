# Overview pages on the course hub (#41)

Owner decision, #16 (2026-09-26): an overview is a stage-level page. It gets a card in the course hub's
section for the stage it spans, linking to `/courses/dsa/overviews/<slug>`, which serves the built overview
artifact. This spec covers how that is built and served.

## Context

- Two overviews exist, built by `web/lesson-artifacts/build.py` (`LESSONS`, module `overviews`):
  `linear-structures` "The Line Underneath" (arrays, linked lists, stacks, queues: stage 1) and
  `grid-structures` "The Grid Underneath" (the matrix module: stage 2).
- A built page is one self-contained HTML file (200-300 KB) that loads its faces from `../fonts/` and
  `motion.js` from `../vendor/`; `dist/` is gitignored. The page takes theme and code language from the app
  by `postMessage` and hides its own top bar under `?embed=1` (the embedding contract in
  `lesson-artifacts/README.md`).
- Phase 4 (`lesson-artifacts/app-integration/`) plans to serve lessons as static files under `public/`,
  framed by `LessonArtifactFrame` with that contract. It is parked for the Lesson tab and is not wired in.
- The hub (`app/courses/dsa/page.tsx`) renders one section per stage (`stage-N`, the landing's stage cards
  link there), each a grid of module cards.

## Options for serving the built HTML

1. **Commit the built files into `public/`.** Simple, but 500 KB of generated HTML in git drifts from the
   kit, the tokens and the embedded code with nothing to say so.
2. **Build at prebuild, copy to a gitignored `public/artifacts/`, frame it.** Follows phase 4's plan
   (static files, same-origin iframe, the same contract); the shape `public/pyodide` already has. Costs a
   python3 + tsx step in `prebuild`/`predev`; CI already needs python3.
3. **A route handler that reads the built file and returns it.** Loses the app chrome (header, lessons
   drawer, theme) unless it is reframed anyway, and needs the file at request time.

## Decision

Option 2. `scripts/build-overviews.mjs` (run by `prebuild` and `predev`) asks `build.py --overviews` for the
declared overviews, builds each, copies `overviews/`, `fonts/` and `vendor/` from `dist/` to
`public/artifacts/` (pages keep their relative paths), and writes `src/lib/course/overviews.generated.json`.
That JSON is committed like `sandboxIds.generated.json`; a test fails when it drifts from `build.py`.

- **One declaration.** `build.py` `LESSONS` entries for overviews gain two fields after the title: the
  `STAGES` number the overview spans, and a one-line card summary. `build.py --overviews` prints them as
  JSON; the ledger keeps reading the first four fields. A missing field fails the build.
- **The route** `app/courses/dsa/overviews/[slug]/page.tsx` is a server component with
  `generateStaticParams` over the overviews and `dynamicParams = false`; it imports no session or request
  API. It renders breadcrumbs (Lessons > Stage N > title), an `sr-only` h1 and the built page in
  `components/course/ArtifactFrame.tsx` (the parked frame's contract: theme and code-language posts, hidden
  until the first post). `AppShell` holds the viewport on this route (`isOverviewPath`), as for the concept
  map, so the artifact scrolls itself and there is no second page scrollbar. The static segment
  `overviews` wins over `[module]`, and no module is named that.
- **The card** sits in its stage's section as the last item of the module grid, full width: kicker "Stage
  overview", title (Space Mono, `font-bold`), summary, "Open overview". `familyCssVars(family)` is on the
  card itself, so the family colours its dot only; shadow is `.shadow-elevation`, colour is tokens.
- The sitemap lists the overview routes.
- Phase 4 should reuse `ArtifactFrame` for the Lesson tab instead of restoring `LessonArtifactFrame`.

## Ledger

The `app` gate has no documented, runnable procedure for an overview yet (`ledger.py record ... app` refuses
overviews and lessons alike, and the browser gate is defined for `dist/` pages). It is not recorded here.
Editing `build.py` stales every page's evidence (it is in the ledger's `SHARED` hash); that is by design and
CI's `gate` run re-checks what it lists.

## Verification

- `tests/overviewPages.test.tsx`: the committed JSON equals `build.py --overviews`; the ledger's overviews
  table equals the declarations; every overview has a card in its own stage's section (and no other); each
  card href is a static param; the route frames `public/artifacts/overviews/<slug>.html`, which exists, has
  the overview's title and finds its `../fonts` and `../vendor` files; the sitemap lists it. Each was broken
  once and seen to fail.
- `tsc`, `eslint`, `vitest run`, `next build`: the route table must show `/courses/dsa/overviews/[slug]` as
  SSG with both slugs, and no lesson route may change from static.
- Browser check by the owner: hub `#stage-1` and `#stage-2`, both overview pages, light and dark, the code
  language switch inside the frame.

## Risks

- `prebuild` now needs `python3` on the deploy image. A missing python3 fails the build loudly rather than
  shipping a hub card to a 404.
