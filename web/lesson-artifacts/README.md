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
- `<lesson>/`: `lesson.md` (the page's content), `lesson.js` (its own widgets, animation, checks and
  `FACTS`), optional `extra.css`, and `code/<name>.py` + `code/<name>.ts`, the code the page shows.
  There is one copy: the page reads it as `CODE.<name>.py` / `.ts`. The overview still has a
  hand-written `body.html`, which `build.py` uses when a folder has no `lesson.md`.
- `lessonMd.ts` / `render-lesson.ts`: parse `lesson.md` with the app's own gray-matter + remark and
  enforce the dialect's rules; `build.py` runs the CLI through `tsx`, as it runs `highlight.ts`.
- `dom-compare.mjs`: the migration proof. It compares two builds' DOM after the scripts ran.

## Writing lesson.md

Spec: `docs/superpowers/specs/2026-09-26-lesson-content-as-data-design.md`. The dialect is the course's:
YAML front matter (`title`, `kicker`, `headline`, `lede`, `chips`, `hero`) and fenced directives.
`## Heading {#id toc="Short" banner}` opens a section, and the contents rail is built from them.

- The course's own fences keep their course meaning: `examples` (`input → output  (note)`),
  `constraint`/`key`/`warn` callouts, and `quiz` (the course's JSON:
  `question`/`options`/`answer`/`explanation`).
- Artifact fences: `rosetta "label"`, `widget #id "Label"`, `mount #id [classes]`,
  `code <file> "title"`, `notes`, `derivation`, `duo` (markdown, `---`, then the scene),
  `variants` (JSON `title`/`source`/`text`), `reveal #id "Button label"` and `html` (counted).
- A reveal is data, not DOM: its text reaches the page only when it is opened. A fence that holds
  fences takes more backticks than the fences inside it.
