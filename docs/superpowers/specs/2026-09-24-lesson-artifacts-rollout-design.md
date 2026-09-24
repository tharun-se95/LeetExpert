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
| `code` | every piece of code on the page is true | problem: the shown `solution*`/`naive*`/`alt*` pass every sandbox case in Python and JavaScript, `slow*` the first five, `mistake*` fails at least one; concept: a `check.py` model check (as in `build-a-linked-list`), in both runtimes |
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
  rendered DOM, including SVG text on navy cards);
- missing accessible names on interactive controls and diagrams;
- a solution in the DOM before its reveal is opened;
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
3. **Family colour for every module.** `big-o`, `getting-started` and `math-for-dsa` have no
   family in `moduleFamily`; the kit needs one to paint. Decision D4: new family hues, designed in the app.
4. **Dark mode settled.** The kit's code blocks stay navy in the dark theme while the app's own
   dark-theme code well is light. Decision D5. The linked-list page has never been checked in
   dark mode; the browser gate is where that happens, for every page.

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
- **Kit changes stale everything.** A kit change does not touch a lesson's hash, so its evidence
  stays fresh while the page may have changed. Phase 1's CI gates close this: verified lessons are
  re-gated on every kit change.
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
- **D5. Code follows the app.** In the dark theme the artifacts' code blocks use the app's light code
  well and `--shiki-light` colours, as the app's lessons do; in the light theme they stay on the navy
  well with `--shiki-dark`. Phase 1 work in `kit/kit.css`, checked by the browser gate in both themes.

## 10. Out of scope

The Next.js course (disabled), videos (HyperFrames has its own pipeline), and the sandbox runner
itself (unchanged; the code gate only reads its cases).
