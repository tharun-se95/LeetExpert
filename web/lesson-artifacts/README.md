# Lesson artifacts

> **Parked (2026-09-21).** The pages are saved here but **not wired into the app**: no Lesson tab,
> nothing under `public/`. Pages build to `dist/`. To put them back, see "Re-enabling" below.

Interactive lesson pages that the problem workspace can show in a **Lesson** tab, beside the
sandbox. Each is one self-contained HTML file built into `dist/<module>/<lesson>.html`.

```bash
python3 web/lesson-artifacts/build.py                        # rebuild every page
python3 web/lesson-artifacts/build.py coin-change            # rebuild one
# tests live in app-integration/tests until re-enabled (see below)
```

## Layout

- `build.py`: assembles a page from a lesson folder plus the kit. `LESSONS` at its foot lists them.
- `shared.py`: the page CSS, the icon sprite and the colour tokens. The tokens come from
  `hyperframes/assets/brand.css` (generated from `globals.css` and `familyTheme.ts`), so a page wears
  the app's light and dark themes and its family colour. Rebuild after they change.
- `kit/`: everything that is not about one topic.
  - `engine.js`: palette, animation clock and the scene player (grid boards and node-link boards,
    directed arrows with `tree.directed`).
  - `trees.js`: binary-tree layout helpers.
  - `kit.js`: reveals, code blocks, quiz, predict widget, stepper, cost chart, letter strip, graph view,
    banners, contents rail, language switch, theme repaint and the embedding contract.
  - `kit.css`: layout, widgets and the scaled-down type scale.
- `<lesson>/`: `body.html` (the page), `lesson.js` (its own widgets and checks), optional `extra.css`,
  and `code/<name>.py` + `code/<name>.ts`, the code the page shows. There is one copy: the page reads it
  as `CODE.<name>.py` / `.ts`.

## How a lesson is tested

A page's animation frames are replayed from executed traces and compared with an independent reference
(brute force, breadth-first search, a different algorithm) while the page loads, and the page throws when
they disagree. Then:

- `lessonArtifacts.test.ts` loads every page in jsdom: no errors, every part mounted, the solution absent
  from the DOM until revealed, a quiz answer marks one right option.
- `lessonArtifactSolutions.test.ts` runs the code the page shows against the lesson's own sandbox cases
  in real Python and JavaScript (the harness `reference.test.ts` uses), and requires the built page to
  embed exactly those files. Code files are classified by name: `solution*`, `naive*`, `alt*` must pass every
  case; `slow*` (correct but exponential) must pass the first five; `mistake*` must fail at least one, so a
  "Watch out" is only ever printed if it is true.

## Gates and the ledger

Rollout spec: `docs/superpowers/specs/2026-09-24-lesson-artifacts-rollout-design.md`. Every lesson in the app
has a row in `ledger.json` (view: `LEDGER.md`), and a lesson's status comes only from gate evidence:

```bash
python3 web/lesson-artifacts/ledger.py record <module/slug> build|code|light|dark
python3 web/lesson-artifacts/ledger.py check      # also run in CI (tests/lessonArtifactsLedger.test.ts)
python3 web/lesson-artifacts/ledger.py render     # rewrite LEDGER.md
```

- `code` runs `code-gate.ts` for a problem lesson (the shown code against the lesson's sandbox cases, both
  runtimes, held to its file names, and the built page must embed exactly those files) and the lesson's own
  `check.py` for a concept lesson.
- `light` / `dark` run `browser-gate.mjs` (real Chrome, 1366 and 375 px): console and page errors, layout
  shift (floor 0.001), sideways scroll, AA contrast against what is painted, accessible names, reveals hidden,
  and a still page under reduced motion. Screenshots land in `dist/_gate/`.
- Evidence is tied to a hash of the lesson's folder, so editing a lesson makes it stale.

## Optional kit modules

`kit/lists.js` + `kit/lists.css` (the linked list model and `ListPlayer`) ship only in lessons whose
`lesson.js` names them (`KIT_OPTIONAL` in `build.py`). Every kit file and the lesson share one scope, so
module functions carry a prefix (`listRun`, `listLayout`): an unprefixed `run` in a lesson once replaced
`engine.js`'s.

## Fonts

The page stays invisible until its three faces load (capped at 2.5 s) so a late font never re-wraps visible
text; without JavaScript nothing is hidden. The kinetic headline is split into words at build time.

## Embedding contract

The frame loads `?embed=1`, which hides the page's own top bar and rail. The page cannot see the app's
`.dark` class or code-language store, so `LessonArtifactFrame` posts `{source: "leetexpert", theme, code}`
(same origin only) on load and on every change. The frame stays hidden until the first post so a
light-mode learner never sees the OS theme flash.

## Adding a lesson

1. Copy a lesson folder that resembles it, write `body.html`, `lesson.js` and the `code/` files.
2. Add it to `LESSONS` in `build.py` (family colour ids are in `familyTheme.ts`) and to `LESSON_ARTIFACTS`.
3. Build and run the two test files. Plant a fault in a solution and see it fail before trusting them.

## Status

Five lessons, a prototype: four problem lessons and one concept lesson, `build-a-linked-list`. No sandbox
of its own (the workspace's editor is beside it), no progress hook, and the page's colours are copied in at
build time. The Diameter lesson still carries its own tree painter and predict widget beside the kit's.

- **Code colour** comes from the app's own Shiki setup: `build.py` runs `highlight.ts` (through
  `web/node_modules/.bin/tsx`, from `web/`) over every code file and embeds the result as `HL`, beside the
  raw `CODE` strings the tests compare. The build fails if any file comes back uncoloured.
- **Concept lessons** have no sandbox cases, so `build-a-linked-list/check.py` holds its shown code to the
  same standard: `code/solution.{py,ts}` must match a plain list on 403 random operation sequences with the
  list's invariants intact, and `code/mistake.*` must lose data in both runtimes. It is not in CI while the
  pages are parked; run it after changing that lesson's code.

## Re-enabling

`app-integration/` holds everything that was removed from the app:

1. `cp -r dist/* ../public/lessons/` (create the folder) so the pages are served at `/lessons/...`.
2. Copy `app-integration/src/LessonArtifactFrame.tsx` to `src/components/problems/` and
   `app-integration/src/lessonArtifacts.ts` to `src/lib/course/`.
3. `git apply lesson-artifacts/app-integration/ProblemWorkspace.patch` (adds the Lesson tab; it was made
   against the tree of 2026-09-21, so it may need a manual merge).
4. Copy `app-integration/tests/*.test.ts.parked` to `tests/` (dropping `.parked`, which only keeps vitest from running them here)
   and `jsdom.d.ts` to `tests/helpers/`. They read the built pages from `public/lessons`.

Kept in the app because they are useful on their own: `tests/helpers/sandboxCases.ts` (shared by
`reference.test.ts`), and the `lesson-artifacts` excludes in `tsconfig.json` and `eslint.config.mjs`.
