# Next.js Interview Prep Course — Master Tasks & Progress Tracker

**Status: IN PROGRESS.** This is the durable, resumable source of truth for
building the Next.js Interview Prep course end-to-end — curriculum,
content, and platform implementation. Updated continuously as work
happens, not just at milestones, so any session can pick up exactly where
the last one left off without re-deriving state.

**Standing instruction governing this whole effort:** the user has asked
for full autonomous execution — do not stop to ask for confirmation on
routine decisions, use NotebookLM's Studio tools proactively (Mind Map,
Reports, Flashcards, Quiz, Audio/Video Overview, Infographic, Data Table),
and keep this doc updated as the single place to check progress.

## Where this fits

This is the second course on the multi-course platform (see
`docs/superpowers/specs/2026-08-31-multi-course-platform-design.md` and
`docs/superpowers/plans/2026-08-31-multi-course-platform.md` — the DSA
migration that built the platform boundary this course plugs into). Per
that design, this course does **not** have to adopt DSA's
concept/problem/practice lesson taxonomy or its algorithm-judge Sandbox —
it owns its own manifest shape, route tree, and practice mechanism.

NotebookLM collection: **"Next.js Course"**. Master planning notebook:
**"00 · Curriculum"** (`notebook.google.com`, one source currently:
"Next.js Interview Prep — Curriculum v2").

## Phase 0 — Curriculum & pedagogy (DONE)

- [x] Draft v1 curriculum (12 modules) — hand-authored, based on general
  Next.js interview-prep knowledge.
- [x] NotebookLM structural review of v1 — found it bloated (12 modules
  reading like documentation), proposed an 8-module consolidation,
  flagged 5 real coverage gaps (hydration mismatch diagnostics, React 19
  mutation hooks, middleware perf/scoping, CSRF/XSS/CSP for Server
  Actions, Web Vitals profiling tools), 4 overrepresented topics to cut
  (Auth.js specifics, unit-testing RSCs, `next/font` internals, i18n),
  and depth-tag recalibration (RSC serialization limits and client-side
  Router Cache moved essential; progressive enhancement moved advanced).
- [x] Folded all feedback into v2 (8 modules). v1 source removed from the
  notebook — v2 is now the only source.
- [x] Pedagogy investigation — asked NotebookLM how to actually teach and
  let learners practice this material, given the platform's "each course
  picks its own practice mechanism" design. Result: **four distinct
  practice formats are needed, not one**:
  - **Format A — Trace-the-Execution / Spot-the-Bug**: shown code +
    execution side-effects (console/network trace), diagnose why it
    broke, fix it. Targets Modules 1 (hydration), 3 (caching), 5
    (rendering/perf).
  - **Format B — Semi-Constrained Sandbox**: real editor, deliberately no
    autocomplete/instant feedback (whiteboard/CoderPad simulation).
    Targets Modules 2 (routing), 3 (Server Actions), 6 (state).
  - **Format C — Pull Request Code Review**: given a PR with a planted
    bug, learner plays reviewer, must flag exact lines and refactor.
    Targets Modules 4 (middleware perf), 6 (security).
  - **Format D — Architectural Canvas + Defense**: drag-and-drop system
    diagram, then defend the design against scripted pushback (text or
    audio). Targets Modules 7 (system design), 8 (mock drills).
  - **Three things flagged as genuinely hard to fake in a browser-based
    self-paced format**, with workarounds: distributed infra (workaround:
    Interactive Telemetry Audits — pre-generated failing-cluster logs,
    write the fix not the infra), E2E/Playwright testing (workaround:
    pre-recorded `.trace.zip` audits, no live headless Chromium), and
    conversational pushback (workaround: "Defend Your PR" scripted-
    adversary roleplay).

## Phase 1 — Full module/chapter/lesson breakdown (IN PROGRESS)

**Goal:** expand the 8-module outline into a complete lesson-level
curriculum — every module broken into chapters, every chapter broken into
individual lessons, each lesson scoped to one sitting. This happens in
NotebookLM first, per standing instruction, before any app implementation
starts.

- [ ] Ask NotebookLM for the full lesson-level breakdown of all 8 modules.
- [ ] Generate a Mind Map in Studio for the full course structure (visual
  sanity check of the hierarchy).
- [ ] Review the breakdown for completeness against the pedagogy formats
  above — every lesson should know which practice format (A/B/C/D, or
  pure-conceptual with no drill) it ends in.
- [ ] Land the final lesson-level curriculum in this doc (Module →
  Chapter → Lesson table) as the implementation source of truth.

## Phase 2 — Platform implementation groundwork

Per the multi-course platform design, onboarding a new course needs:

- [ ] `courses/nextjs/` content directory created
- [ ] `app/courses/nextjs/...` route tree — own shape, decided once the
  lesson-level curriculum (Phase 1) and practice-format engineering
  (below) are both known
- [ ] `CourseRegistryEntry` for Next.js exported and registered in
  `courses/registry.ts`
- [ ] Decide accent/theming for this course (single course-wide accent,
  or per-module, per the design doc's "course decides its own theming"
  clause)
- [ ] Progress-tracking wiring (course slug `nextjs`, reusing the
  namespaced `ProgressProvider` mechanism already built for the platform)

## Phase 3 — Practice-format engineering (new platform capability)

None of DSA's Sandbox/AlgorithmJudge covers these. Each format needs its
own design/build pass — this is real new engineering, not content
authoring:

- [ ] **Format A (Trace-the-Execution)** — component design + build
- [ ] **Format B (Semi-Constrained Sandbox)** — component design + build
  (can likely extend the shared `components/kit/CodeEditor` primitive
  extracted during the platform migration, with autocomplete/instant-run
  deliberately disabled)
- [ ] **Format C (PR Code Review)** — component design + build
- [ ] **Format D (Architectural Canvas + Defense)** — component design +
  build (drag-and-drop canvas + scripted-adversary response flow)
- [ ] Workarounds for the 3 hard-to-teach gatekeepers (Interactive
  Telemetry Audits, Playwright Trace Viewer audits, "Defend Your PR"
  roleplay) — design + build

## Phase 4 — Content authoring (per module, once Phase 1-3 land)

One row per module; filled in as each module's lessons are actually
written. Not started yet — table added once Phase 1's lesson-level
breakdown exists.

| Module | Lessons | Content drafted | Practice components wired | Reviewed |
| --- | :-: | :-: | :-: | :-: |
| 1. RSC Architecture & Hydration | TBD | | | |
| 2. Routing & Layout Architecture | TBD | | | |
| 3. Data Lifecycle | TBD | | | |
| 4. Rendering & Performance | TBD | | | |
| 5. State Management & URL-as-State | TBD | | | |
| 6. Security & Production Ops | TBD | | | |
| 7. System Design & Scale | TBD | | | |
| 8. Interactive Mock Interview Drills | TBD | | | |

## Session log

**2026-09-02:** Phase 0 completed across the prior session (curriculum
v1→v2, pedagogy investigation). This doc created to track the full
build-out. Proceeding immediately into Phase 1 (lesson-level breakdown in
NotebookLM) per standing autonomous-execution instruction.
