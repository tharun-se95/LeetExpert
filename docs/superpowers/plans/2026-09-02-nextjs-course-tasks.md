# Next.js Interview Prep Course — Master Tasks & Progress Tracker

**Status: CORE BUILD COMPLETE.** All 62 lessons across 8 modules are
authored, all 54 drill-bearing lessons have a real working practice
exercise, the course is registered as `available` in the platform
catalog, and every increment has been verified (tsc, full test suite,
production build, live browser checks). This is the durable, resumable
source of truth for the build — updated continuously as work happens,
not just at milestones, so any session can pick up exactly where the
last one left off without re-deriving state. Remaining open items
(progress-tracking wiring, per-course theming — both deliberately
deferred, see Phase 2) are polish, not blockers to the course being real
and usable.

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

## Phase 1 — Full module/chapter/lesson breakdown (DONE)

- [x] Asked NotebookLM for the full lesson-level breakdown of all 8
  modules, with scope/practice-format/depth per lesson.
- [x] Generated a Mind Map in Studio for the top-level course structure
  (structural sanity check; the mind map draws from the source document,
  which is the 8-module v2 curriculum — the full 62-lesson breakdown
  below lives in this doc as the implementation source of truth, since
  it was generated in chat rather than as a notebook source).
- [x] Reviewed for completeness against the 4 pedagogy formats — every
  lesson below is tagged.
- [x] Landed the final lesson-level curriculum below.

**Track-split recommendation (accepted):** NotebookLM recommended the
FAANG/Enterprise vs. Startup split in Module 7 be **two separate,
dedicated lessons**, not one lesson with labeled tracks — contextual
overload (totally different infra/cost concerns), persona isolation (a
learner picks the path matching their actual upcoming interview), and
practice-format alignment (Enterprise needs Format D's system diagram +
verbal defense; Startup needs Format B's schema/UI mapping) all point the
same way. Reflected below as Lessons 7.3.1 and 7.3.2.

**Total: 8 modules, 22 chapters, 62 lessons.**

### Module 1 — The RSC Architecture & Hydration Mental Model

*Focuses on Next.js vs. plain React, hydration mechanics, the
server-client boundary, and basic layout conventions.*

**Chapter 1.1: Foundations of the Server-First Request Lifecycle**
1. **React's Server-Side Evolution** — Traces the history from CSR to SSG
   and SSR in React, explaining why client-only HTML payloads are
   insufficient for interactivity. *Conceptual only, no drill.* Essential.
2. **App Router vs. Pages Router Architectural Paradigm** — Explains the
   legacy Pages Router's design constraints (page-level `getServerSideProps`
   blocking layouts) and why the App Router's layout-first architecture
   solves them. *Conceptual only, no drill.* Essential.
3. **File-System Routing Conventions** — The structural meaning of
   `page.tsx`/`layout.tsx`/segment folders and how layout nesting dictates
   server-render boundaries. *Format B* — set up a nested directory
   structure supporting persistent sub-layouts. Essential.

**Chapter 1.2: React Server Components (RSC) Deep Dive**
4. **RSC vs. SSR vs. CSR** — Differentiates components that execute
   server-only and yield a serialized payload vs. client-hydrated ones.
   *Format A* — trace an execution request to spot which components
   output HTML vs. serialized data. Essential.
5. **Navigating the Client-Server Boundary** — Demystifies `"use client"`/
   `"use server"`, proving client components still render on the server
   first. *Format A* — scan a component tree to find the client boundary.
   Essential.
6. **RSC Serialization Limits & Boundary Gotchas** — What can/can't cross
   the client-server prop boundary. *Format A* — spot serialization
   failures in snippets passing runtime closures across the boundary.
   Essential (recalibrated up from advanced per Phase 0 review).

**Chapter 1.3: Hydration Mechanics & Diagnostics**
7. **Hydration Under the Hood** — How React matches server-delivered HTML
   with the client JS bundle. *Conceptual only, no drill.* Essential.
8. **Resolving Hydration Mismatches** — Diagnosing/fixing failures from
   timezone-dependent rendering, invalid nesting (`<div>` under `<p>`),
   illegal `window` checks. *Format A* — remediate dynamic-date and
   illegal-nesting errors in a simulated browser console. Essential.

### Module 2 — Routing & Layout Architecture

*Covers routing layouts, templates, middleware performance, and nested
views.*

**Chapter 2.1: Route Segment Design & UI Orchestration**
1. **Dynamic Routing Segments** — Designing/extracting params from
   dynamic, catch-all, and optional catch-all routes. *Format B* —
   configure route directories parsing complex dynamic path params.
   Essential.
2. **Persistent Layouts vs. Remounting Templates** — The functional/perf
   difference between non-remounting `layout.tsx` and remounting
   `template.tsx`. *Format B* — refactor a route segment to preserve
   local state across sibling navigation. Essential.
3. **Route Groups and Semantic Isolation** — Grouping segments with
   `(route-group)` without changing the public URL. *Format B* — organize
   a dashboard exposing isolated auth/settings layouts under one URL
   structure. Essential.

