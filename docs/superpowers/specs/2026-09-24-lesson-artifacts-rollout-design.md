# Lesson artifacts for every lesson: rollout design

Status: approved with decisions D1 to D5 (section 9) · 2026-09-24

## 1. Goal

Every lesson in the app gets an interactive lesson artifact of the kind built in
`web/lesson-artifacts/` (PR #10), working in **both light and dark mode**. The course has
**220 lessons** in 24 modules, all `available`: 116 problem, 83 concept, 21 practice
(counted from the app's manifest by `lesson-artifacts/manifest-dump.ts`, not by hand).

There are no permitted exclusions. A lesson whose idea the kit cannot show yet is a reason to
extend the kit (CLAUDE.md §1), recorded in the ledger's notes until it is done.

State at the start: 5 lessons built (4 problem, 1 concept), none verified, none shipped.
The pages are parked: they build to `dist/` and are not served by the app.

## 2. What an artifact is

One self-contained page per lesson, built from the shared kit, that explains the lesson's idea
through a real-world systems analogy, live visuals and motion, and code the learner can read in
Python or TypeScript. The shape proven so far:

- **Problem lessons:** problem, attempt it first (predict widget), the trap(s) with measured cost,
  the insight, a stepped walkthrough, the solution behind a reveal, variants, quiz.
- **Concept lessons:** the idea, a live model of it (the linked-list builder is the reference),
  the operations walked step by step, the classic mistake executed, what it costs, where next, quiz.
- **Practice lessons:** see decision D2 (section 9).

The artifact does not replace the sandbox: on a problem page the editor stays beside it.

## 3. Definition of done (per lesson)

A lesson is **verified** only when every gate below holds evidence recorded against its current
source (section 6). Nothing is marked done by hand.

| Gate | What it proves | How |
|---|---|---|
| `build` | the page builds from the kit | `build.py <slug>` exits 0; code is coloured by the app's Shiki (build fails otherwise) |
| `code` | every piece of code on the page is true | problem: the shown `solution*`/`naive*`/`alt*` pass every sandbox case in Python and JavaScript, `slow*` the first five, `deep*` every case except by Python's `RecursionError`, which it must hit at least once (added 2026-10-02 for #26, when #157's ceiling cases reached the stack limit), `mistake*` fails at least one; concept: a `check.py` model check (as in `build-a-linked-list`), in both runtimes |
| `light` | the page works in the light theme | browser gate, section 4.2 |
| `dark` | the page works in the dark theme | browser gate, section 4.2 |
| `app` | the app serves it (shipped) | the Lesson tab shows it; phase 4 |

Content bars that the gates cannot prove are checked in review and recorded in the ledger's
notes: explanations derive their conclusions, the analogy is accurate (not decorative), quiz
distractors are plausible (the kit already throws on answer-length and slot patterns), callouts
follow the callout rules, and solutions never reach the DOM before the reveal.

## 4. Verification

### 4.1 Code gate

- **Problem lessons** reuse the course's sandbox cases and the same runners `reference.test.ts`
  uses (`tests/referenceRunner.ts`), so a page is held to exactly the cases the sandbox grades.
  The parked `lessonArtifactSolutions.test.ts.parked` already does this for the first four; phase 1
  turns it into a per-lesson `check.py` entry (or a shared runner the ledger calls) so the gate
  runs without the Lesson tab.
- **Concept lessons** have no sandbox cases. Each gets a `check.py` that runs its shown code in
  Python and TypeScript (TypeScript via the repo's esbuild) against an independent model, on random
  inputs plus the lesson's own scripted cases, and proves every `mistake*` fails.
- Every new check is proven able to fail (a planted fault, seen failing, restored) before its
  first evidence is recorded (CLAUDE.md §2).

### 4.2 Browser gate (to build in phase 1)

`lesson-artifacts/browser-gate.mjs <id> <light|dark>` loads the built page in a real browser
(`playwright-core` with the installed Chrome, as `e2e/sync.e2e.mjs` does) with the theme forced, at **1366 × 900 and 375 × 812**, and fails on:

- any console error or page error (this also runs the page's own load checks: frame replays,
  quiz rules, model self-checks, which throw on disagreement);
- a cumulative layout shift above 0 while every player and banner plays one full cycle;
- horizontal page overflow at either width;
- any text below WCAG AA contrast against the surface it renders on (computed colours on the
  rendered DOM, including SVG text on navy cards), on every step of every step player (`kit/player.js`),
  each tab, settled — until #22 the gate sampled a player once, on its first step, which is mostly the empty
  structure, so no later step's text had ever been measured — and mid-animation included: a scene cell between two
  states is a blend of their fills, and its ink is never blended but chosen by `legible()` in
  `kit/engine.js` (the endpoint ink that reads better, else one pushed toward whichever of black and
  white contrasts more with that blend, only as far as 4.5:1). A text element's own `opacity` thins
  its ink and is measured; only a fading ancestor (mid-animation) is exempt. Until #22's grid player
  the element itself was exempted too, and a planted 45% rectangle name passed. Text inside a disabled
  control is exempt, as WCAG 1.4.3 exempts inactive components;
- missing accessible names on interactive controls and diagrams;
- a solution in the DOM before its reveal is opened;
- text on a solid family fill: the family colours are mid-tone 3:1 UI fills, and no ink reaches AA on
  most of them, so an accent cell's fill is chosen per family at build time (`accent_cell` in
  `shared.py`): solid where its own ink clears 4.5:1, else a tint with the normal ink;
- with `prefers-reduced-motion: reduce`: any banner or hero not on its finished frame, or any
  autoplay.

It writes a screenshot per theme and width to `dist/_gate/` for the reviewer and returns one
result line, which `ledger.py record` stores as evidence.

### 4.3 CI

- `tests/lessonArtifactsLedger.test.ts` runs `ledger.py check` in CI today: the ledger must list
  every lesson in the app exactly once, with known gates only, and every artifact folder built.
- Phase 1 adds the gates themselves to CI for lessons marked verified, so a kit change that
  breaks a verified lesson fails the build rather than silently staling its evidence.

## 5. Architecture changes before scaling (phase 1)

Each existing page is largely hand-written HTML and JavaScript; at that cost 220 pages would not
hold the bar. Before any batch:

1. **Content as data.** A lesson folder holds a data file (sections, prose, callouts, examples,
   quiz, variants, which code files appear where) that the kit renders; the lesson's own
   JavaScript shrinks to its topic-specific animation. Quiz, callouts and code blocks come from
   the kit, so their rules are enforced in one place.
2. **Shared players in `kit/`.** The linked-list `ListPlayer` (fixed canvas, soft motion, loop,
   invariants panel) moves into the kit, and the same contract is built for arrays/strings,
   grids, trees, graphs, stacks/queues, heaps and tables, so a module's lessons reuse one player.
   The contract is `StepPlayer` in `kit/player.js` (#22): the chrome and clock, with a view per
   structure. `ListPlayer` and `LanePlayer` (`kit/lanes.js`: arrays and strings with named indices
   and ranges, stacks, queues, deques, ring buffers, call frames, several lanes at once) are views on it; the `kit-players` specimen holds each new
   player to the browser gate before a lesson depends on it.
3. **Family colour for every module.** `big-o`, `getting-started` and `math-for-dsa` have no
   family in `moduleFamily`; the kit needs one to paint. Decision D4: new family hues, designed in the app.
4. **Dark mode settled.** The dark theme is The Grid Underneath's palette, with a navy code well
   (decision D6, which replaced D5). The browser gate checks every page in both themes; each
   verified lesson's ledger evidence holds a passing dark run.
5. **Fonts without layout shift.** A font arriving after first paint re-wrapped the hero and moved
   the page (measured by the browser gate, with `swap` and with `optional` alike). The three faces are
   self-hosted in `lesson-artifacts/fonts/` (OFL, latin and latin-ext) and the latin files preloaded.
   The page stays invisible until every weight it uses has loaded **and** the page script has built
   its scenes (`window.__built`, called after `wirePage()`), capped at 2.5 s, so no visible text
   re-wraps; without JavaScript nothing is hidden. Waiting on fonts alone was not enough: once they
   were local they arrived in ~20 ms, the page was revealed ~200-300 ms before `motion.js` came from
   the CDN and the script drew the hero, and the hero pushed the text down (measured 2026-09-25: CLS
   0.29 at 1366 px and 0.41 at 375 px on the linear-structures overview, 0.03-0.04 on lessons; after the fix, 0.0003 at most). The browser
   gate serves `dist/` over its own local HTTP server, as a page is really served; over `file://` the
   fonts were slow enough to hide that race. The gate's layout-shift floor is 0.001: Chrome reports sub-pixel text
   re-layout whose rectangles do not move as tiny shifts, and the exact value is stored as evidence. When the pages are served by the app
   (phase 4) they use the app's self-hosted `next/font` files instead. The kinetic headline is split
   into words at build time for the same reason.

## 6. The ledger

`web/lesson-artifacts/ledger.json` is the record of the rollout; `LEDGER.md` beside it is a
generated view. Tool: `web/lesson-artifacts/ledger.py`.

- **Rows come from the app.** `ledger.py sync` builds one row per lesson from the app's manifest
  (id `module/slug`, module, type, title, family), in course order, and retires rows for lessons
  the app no longer has. `check` fails if the two ever disagree, and CI runs `check`.
- **Status is derived, never set.** Stages are `todo → built → verified → shipped`. A row's status
  is the furthest stage whose gates (section 3) all hold evidence. Evidence is written only by
  `ledger.py record <id> <gate>`, which runs the gate and stores its result line, the date, the
  commit, and a hash of the lesson's files.
- **Evidence goes stale.** When a lesson's files change, the stored hash no longer matches and
  the lesson falls back to the last stage whose evidence is still fresh. `LEDGER.md` marks stale
  gates. (Proven: an added line dropped `build-a-linked-list` from built to todo; removing it
  restored built.)
- **Overviews have their own table.** A page across several modules (`overviews/linear-structures`,
  "The Line Underneath", and `overviews/grid-structures`, "The Grid Underneath", rebuilt on the kit
  from its standalone original in #25) is not a lesson in the app's manifest, so its row is declared by `build.py`
  (`LESSONS` entries under `overviews`), not by `sync` from the manifest; `sync` keeps the two in
  step and `check` fails when they differ. An overview passes the same `build`, `code` (its
  `check.py`) and theme gates and goes stale the same way, but is not counted in the 220 and holds
  no `app` gate until it is decided where an overview lives in the app (open, owner).
- **Notes** carry what the gates cannot prove (section 3) and any kit extension a lesson waits on.
- **End condition.** The ledger is rollout scaffolding (CLAUDE.md §1). When all 220 lessons are
  `shipped`, the evidence tracking is retired: `ledger.json` is reduced to the registry the app
  reads (the successor of `app-integration/src/lessonArtifacts.ts`), `LEDGER.md` and the stage
  machinery are deleted, and the CI gates stay.

## 7. Phases

| Phase | Scope | Exit |
|---|---|---|
| 0 (this spec) | spec, ledger, CI ledger check | done 2026-09-24 (PR #10); decisions D1 to D5 taken |
| 1 foundations | content-as-data kit; `ListPlayer` and new players into `kit/`; browser gate; problem code gate without the Lesson tab; D4 and D5 applied; the 5 existing lessons migrated to data and **verified** | 5 verified in the ledger, gates in CI |
| 2 pilot module | Linked Lists complete (9 lessons: 3 concept, 5 problem, 1 practice) | 9 verified; time per lesson measured, which sets the batch plan |
| 3 batches | module by module in course order, one module per fresh chat; review per module | all 220 verified |
| 4 app | Lesson tab re-enabled (per D3), `app` gate recorded | all 220 shipped |

No schedule is promised here: phase 2 measures the real cost per lesson, and the batch plan is
set from that measurement, not guessed.

## 8. Risks

- **Throughput versus the bar.** 220 lessons invite shortcuts. The gates and the ledger exist so a
  batch cannot be called done without evidence; a lesson that cannot pass waits, with a note.
- **Forced analogies.** Some ideas have no honest systems analogy (proof-heavy maths). The rule is
  selectivity (owner feedback on analogies): a full analogy only where it is true and helps.
- **Page weight.** Pages are 130 to 180 KB each (mostly inline code colouring). They load one per
  lesson, not all at once; the browser gate can budget it if it grows.
- **Kit changes stale everything.** Evidence is fingerprinted on the lesson's folder *and* the shared
  kit and build files (`SHARED` in `ledger.py`), so any kit change makes every lesson's evidence stale
  and it must be re-recorded. This is deliberate: a kit change can never leave a lesson "verified" on
  a page nobody re-checked. Re-recording all lessons after a kit change is the cost, and it grows
  with the rollout; batching kit changes keeps it bounded.
- **What the browser gate drives, and what it cannot assert.** It plays what runs by itself, then
  (#24) drives every widget kind the kit makes and asserts the state each interaction lands in:
  reveals, quiz and predict answers (including the hovered option), step players, walkthroughs and
  tabs, with every answered state measured for contrast. Its first run found the quiz letter's hover
  colour at 4.11:1 (a family accent on 12px text). A lesson's own playground has no contract the gate
  can know, so its buttons are each clicked once and only errors, contrast and names are checked: that
  a playground computes the right thing stays the lesson's own load check and the code gate's job.
- **Context and cost.** Work happens one module per fresh chat, with a handoff, never in one long
  chat.

## 9. Decisions (owner, 2026-09-24)

- **D1. Beside, decide later.** An artifact sits beside the markdown lesson as the Lesson tab. Once a
  whole module is verified, the owner decides per module whether the artifact replaces the markdown.
  The markdown stays the source of the sandbox cases either way.
- **D2. Practice lessons deferred.** The 21 practice lessons are not converted until the 199 problem and
  concept lessons are verified. This is a recorded deferral, not a silent exclusion (CLAUDE.md §1): each
  practice row in the ledger carries the note "deferred (D2)", and the end condition is the 199th
  verified lesson, when their format is decided and they join the rollout. The goal remains all 220.
- **D3. Live per module.** The Lesson tab is re-enabled, and a module turned on for learners, as soon as
  every lesson in it (practice aside, per D2) is verified in both themes. Nothing half-done ships.
- **D4. New family colours.** `big-o`, `getting-started` and `math-for-dsa` get family hues of their own,
  designed through the existing system: one `accent` hex each in `web/src/lib/visual/familyTheme.ts`,
  `uiAccent()` deriving the UI fill, the contrast and palette tests holding them to their floors, and
  `moduleFamily` mapping the three modules. Phase 1 work, in the app, with its own review.
- **D5. Code follows the app.** *Replaced by D6 on 2026-09-25.* In the dark theme the artifacts' code
  blocks used the app's light code well and `--shiki-light` colours, as the app's lessons do.
- **D6. The dark theme is The Grid Underneath's (owner, 2026-09-25).** The owner preferred the Grid's
  dark look to the app-derived one. Every artifact's dark theme now takes the Grid's own palette: the
  navy ladder (ground `#15202E`, panel, raise, sunk), the page dot grid, a fixed blue accent in place
  of the family colour (text and icons `#8DB0FF`; the mid blue `#5C8FFF` only as the accent cell's
  fill with its dark ink), the Grid's state hues, its soft black shadow, and a **navy code well** with
  `--shiki-dark` colours, which reverses D5. One table, `GRID_DARK` in `shared.py`, was the only source,
  and the build fails if any ink in it falls below AA on a surface it can sit on (its first run caught
  the mid blue at 4.29:1 on the raise, which is why text uses the lighter blue). Since the app took the
  same theme (#12), the table is retired (#20): `shared.py` `app_dark()` reads every value from the
  app's `.dark` block in globals.css and the Grid's hues from familyTheme.ts `GRID_HUES`, with the same
  AA check. Three values had no app counterpart and now take the app's: the window cell is the blue
  ramp's level 1 (`#1d3a5e`, as the light theme's), the glow tint the fill blue, the shadow the app's. The light theme is
  unchanged: the app's tokens and family colour. Consequence: in the app's dark theme the Lesson tab
  (D1) will sit a navy page inside the app's black chrome; accepted with this decision. The overview
  also takes the Grid's components: the accented headline word, an index whose lit row is the Grid's
  orange "current" tile, big stats in the accent, and a spot drawing beside each system heading.

## 10. Out of scope

The Next.js course (disabled), videos (HyperFrames has its own pipeline), and the sandbox runner
itself (unchanged; the code gate only reads its cases).