- A number the prose shows is written `{{name}}` and computed in `lesson.js` as `FACTS.name`.
- The build refuses what the rules forbid: adjacent callouts, a quiz without 3-5 options, an answer
  or explanation missing, half of a `c-py`/`c-ts` pair, duplicate ids, and raw HTML outside `html`.
  `brain`, `tip`, `goal` and `aside` have no artifact styling yet, so they are refused too.

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
python3 web/lesson-artifacts/ledger.py gated      # the pages CI gates, as JSON
python3 web/lesson-artifacts/ledger.py gate <module/slug>   # run a page's gates, recording nothing
```

CI (`.github/workflows/ci.yml`, "Artifact gates") runs `gate` on every page `gated` lists: each row that
holds evidence for every verified gate, fresh or stale, and every specimen. A kit change stales every
page, and CI is where you learn whether it also broke one. Recording evidence stays a local step, since
it writes the ledger.

- `code` runs `code-gate.ts` for a problem lesson (the shown code against the lesson's sandbox cases, both
  runtimes, held to its file names, and the built page must embed exactly those files) and the lesson's own
  `check.py` for a concept lesson.
- `light` / `dark` run `browser-gate.mjs` (real Chrome, 1366 and 375 px): console and page errors, layout
  shift (floor 0.001), sideways scroll, AA contrast against what is painted, accessible names, reveals hidden,
  and a still page under reduced motion. It then drives every widget and asserts where each lands (#24):
  reveals open with content and close empty; a quiz or predict answer locks the options, marks one right
  and gives matching feedback; a step player's counter and current step follow each click; a walkthrough's
  next and speed work; tabs press; every other widget button is clicked once with no error. Hovered and
  answered states are measured for contrast too. Screenshots land in `dist/_gate/`.
- Evidence is tied to a hash of the lesson's folder, so editing a lesson makes it stale.

## Optional kit modules

Structure players ship only in lessons whose `lesson.js` names them (`KIT_OPTIONAL` in `build.py`), each
with what it needs before it (`KIT_DEPS`):

- `kit/player.js` + `player.css`: `StepPlayer`, the chrome and clock every structure player shares (stage,
  fields and invariants line, caption, step track; soft motion, loop while on screen, still under reduced
  motion). A player is a view object it runs; the contract is at the top of the file.
  `mountPlayerTabs` gives any player tabbed walkthroughs.
- `kit/lists.js` + `lists.css`: the linked list model and `ListPlayer` (`mountTabs` for its tabs).
- `kit/lanes.js` + `lanes.css`: the lane model (`new Lanes(...)`) and `LanePlayer` (`mountLaneTabs`).
  One model for every linear shape: arrays and strings (a row; `idx` labels its slots), stacks (a
  column, top up), queues and deques (a row, front left), fixed rows written by slot (a ring buffer's
  array, an answer, a count per letter named by `keys`), and call frames (items with a second line of
  locals, changed in place with `set`). An item keeps its identity as it moves, so `move` between lanes,
  `swap`, `insert` and `remove` glide; `copy` makes a new item that enters from the slot it was read
  from; `mark` places a named index (`i`, `l`, `head`); `span` names a range over a row (a window, the
  sorted part); `tone` is `cur`, `good`, `bad` or `dim`; `snap` records a step. Spec:
  `docs/superpowers/specs/2026-09-27-array-string-player-design.md`.

- `kit/calltrees.js`: recursion and backtracking call trees, built on the graph lane
  (`graphs.js`, extended with `gap`, `words` and `plain`) and an ordinary stack lane, with no lane kind of its
  own. Run the algorithm into a `CallTrace` (`call`, `base`, `ret`, `prune`), then `callTreeWalk(trace, o)`
  records the steps: every node's position is fixed from the finished tree, a call fills its slot and links
  its edge when it is made, and the frames on the stack lane are the path from the root. A call is `active`,
  `returned`, `base` or `pruned`; the state after k events is a pure function of them (`callTreeState`) and
  every recorded step is checked against it on load. `mountCallTreeTabs` adds the state key. Spec:
  `docs/superpowers/specs/2026-09-29-call-tree-player-design.md`.

- `kit/intervals.js` + `intervals.css`: intervals on a number line. An `intervals` lane kind on `lanes.js`'s seam: each
  item is a bar (`bar(id, lo, hi)`, `reach(item, lo, hi)`) whose row is its slot and whose position and width are its
  extent on one shared axis; `mark` is a named coordinate (the sweep line, a burst arrow) and `span` a named range
  (a gap, free time). Record the algorithm into an `IvTrace` (`sort`, `state`, `reach`, `merge`, `add`, `remove`,
  `mark`, `band`, `count`; states named by the walkthrough, each drawn by its own tone), then `ivWalk(trace, o)`
  records the steps; the state after k steps is a pure function of them (`ivState`) and every recorded step is
  read back (`ivRead`) and checked on load. `mountIvTabs` adds the state key. Spec:
  `docs/superpowers/specs/2026-09-29-intervals-player-design.md`.

`kit-players/` is a specimen, not a lesson: `build.py` declares it under `specimens` and the ledger does
not count it. It runs `LanePlayer` through every shape, so the browser gate holds a new player to the
lesson bar before a lesson depends on it: `node lesson-artifacts/browser-gate.mjs specimens/kit-players dark`.

Every kit file and the lesson share one scope, so module functions carry a prefix (`listRun`,
`listLayout`, `laneHi`): an unprefixed `run` in a lesson once replaced `engine.js`'s.

## Fonts

The page stays invisible until its three faces load (capped at 2.5 s) so a late font never re-wraps visible
text; without JavaScript nothing is hidden. The kinetic headline is split into words at build time.

## Embedding contract

The frame loads `?embed=1`, which hides the page's own top bar and rail. The page cannot see the app's
`.dark` class or code-language store, so `LessonArtifactFrame` posts `{source: "leetexpert", theme, code}`
(same origin only) on load and on every change. The frame stays hidden until the first post so a
light-mode learner never sees the OS theme flash.

## Adding a lesson

1. Copy a lesson folder that resembles it, write `lesson.md`, `lesson.js` and the `code/` files.
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