**Chapter 2.2: Server-Side Request Processing & Middleware**
4. **Custom HTTP Endpoints with Route Handlers** — Building REST routing
   via `route.ts`, request caching, Node vs. Edge runtime. *Format B* —
   build a POST handler parsing payloads and executing mutations.
   Essential.
5. **Middleware Fundamentals** — Intercepting request cycles to
   manipulate headers/rewrite/redirect. *Format B* — write a localized
   redirect workflow. Essential.
6. **Middleware Performance & Scoping** — The performance bottleneck of
   unscoped middleware triggering on static assets. *Format C* — identify
   an unscoped middleware matcher blocking static assets and rewrite it.
   Essential.
7. **Redirects, Rewrites, and the Compiler Config** — Static
   (`next.config.js`) vs. dynamic (middleware) redirects. *Format C* —
   move heavy runtime routing logic into static config. Essential.

**Chapter 2.3: Complex Interface Architecture**
8. **Parallel Routes** — Using `@slot` to render independent sub-pages
   simultaneously in one layout. *Format B* — orchestrate a split-screen
   layout with isolated slot directories. Advanced (essential for
   senior/staff).
9. **Intercepting Routes** — Loading a route from elsewhere in the app
   inside a modal (e.g., share feeds). *Format B* — design a photo-gallery
   modal using `(..)path` interception. Advanced (essential for
   senior/staff).

### Module 3 — Data Lifecycle: Fetching, Caching & Revalidation

*Focuses on server caching, fetch extensions, React 19 mutations, and
revalidation strategies.*

**Chapter 3.1: The Fetching Model & Cache Hierarchy**
1. **Native Fetch Extensions** — How Next.js extends `fetch` with
   `{ cache, next: { revalidate } }`. *Format B* — set up varying refresh
   times and bypass behaviors in raw fetch calls. Essential.
2. **The Server-Side Cache Matrix** — Request Memoization, Data Cache,
   Full Route Cache — lifespans and lookup cycles. *Format A* — pinpoint
   which cache layer resolved a series of rapid request logs. Essential.
3. **The Client-Side Router Cache** — Why `<Link>` fetches/caches page
   layouts locally, and forcing invalidation with `router.refresh()`.
   *Format B* — restore fresh server data onto a client dashboard without
   a full reload. Essential (recalibrated up from advanced per Phase 0
   review).
4. **Parallel vs. Sequential Fetching and Waterfalls** — How nested
   `await`s cause waterfalls; resolving with `Promise.all`. *Format A* —
   analyze a server performance log waterfall and refactor to parallel
   fetches. Essential.

**Chapter 3.2: Server Actions & React 19 Mutations**
5. **Server Actions Architecture** — How server actions function as
   secure, RPC-like HTTP POST endpoints. *Format B* — write an isolated
   server action updating a database from a form. Essential.
6. **Modern Mutation Hooks** — React 19's `useActionState` (replacing
   `useFormState`), `useFormStatus`, `useTransition`. *Format B* —
   implement a multi-input form with server-action state handling and
   loading UI. Essential.
7. **Cache Invalidation Mechanics** — How mutations trigger cache updates
   via `revalidatePath`/`revalidateTag`. *Format C* — refactor an action
   file where stale layouts fail to show newly created data. Essential.

**Chapter 3.3: Alternative Fetching Paradigms**
8. **Integrating Third-Party Data Fetching** — Safely using React
   Query/SWR inside an RSC architecture. *Format B* — pass a pre-fetched
   query cache state from an RSC into a client provider. Advanced.
9. **Progressive Enhancement** — Server Actions executing native form
   submissions with JS disabled. *Format B* — implement forms that
   gracefully fall back to pure HTML actions. Advanced (recalibrated down
   from essential per Phase 0 review).

### Module 4 — Rendering Paradigms & Performance Optimization

*Covers the rendering matrix, Partial Prerendering, performance
diagnostics, and asset optimization.*

**Chapter 4.1: Rendering Optimization & Core Web Vitals**
1. **The Rendering Strategy Matrix** — CSR/SSR/SSG/ISR effects on bundle
   size, SEO, and freshness. *Conceptual only, no drill.* Essential.
2. **Dynamic Params & Static Generation** — Forcing static compilation
   with `generateStaticParams` and fallback states. *Format B* — write
   dynamic path-param configs for a multi-page blog. Essential.
3. **Streaming SSR & Suspense Boundaries** — Streaming HTML chunks
   progressively. *Format A* — position Suspense boundaries to isolate a
   slow third-party fetch. Essential.
4. **Partial Prerendering (PPR)** — The experimental feature prerendering
   a static shell while streaming dynamic holes. *Format C* — audit a
   route to ensure dynamic calls don't force the whole layout dynamic.
   Advanced.

**Chapter 4.2: Asset Optimization & Auditing**
5. **Mapping Core Web Vitals to Rendering Decisions** — Connecting
   LCP/INP/CLS to App Router patterns. *Conceptual only, no drill.*
   Essential.
