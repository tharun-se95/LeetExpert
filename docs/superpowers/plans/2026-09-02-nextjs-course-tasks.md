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
written. Lesson counts are final per Phase 1's breakdown above.

| Module | Chapters | Lessons | Content drafted | Practice components wired | Reviewed |
| --- | :-: | :-: | :-: | :-: | :-: |
| 1. RSC Architecture & Hydration | 3 | 8 | | | |
| 2. Routing & Layout Architecture | 3 | 9 | | | |
| 3. Data Lifecycle | 3 | 9 | | | |
| 4. Rendering & Performance | 3 | 10 | | | |
| 5. State Management & URL-as-State | 2 | 5 | | | |
| 6. Security & Production Ops | 2 | 7 | | | |
| 7. System Design & Scale | 3 | 8 | | | |
| 8. Interactive Mock Interview Drills | 3 | 6 | | | |
| **Total** | **22** | **62** | | | |

## Session log

**2026-09-02:** Phase 0 completed across the prior session (curriculum
v1→v2, pedagogy investigation). This doc created to track the full
build-out. Phase 1 completed same session: NotebookLM produced the full
8-module/22-chapter/62-lesson breakdown with scope/practice-format/depth
per lesson, plus the track-split recommendation for Module 7 (accepted).
Generated a Mind Map in Studio for the top-level structure. Proceeding
into Phase 2 (platform implementation groundwork) per standing
autonomous-execution instruction — no pause for confirmation.