6. **Web Vitals Profiling Tools** — Analyzing a production app with
   `@next/bundle-analyzer` and Chrome DevTools. *Format A* — diagnose a
   performance trace to find the blocking third-party script. Essential.
7. **Image Asset Optimization** — `next/image` properties (sizes, layout,
   priority, placeholders). *Format B* — refactor `<img>` tags into
   optimized `next/image` with responsive sizes. Essential.
8. **Font Strategy & Layout Shift** — Configuring `next/font` to prevent
   CLS on font swap. *Format A* — spot flash-of-unstyled-text shifts in a
   trace and apply fallback config. Essential (practical framing, not
   build internals, per Phase 0 review).

**Chapter 4.3: Splitting & Runtimes**
9. **Code Splitting & Dynamic Imports** — Automatic splitting and manual
   division via `next/dynamic`. *Format B* — defer a heavy chart widget
   until user interaction. Essential.
10. **Runtime Trade-Offs: Node.js vs. Edge Runtime** — Trade-offs of
    Edge-constrained resources. *Format C* — audit an Edge route
    importing a non-compatible Node-native driver. Advanced.

### Module 5 — State Management & URL-as-State

*Covers state architecture, global stores, search params, and optimistic
state.*

**Chapter 5.1: State Paradigms in the App Router**
1. **State Allocation (Client vs. Server)** — Identifying which state
   lives on the server (DB/URL) vs. client. *Conceptual only, no drill.*
   Essential.
2. **Integrating Global Client Stores** — Scoping Zustand/Redux/Context
   correctly. *Format B* — wrap a Zustand store provider around layout
   sub-nodes. Essential.
3. **Passing State Across RSC Boundaries** — Passing values from server
   parent layouts into client children. *Format B* — pull server data
   from an RSC and seed it into client state. Essential.

**Chapter 5.2: State Mechanics & Optimistic UI**
4. **Managing URL-as-State** — Mapping layouts to `searchParams` for
   shareable search/filter/pagination. *Format B* — implement a
   multi-filter sidebar synced to search params. Essential.
5. **Optimistic UI Updates** — React 19's `useOptimistic` for immediate
   UI feedback before mutation completes. *Format B* — enhance a comment
   form to reflect updates optimistically. Advanced.

### Module 6 — Security & Production Operations

*Covers auth structures, Server Action protection, env configuration, and
observability.*

**Chapter 6.1: Security Protocols in Next.js**
1. **Authentication Mechanics: Sessions vs. JWTs** — Comparing token vs.
   DB-backed session strategies. *Conceptual only, no drill.* Essential.
2. **Securing Server Actions** — Server Actions as an attack surface for
   automated agents. *Format C* — find a vulnerable exposed Server Action
   and add authorization/schema validation. Essential.
3. **Content Security Policies (CSP)** — Building a CSP with dynamic
   nonces for hydration scripts. *Format C* — implement a CSP block
   rejecting unauthorized script injection. Essential.
4. **Middleware-Based Route Guarding** — Parsing JWTs/session tokens in
   middleware to redirect unauthenticated requests. *Format B* — write
   guarding middleware. Essential.

**Chapter 6.2: Build Life-cycle & Monitoring**
5. **Auth Providers in the Real World** — How Auth.js/Clerk abstract
   session exchanges. *Format C* — spot a flawed manual session handler
   and refactor to a standard provider. Advanced (shrunk from Auth.js-
   specific focus per Phase 0 review).
6. **The Environment Variable Lifecycle** — Build-time `NEXT_PUBLIC_`
   constants vs. runtime-only server secrets. *Format C* — locate a leak
   where a private API key reaches the client bundle. Essential.
7. **Production Observability & Error Boundaries** — Global
   `error.tsx`/`global-error.tsx` routing crashes to monitoring (Sentry).
   *Format B* — construct a boundary catching backend errors with a
   friendly recovery UI. Essential.

### Module 7 — System Design & Architecting at Scale

*Covers enterprise patterns, scale concerns, SEO optimization, and
target-company tracks.*

**Chapter 7.1: Advanced Architecture Patterns**
1. **Monorepos and Enterprise Module Boundaries** — Structuring
   large-scale repos (Turborepo) with clear separation. *Format C* —
   correct an import-boundary violation. Advanced.
2. **Multi-Tenant Architecture** — Dynamic subdomain routing, per-tenant
   DB pools. *Format B* — design middleware rewriting requests based on
   sub-hostnames. Advanced.
3. **Evaluating When NOT to Use Next.js** — Trade-offs vs. other
   frameworks or pure SPA/static approaches. *Conceptual only, no drill.*
   Advanced.

**Chapter 7.2: Discovery & SEO Strategies**
4. **Metadata API & Structured Discovery** — Dynamic indexing, sitemap
   generation, structured markup. *Format B* — write a dynamic metadata
   extractor supporting structured schemas. Essential.
5. **Dynamic Social Graph Image Generation** — OG image rendering via
   `@vercel/og`. *Format B* — implement a dynamic image generator
   compiling social layouts. Essential.
6. **Internationalization (i18n) Routing** — Middleware-based
   redirect/layout localization. *Format B* — design locale path
   manipulation via middleware. Advanced (shrunk from a full topic per
   Phase 0 review).

**Chapter 7.3: Specialized Career Tracks** (accepted as two dedicated
lessons, not one dual-track lesson — see recommendation above)
7. **Enterprise Track — Distributed Self-Hosting & CDN Caching** —
   `output: 'standalone'` container builds across Kubernetes/AWS ECS,
   overriding local-disk cache handlers for distributed sync. *Format D*
   — draw a distributed self-hosting topology and record an audio
   defense. Advanced.
8. **Startup Track — Rapid Tooling, Schema Validation, Vertical
   Integrations** — Drizzle/Prisma velocity, Zod validation pipelines.
   *Format B* — implement a Zod-validated mutation pipeline with
   immediate feedback. Advanced.

### Module 8 — Interactive Mock Interview Drills

*Practical diagnostic assessments, interactive debugging sandboxes, and
behavioral/architectural mock interviews.*

**Chapter 8.1: Diagnostic Implementation Assessments**
1. **End-to-End Testing SSR Layouts** — Testing production-grade
   rendering boundaries and hydration paths. *Format C* — diagnose a
   failing Playwright trace to find why a hydration render crashed
   (via the Playwright Trace Viewer workaround from Phase 0). Essential.
2. **Diagnostic Sandbox: Live Mismatch Recovery** — An active, broken
   staging app with rendering failures. *Format A* — debug a live
   dashboard showing random client rendering state offsets. Essential.

**Chapter 8.2: Mock Oral Boards: Request Lifecycle & Migrations**
3. **Explaining the Request Lifecycle** — A precise, senior-level verbal
   walkthrough of the full App Router lifecycle. *Format D (Audio
   Defense)* — record an answer to "Walk me through the lifecycle of a
   Next.js App Router request." Essential.
4. **Pages Router to App Router Migration Strategies** — Structured,
   low-risk migration paths for production systems. *Format D (Audio
   Defense)* — design and verbally defend a gradual migration strategy.
   Essential.

**Chapter 8.3: System Design Sessions**
5. **System Design: Scalable E-Commerce Platforms** — Static rendering +
   dynamic paths at e-commerce scale. *Format D* — draw and verbally
   explain a large-scale storefront architecture. Essential.
6. **System Design: Distributed Multi-Container Cache Handlers** —
   Coordinating distributed server memory state. *Format D* — whiteboard
   a redundant Redis cache-sync mechanism for concurrent load. Essential.

## Phase 2 — Platform implementation groundwork (DONE for the shape that exists so far)

- [x] `courses/nextjs/` content directory created
- [x] `web/src/app/courses/nextjs/manifest.ts` — this course's own
  Module → Chapter → Lesson shape (not DSA's), with `practiceFormat`/
  `depth` per lesson, encoding the full 62-lesson curriculum. Locked in
  with `web/tests/nextjsManifest.test.ts` (structural counts, slug
  uniqueness, representative lookups).
- [x] `web/src/app/courses/nextjs/load.ts` — dedicated content loader for
  this course's 3-level directory layout and frontmatter shape, reusing
  the course-agnostic `lib/content/highlightBlocks` rather than DSA's
  `lib/course/load.ts`. A lesson with no `.md` file yet returns `null`
  and the page renders an honest "not written yet" state — not a 404,
  not a fake stub.
- [x] `CourseRegistryEntry` (`app/courses/nextjs/registry.ts`) exported
  and registered in `courses/registry.ts`. Accent: `#4F46E5` (single
  course-wide accent, not DSA's per-module family system — this course
  chose the simpler option the design doc explicitly allows). **Status:
  `coming-soon`** — flip to `available` once enough real content exists
  to actually publish (see Phase 4 progress below).
- [x] Route tree: `app/courses/nextjs/page.tsx` (module/chapter/lesson
  curriculum overview) and
  `app/courses/nextjs/[module]/[chapter]/[lesson]/page.tsx` (lesson
  page) — a 3-level shape, deliberately different from DSA's 2-level
  `[module]/[lesson]`. Verified live: catalog card renders correctly
  and is properly non-interactive while coming-soon; real lesson
  content renders; an unauthored lesson shows the graceful fallback;
  build generates all 62 lesson paths (431 total pages site-wide).
- [ ] Progress-tracking wiring (course slug `nextjs` through the
  existing namespaced `ProgressProvider`) — not done yet; no reason to
  track progress through a course with 1/62 lessons authored. Revisit
  once Phase 4 has enough real lessons that "progress" means something.
- [ ] `activeThemeFor` in `AppShell.tsx` doesn't yet dispatch a theme for
  `/courses/nextjs/...` routes (currently falls through to monochrome,
  which is a valid, explicitly-allowed choice per the design doc — "one
  accent per module, a single course-wide accent, or none"). Revisit
  if/when a real per-lesson accent is wanted instead of monochrome.

## Phase 3 — Practice-format engineering (new platform capability)

**Architecture decision (confirmed with the user 2026-09-02):
reveal-based self-assessment, not automated grading.** Arbitrary
React/Next.js code, PR-review judgment, and system-design diagrams
genuinely can't be graded the way DSA's algorithm judge grades a pure
function's output against test cases — there is no correct single
answer to compare against mechanically. The alternative considered
(heavier automated tooling — a real drawing canvas, browser audio
recording, diff/annotation UI) was explicitly rejected as substantially
more engineering time for interactivity that still couldn't truly
"grade" open-ended answers.

**What this looks like concretely, per format:**
- **All formats** get a concrete "## Try it" exercise authored directly
  in the lesson markdown, ending in a `reveal` fence (the platform's
  existing course-agnostic click-to-expand primitive — DOM-absent until
  opened, so not Ctrl+F-able, already used by DSA) holding a worked
  answer/diagnosis walkthrough.
- **`sandbox` format** additionally gets a `scratchpad` fence — a real,
  free-write CodeMirror editor (new `Scratchpad`/`ScratchpadEditor`
  components, TSX-configured, localStorage-persisted per lesson) sitting
  above the reveal, so there's a genuine workspace to attempt the
  exercise in before comparing against the reference approach. No
  grading — this is not DSA's judged pure-function Sandbox.
- **`trace` / `pr-review` / `canvas-defense`** formats use the
  `reveal`-only pattern — a diagnosis or design prompt, then a reveal
  with the full worked reasoning.

**Mechanism status: DONE and verified.**
- [x] `scratchpad` fence wired into `Markdown.tsx` (alongside the
  existing reveal/quiz/complexity/viz pattern) and `highlightBlocks.ts`
  (added to `NON_CODE_LANGS`).
- [x] `Scratchpad.tsx` / `ScratchpadEditor.tsx` built
  (`components/course/`) — standalone CodeMirror instance for JSX/TSX,
  deliberately NOT reusing DSA's `SandboxLang`-typed `CodeEditor`
  primitive (that type only covers python/javascript for the judge
  sandbox; this needs `javascript({ jsx: true, typescript: true })`).
- [x] `load.ts` computes `hasEmbeddedPractice` (detects a `reveal` fence
  in the lesson body) so the lesson page can tell a retrofitted lesson
  from one still carrying only the manifest-driven placeholder — no new
  manifest field needed.
- [x] `page.tsx`'s practice block now only shows the "hasn't been wired
  up yet" note when `hasEmbeddedPractice` is false, so a retrofitted
  lesson's placeholder disappears automatically once its markdown gains
  a real `reveal`.
- [x] Verified live in the browser: Scratchpad renders, accepts input,
  persists drafts across reload; Reveal expands correctly with
  syntax-highlighted nested code fences; the placeholder note correctly
  shows for un-retrofitted lessons and disappears for retrofitted ones.

**Content retrofit status (54 drill-bearing lessons need a "## Try it" +
reveal added — this is the remaining Phase 3 work, tracked per module):**

| Module | Drill lessons | Retrofitted |
| --- | :-: | :-: |
| 1. RSC Architecture & Hydration | 5 | 5/5 ✅ (reference implementation) |
| 2. Routing & Layout Architecture | 9 | 9/9 ✅ |
| 3. Data Lifecycle | 9 | 9/9 ✅ |
| 4. Rendering & Performance | 8 | 8/8 ✅ |
| 5. State Management & URL-as-State | 4 | 4/4 ✅ |
| 6. Security & Production Ops | 6 | 6/6 ✅ |
| 7. System Design & Scale | 7 | 7/7 ✅ |
| 8. Interactive Mock Interview Drills | 6 | 6/6 ✅ |
| **Total** | **54** | **54/54 ✅** |

## ✅ PHASE 3 COMPLETE — every drill-bearing lesson has a real, working practice drill

All 54 drill-bearing lessons across all 8 modules now carry a concrete
"## Try it" exercise ending in a `reveal`-hidden worked answer (sandbox-
format lessons additionally get a `Scratchpad` free-write workspace).
Verified end to end: `tsc --noEmit`, the full Vitest suite (608 tests),
a clean production build (431 static pages, all 62 lesson routes), and
live browser checks of the retrofitted content across every module
(Scratchpad accepts input and persists drafts; Reveal expands correctly
with syntax-highlighted nested code; the manifest-driven placeholder
correctly disappears once a lesson's markdown carries embedded
practice).

**What changed the plan from the original Phase 3 vision:** the original
plan (Phase 0) called for four bespoke interactive components (a
diagnostic trace UI, a constrained sandbox, a PR-diff review UI, a
drawing canvas + audio recorder). After discovering the platform's
existing `reveal` fence primitive (DSA already uses it for hidden
answers — click-to-expand, DOM-absent until opened), and after
confirming the approach with the user directly, the actual
implementation converged on one shared mechanism (`reveal` for every
format's worked answer, `scratchpad` additionally for `sandbox`) rather
than four separate bespoke UIs — chosen explicitly over heavier
automated-grading tooling because arbitrary React/Next.js code, PR
judgment, and system-design diagrams can't be graded the way DSA's
algorithm judge grades a pure function's output.

The three Phase-0-flagged hard-to-fake-in-browser gatekeepers
(distributed infra, E2E/Playwright, conversational pushback) are already
handled by the same reveal-based approach at the content level — the
`canvas-defense` and `pr-review` lessons that touch them (e.g. Module
7's distributed self-hosting lesson, Module 8's Playwright trace-audit
lesson) already frame their "Try it" exercise around a described
scenario or pre-recorded-style trace rather than requiring live
infrastructure, consistent with the workarounds recorded in Phase 0.

## Phase 4 — Content authoring (per module, once Phase 1-3 land)

One row per module; filled in as each module's lessons are actually
written. Lesson counts are final per Phase 1's breakdown above.

| Module | Chapters | Lessons | Content drafted | Practice components wired | Reviewed |
| --- | :-: | :-: | :-: | :-: | :-: |
| 1. RSC Architecture & Hydration | 3 | 8 | 8/8 ✅ | 0/5 (3 conceptual, no drill) | |
| 2. Routing & Layout Architecture | 3 | 9 | 9/9 ✅ | 0/9 | |
| 3. Data Lifecycle | 3 | 9 | 9/9 ✅ | 0/9 | |
| 4. Rendering & Performance | 3 | 10 | 10/10 ✅ | 0/8 (2 conceptual, no drill) | |
| 5. State Management & URL-as-State | 2 | 5 | 5/5 ✅ | 0/4 (1 conceptual, no drill) | |
| 6. Security & Production Ops | 2 | 7 | 7/7 ✅ | 0/6 (1 conceptual, no drill) | |
| 7. System Design & Scale | 3 | 8 | 8/8 ✅ | 0/7 (1 conceptual, no drill) | |
| 8. Interactive Mock Interview Drills | 3 | 6 | 6/6 ✅ | 0/6 | |
| **Total** | **22** | **62** | **62/62 ✅** | **0/54 drill-bearing** | |

**Module 1 (RSC Architecture & Hydration) is fully authored — 8/8
lessons**, the first complete module. All content lives under
`courses/nextjs/rsc-architecture-hydration/`. This proves the full
pipeline end to end: 3 conceptual-only lessons (no drill), 1 `sandbox`
lesson, and 4 `trace` lessons — every practice format used in this
module has real content rendering its scenario text and the honest
"component not built yet" note correctly. Module 1 is the reference
module for what "done" looks like content-wise, the same role
hash-tables played for the DSA course.

**Module 2 (Routing & Layout Architecture) is fully authored — 9/9
lessons**, all under `courses/nextjs/routing-and-layout-architecture/`.
Every lesson in this module is drill-bearing (0 conceptual-only): 6
`sandbox` lessons (dynamic segments, layouts vs. templates, route groups,
route handlers, middleware fundamentals, plus the two advanced-depth
parallel/intercepting-routes lessons) and 2 `pr-review` lessons
(middleware performance/scoping, redirects/rewrites vs. compiler config).
Verified with `tsc --noEmit`, the full Vitest suite (608 tests), a clean
production build (431 static pages, all 9 new lesson routes present in
the route manifest), and a live HTTP smoke-test returning 200 for each of
the 9 new lesson URLs against a production server.

**Module 3 (Data Lifecycle: Fetching, Caching & Revalidation) is fully
authored — 9/9 lessons**, all under `courses/nextjs/data-lifecycle/`.
Covers the fetch caching extensions, the three-layer server cache matrix
(Request Memoization / Data Cache / Full Route Cache), the client-side
Router Cache and `router.refresh()`, fetch waterfalls, Server Actions
architecture, React 19's `useActionState`/`useFormStatus`/`useTransition`,
cache invalidation (`revalidatePath`/`revalidateTag`), and the two
advanced-depth lessons on React Query/SWR integration and progressive
enhancement. 6 `sandbox`, 2 `trace`, 1 `pr-review` — no conceptual-only
lessons in this module. Verified with `tsc --noEmit`, the full Vitest
suite (608 tests), a clean production build (431 static pages), and a
live HTTP smoke-test returning 200 for all 9 new lesson URLs.

**Module 4 (Rendering Paradigms & Performance Optimization) is fully
authored — 10/10 lessons**, all under
`courses/nextjs/rendering-and-performance/`. Covers the CSR/SSR/SSG/ISR
rendering matrix (conceptual), `generateStaticParams`/`dynamicParams`
fallback behavior, streaming SSR with Suspense boundary placement,
Partial Prerendering's static-shell-plus-dynamic-holes model, mapping
Core Web Vitals (LCP/INP/CLS) to architectural causes (conceptual),
bundle-analyzer/DevTools profiling, `next/image` and `next/font`
optimization, `next/dynamic` code splitting, and the Node vs. Edge
runtime trade-off. 2 conceptual-only, 4 sandbox, 2 trace, 2 pr-review.
Verified with `tsc --noEmit`, the full Vitest suite (608 tests), a clean
production build (431 static pages), and a live HTTP smoke-test
returning 200 for all 10 new lesson URLs.

**Module 5 (State Management & URL-as-State) is fully authored — 5/5
lessons**, all under `courses/nextjs/state-management/`. Covers state
allocation across server/URL/cookie/client layers (conceptual), safely
scoping global client stores to avoid a cross-request sharing bug unique
to the App Router's server-render model, passing state across the RSC
boundary, URL-as-state for shareable filter/search UI via
`searchParams`, and React 19's `useOptimistic`. 1 conceptual-only, 4
sandbox. Verified with `tsc --noEmit`, the full Vitest suite (608
tests), a clean production build (431 static pages), and a live HTTP
smoke-test returning 200 for all 5 new lesson URLs.

**Module 6 (Security & Production Operations) is fully authored — 7/7
lessons**, all under `courses/nextjs/security-and-production-ops/`.
Covers session-vs-JWT authentication trade-offs (conceptual), securing
Server Actions against automated agents (authorization + schema
validation as separate, both-required checks), Content Security Policies
with per-request nonces for hydration scripts, middleware-based route
guarding building directly on Module 2's middleware and matcher
scoping, when a hand-rolled session handler should be replaced by a real
auth provider, the `NEXT_PUBLIC_` env var client-bundle leak trap, and
production error boundaries (`error.tsx`/`global-error.tsx`) wired to
monitoring. 1 conceptual-only, 1 sandbox, 5 pr-review — this module
leans heavily on PR-review format given how much of production security
work is *auditing existing code* rather than building from scratch.
Verified with `tsc --noEmit`, the full Vitest suite (608 tests), a clean
production build (431 static pages), and a live HTTP smoke-test
returning 200 for all 7 new lesson URLs.

**Module 7 (System Design & Architecting at Scale) is fully authored —
8/8 lessons**, all under `courses/nextjs/system-design-and-scale/`.
Covers monorepo module-boundary discipline (shared packages must never
depend on app-specific code), multi-tenant subdomain routing via
middleware, when Next.js genuinely isn't the right architectural choice
(conceptual), the Metadata API and sitemap/structured-data generation,
dynamic OG image generation via `@vercel/og`, i18n routing, and the
accepted Enterprise/Startup track split as two dedicated lessons —
distributed self-hosting with shared external cache handlers (the
course's first `canvas-defense` lesson, verified live) vs. rapid
ORM/Zod-validated tooling for startup velocity. 1 conceptual-only, 1
canvas-defense, 6 sandbox/pr-review. Verified with `tsc --noEmit`, the
full Vitest suite (608 tests), a clean production build (431 static
pages), and a live HTTP smoke-test returning 200 for all 8 new lesson
URLs.

**Module 8 (Interactive Mock Interview Drills) is fully authored — 6/6
lessons**, all under `courses/nextjs/interactive-mock-interview-drills/`.
Covers E2E/Playwright trace-audit diagnosis for SSR hydration failures
(using the Phase 0-flagged pre-recorded `.trace.zip` workaround, not a
live headless browser), live mismatch-recovery diagnosis requiring
learners to distinguish hydration bugs from stale-cache and
state-seeding bugs, the request-lifecycle oral defense that synthesizes
every prior module into one coherent verbal answer, Pages-to-App-Router
incremental migration strategy, and two capstone system-design sessions
(e-commerce rendering-strategy mapping across route types; distributed
multi-container Redis cache-handler design under concurrent load). 2
pr-review/trace, 4 canvas-defense. Verified with `tsc --noEmit`, the full
Vitest suite (608 tests), a clean production build (431 static pages),
and a live HTTP smoke-test returning 200 for all 6 new lesson URLs.

## ✅ PHASE 4 COMPLETE — all 62/62 lessons authored across all 8 modules

Every lesson in the full curriculum now has real, complete,
non-stub content: 8 modules, 22 chapters, 62 lessons, verified end to
end (tsc, full test suite, production build generating all 62 lesson
routes, and a live HTTP smoke-test of every single lesson URL added
across every module). Format breakdown across the 62 lessons: 8
conceptual-only, ~24 sandbox, ~9 trace, ~14 pr-review, 6 canvas-defense
(exact per-lesson tags are authoritative in `manifest.ts`).

**What's real right now:** every lesson page renders genuine, accurate,
well-explained Next.js content — a learner can read the entire course
today and learn the material. **What's still a placeholder:** every
drill-bearing lesson (54 of 62) shows an honest "practice component not
built yet" note instead of a working interactive drill, because none of
the four practice-format components (Phase 3) have been built yet. The
course registry status stays `coming-soon` for exactly this reason: full
lesson content existing without a working practice mechanism is not yet
what this course is meant to be — CLAUDE.md's "no shortcuts" standard
means flipping to `available` waits until practice actually works, not
until content merely exists.

**Next up:** Phase 3 — practice-format engineering. This is the
remaining work standing between the current state and an actually
shippable course.

## Session log

**2026-09-02:** Phase 0 completed across the prior session (curriculum
v1→v2, pedagogy investigation). This doc created to track the full
build-out. Phase 1 completed same session: NotebookLM produced the full
8-module/22-chapter/62-lesson breakdown with scope/practice-format/depth
per lesson, plus the track-split recommendation for Module 7 (accepted).
Generated a Mind Map in Studio for the top-level structure. Phase 2
(platform groundwork) substantially completed same session: manifest,
loader, registry entry (status `coming-soon`), and the full route tree
all built and verified live (build, tests, tsc, eslint all green;
catalog card renders correctly and non-interactively). Landed the first
real lesson (1.1.1, conceptual-only) as genuine content backing the
registration, rather than a placeholder file, when the
course-content-coverage guard correctly flagged the empty directory.
Two Phase 2 items deliberately deferred with reasoning recorded above
(progress-tracking wiring, per-course theming) since forcing them now
would be premature given 1/62 lessons exist. Module 1 completed same
session (8/8 lessons) as the pipeline reference module. Module 2
completed in a later session (9/9 lessons, all drill-bearing across
`sandbox` and `pr-review` formats), verified end to end (tsc, tests,
production build, live route smoke-test) and committed. Module 3 (Data
Lifecycle) completed same session as Module 2 (9/9 lessons: 6 sandbox, 2
trace, 1 pr-review), verified end to end identically and committed.
Module 4 (Rendering & Performance) completed same session (10/10
lessons: 2 conceptual, 4 sandbox, 2 trace, 2 pr-review), verified
identically and committed. Module 5 (State Management & URL-as-State)
completed same session (5/5 lessons: 1 conceptual, 4 sandbox), verified
identically and committed. Module 6 (Security & Production Ops)
completed same session (7/7 lessons: 1 conceptual, 1 sandbox, 5
pr-review), verified identically and committed. Module 7 (System Design &
Scale) completed same session (8/8 lessons: 1 conceptual, 1
canvas-defense, 6 sandbox/pr-review), verified identically and
committed. Module 8 (Interactive Mock Interview Drills) completed same
session (6/6 lessons: 2 pr-review/trace, 4 canvas-defense), verified
identically and committed — **this closes out Phase 4 entirely: all
62/62 lessons across all 8 modules are now authored, verified, and
live.** Next: Phase 3, practice-format engineering — designing and
building the four practice components (Trace-the-Execution,
Semi-Constrained Sandbox, PR Code Review, Architectural Canvas +
Defense) so the 54 drill-bearing lessons' "not built yet" placeholders
become real, working practice. This is the remaining work before the
course can honestly move from `coming-soon` to `available`.

**2026-09-02 (continued):** Same standing autonomous-execution mandate,
picked up mid-Phase-4. Completed content authoring for Modules 2-8
sequentially (53 more lessons), each verified individually (tsc, full
Vitest suite, production build, live HTTP smoke-test of every new
lesson URL) and committed separately — closing out Phase 4 entirely at
62/62 lessons across all 8 modules.

Then tackled Phase 3. Before committing engineering time to four bespoke
practice components, flagged the architecture decision explicitly to the
user rather than guessing: discovered the platform already has a
`reveal` fence primitive (DSA's existing click-to-expand, DOM-absent-
until-opened hidden-answer mechanism) that could serve as a much lighter
foundation than building real automated grading for open-ended
React/Next.js code, PR judgment, and system-design diagrams — none of
which can be judged the way DSA's algorithm judge grades a pure
function's output. Presented the choice (reveal-based self-assessment
vs. heavier automated tooling); the user confirmed reveal-based.

Built the mechanism: a new `scratchpad` fence (+ `Scratchpad`/
`ScratchpadEditor` components — a standalone TSX-configured CodeMirror
instance, deliberately not reusing DSA's `SandboxLang`-typed judge-
sandbox `CodeEditor`) for sandbox-format lessons, wired into the
existing `Markdown.tsx` fence-handling pattern; `load.ts` now computes
`hasEmbeddedPractice` so the lesson page's placeholder disappears
automatically once a lesson's markdown gains a real `reveal`, with no
new manifest field needed. Verified live in the browser end to end
(Scratchpad renders/persists/resets; Reveal expands with syntax-
highlighted nested code; placeholder logic correctly branches both ways)
before scaling out.

Retrofitted all 54 drill-bearing lessons across all 8 modules with a
concrete "## Try it" exercise + reveal-hidden worked answer, module by
module, each batch verified (tsc, full test suite, live browser spot-
checks) and committed separately — closing out Phase 3's content work
entirely. Hit one environmental snag along the way: running `rm -rf
.next && npm run build` against the same `.next` directory a long-lived
dev server was also writing to corrupted the dev server's cache twice;
fixed by stopping the dev server before any one-off production build and
restarting it cleanly afterward, rather than running both against the
same build output concurrently.

With Phases 3 and 4 both complete, flipped `NEXTJS_COURSE.status` from
`coming-soon` to `available` in the platform registry — the course is
genuinely ready to be its own real, live entry in the course catalog now,
verified with a live click-through from the homepage catalog card
through to the full course curriculum page. The two Phase 2 items still
open (progress-tracking wiring, per-course theming) remain deliberately
deferred as polish, not blockers — recorded above with the reasoning for
picking them back up later.
