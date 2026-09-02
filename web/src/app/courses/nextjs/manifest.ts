/**
 * Next.js Interview Prep — course manifest.
 *
 * Deliberately NOT DSA's Stage → Module → Lesson(concept|problem|practice)
 * shape. This course's own content has a genuine 3-level hierarchy
 * (Module → Chapter → Lesson) and a different practice taxonomy: each
 * lesson ends in one of four interactive practice formats (or none, for
 * pure mental-model lessons) rather than DSA's algorithm-judge problems.
 * See docs/superpowers/plans/2026-09-02-nextjs-course-tasks.md for the
 * curriculum's full derivation (NotebookLM-assisted structural review,
 * pedagogy investigation, and lesson-level breakdown).
 */

/**
 * A — Trace-the-Execution / Spot-the-Bug: shown code + its execution
 *     side-effects (console/network trace), diagnose why it broke, fix it.
 * B — Semi-Constrained Sandbox: real editor, deliberately no autocomplete
 *     or instant run feedback (whiteboard/CoderPad interview simulation).
 * C — Pull Request Code Review: given a PR with a planted bug, learner
 *     plays reviewer — must flag the exact lines and refactor.
 * D — Architectural Canvas + Defense: drag-and-drop system diagram, then
 *     defend the design against scripted pushback (text or recorded audio).
 * null — conceptual only, no drill (pure mental-model lesson).
 */
export type PracticeFormat = "trace" | "sandbox" | "pr-review" | "canvas-defense" | null;

export type Depth = "essential" | "advanced";

export interface NextjsLesson {
  slug: string;
  title: string;
  /** One-sentence statement of what specifically this lesson teaches. */
  scope: string;
  practiceFormat: PracticeFormat;
  /** What the practice drill actually asks the learner to do. Empty for conceptual-only lessons. */
  practiceScenario: string;
  depth: Depth;
}

export interface NextjsChapter {
  slug: string;
  title: string;
  lessons: NextjsLesson[];
}

export interface NextjsModule {
  slug: string;
  number: number;
  title: string;
  description: string;
  chapters: NextjsChapter[];
}

function lesson(
  slug: string,
  title: string,
  scope: string,
  practiceFormat: PracticeFormat,
  practiceScenario: string,
  depth: Depth,
): NextjsLesson {
  return { slug, title, scope, practiceFormat, practiceScenario, depth };
}

export const MODULES: NextjsModule[] = [
  {
    slug: "rsc-architecture-hydration",
    number: 1,
    title: "The RSC Architecture & Hydration Mental Model",
    description:
      "Next.js vs. plain React, hydration mechanics, the server-client boundary, and basic layout conventions.",
    chapters: [
      {
        slug: "foundations-of-the-server-first-request-lifecycle",
        title: "Foundations of the Server-First Request Lifecycle",
        lessons: [
          lesson(
            "react-server-side-evolution",
            "React's Server-Side Evolution",
            "Traces the history from Client-Side Rendering (CSR) to Static Site Generation (SSG) and Server-Side Rendering (SSR), explaining why a client-only HTML payload is insufficient for interactivity.",
            null,
            "",
            "essential",
          ),
          lesson(
            "app-router-vs-pages-router",
            "App Router vs. Pages Router Architectural Paradigm",
            "Explains the design constraints of the legacy Pages Router (page-level data fetching with getServerSideProps blocking layouts) and why the App Router's layout-first architecture was built to solve them.",
            null,
            "",
            "essential",
          ),
          lesson(
            "file-system-routing-conventions",
            "File-System Routing Conventions",
            "Teaches the structural meaning of the basic route files (page.tsx, layout.tsx, and segment folders) and how layout nesting dictates server-side render boundaries.",
            "sandbox",
            "Set up a nested directory structure to support a basic application view with persistent sub-layouts.",
            "essential",
          ),
        ],
      },
      {
        slug: "react-server-components-deep-dive",
        title: "React Server Components (RSC) Deep Dive",
        lessons: [
          lesson(
            "rsc-vs-ssr-vs-csr",
            "RSC vs. SSR vs. CSR",
            "Differentiates between React Server Components (execute only on the server, yield a serialized payload) and client-hydrated components.",
            "trace",
            "Trace an execution request to spot which components output HTML and which output the serialized payload.",
            "essential",
          ),
          lesson(
            "client-server-boundary",
            "Navigating the Client-Server Boundary",
            "Demystifies the \"use client\" and \"use server\" directives, proving that client components still render on the server first and server actions are not client-only functions.",
            "trace",
            "Scan a component tree to find where the client boundary is established and identify which props cross it.",
            "essential",
          ),
          lesson(
            "rsc-serialization-limits",
            "RSC Serialization Limits & Boundary Gotchas",
            "Teaches what can and cannot pass across the client-server prop boundary (unsupported non-serializable values like class instances or functions).",
            "trace",
            "Spot serialization failures in code snippets that attempt to pass runtime closures across the boundary.",
            "essential",
          ),
        ],
      },
      {
        slug: "hydration-mechanics-and-diagnostics",
        title: "Hydration Mechanics & Diagnostics",
        lessons: [
          lesson(
            "hydration-under-the-hood",
            "Hydration Under the Hood",
            "Teaches how React matches the server-delivered HTML string with the client-side JavaScript bundle to attach interactivity.",
            null,
            "",
            "essential",
          ),
          lesson(
            "resolving-hydration-mismatches",
            "Resolving Hydration Mismatches",
            "Teaches how to diagnose, read console errors for, and fix hydration failures caused by timezone-dependent rendering, invalid HTML nesting (a <div> under a <p>), and illegal window browser checks.",
            "trace",
            "Remediate dynamic-date and illegal-nesting errors inside a simulated browser console.",
            "essential",
          ),
        ],
      },
    ],
  },
  {
    slug: "routing-and-layout-architecture",
    number: 2,
    title: "Routing & Layout Architecture",
    description:
      "Routing layouts, templates, middleware performance, and nested views.",
    chapters: [
      {
        slug: "route-segment-design-and-ui-orchestration",
        title: "Route Segment Design & UI Orchestration",
        lessons: [
          lesson(
            "dynamic-routing-segments",
            "Dynamic Routing Segments",
            "Teaches how to design and extract parameters from dynamic, catch-all, and optional catch-all routing segments.",
            "sandbox",
            "Configure route directories to parse complex dynamic path params without breaking routing boundaries.",
            "essential",
          ),
          lesson(
            "persistent-layouts-vs-remounting-templates",
            "Persistent Layouts vs. Remounting Templates",
            "Analyzes the functional and performance difference between persistent, non-remounting layout.tsx files and remounting template.tsx files (e.g., for entrance animations or per-page state resets).",
            "sandbox",
            "Refactor a route segment to preserve local component input state across sibling page navigation.",
            "essential",
          ),
          lesson(
            "route-groups-and-semantic-isolation",
            "Route Groups and Semantic Isolation",
            "Explains how to group segments with parentheses (route-group) to organize files or apply isolated layout styles without changing the public URL path.",
            "sandbox",
            "Organize a dashboard to expose distinct authentication and user-settings layouts under a unified URL structure.",
            "essential",
          ),
        ],
      },
      {
        slug: "server-side-request-processing-and-middleware",
        title: "Server-Side Request Processing & Middleware",
        lessons: [
          lesson(
            "route-handlers",
            "Custom HTTP Endpoints with Route Handlers",
            "Explains how to build RESTful API routing using route.ts, including request caching behaviors and isolating Node vs. Edge runtime environments.",
            "sandbox",
            "Build a custom POST handler that parses input payloads and executes database mutations.",
            "essential",
          ),
          lesson(
            "middleware-fundamentals",
            "Middleware Fundamentals",
            "Covers intercepting incoming request cycles to manipulate headers, rewrite destinations, and handle redirects.",
            "sandbox",
            "Write a basic localized redirect workflow using headers in middleware.",
            "essential",
          ),
          lesson(
            "middleware-performance-and-scoping",
            "Middleware Performance & Scoping",
            "Exposes the performance bottleneck of unscoped middleware triggering on every request, including static assets (images, CSS).",
            "pr-review",
            "Identify an unscoped middleware function that blocks static assets and rewrite its matcher config.",
            "essential",
          ),
          lesson(
            "redirects-rewrites-and-compiler-config",
            "Redirects, Rewrites, and the Compiler Config",
            "Compares the performance and architecture differences between static redirects in next.config.js and dynamic redirects in middleware.",
            "pr-review",
            "Move heavy runtime routing logic into static config files.",
            "essential",
          ),
        ],
      },
      {
        slug: "complex-interface-architecture",
        title: "Complex Interface Architecture",
        lessons: [
          lesson(
            "parallel-routes",
            "Parallel Routes",
            "Teaches how to use slots (@slot) to render multiple independent sub-pages simultaneously in the same parent layout (critical for complex dashboards).",
            "sandbox",
            "Orchestrate a split-screen layout with isolated slot directories.",
            "advanced",
          ),
          lesson(
            "intercepting-routes",
            "Intercepting Routes",
            "Teaches how to load a route from another part of the application inside a modal (e.g., share feeds, photo galleries).",
            "sandbox",
            "Design a classic photo-gallery modal route using intercepted route patterns ((..)path).",
            "advanced",
          ),
        ],
      },
    ],
  },
  {
    slug: "data-lifecycle",
    number: 3,
    title: "Data Lifecycle: Fetching, Caching & Revalidation",
    description:
      "Server caching, fetch extensions, React 19 mutations, and revalidation strategies.",
    chapters: [
      {
        slug: "the-fetching-model-and-cache-hierarchy",
        title: "The Fetching Model & Cache Hierarchy",
        lessons: [
          lesson(
            "native-fetch-extensions",
            "Native Fetch Extensions",
            "Teaches how Next.js extends the web API fetch with properties like { cache, next: { revalidate } } to hook directly into server-side caches.",
            "sandbox",
            "Set up varying refresh times and bypass behaviors inside raw fetch calls.",
            "essential",
          ),
          lesson(
            "the-server-side-cache-matrix",
            "The Server-Side Cache Matrix",
            "Deconstructs the differences, storage lifespans, and lookup cycles of Request Memoization, the Data Cache, and the Full Route Cache.",
            "trace",
            "Pinpoint which server-side cache layer resolved a series of rapid request logs.",
            "essential",
          ),
          lesson(
            "the-client-side-router-cache",
            "The Client-Side Router Cache",
            "Focuses on why client-side <Link> components fetch and cache page layouts locally, and how to programmatically invalidate this cache using router.refresh() to force updates.",
            "sandbox",
            "Restore fresh server-side data onto a client dashboard view without triggering a full page reload.",
            "essential",
          ),
          lesson(
            "parallel-vs-sequential-fetching",
            "Parallel vs. Sequential Fetching and Waterfalls",
            "Demonstrates how nested await statements cause database waterfalls and teaches how to resolve them with Promise.all.",
            "trace",
            "Analyze a server performance log waterfall to identify the blockages and refactor to fetch in parallel.",
            "essential",
          ),
        ],
      },
      {
        slug: "server-actions-and-react-19-mutations",
        title: "Server Actions & React 19 Mutations",
        lessons: [
          lesson(
            "server-actions-architecture",
            "Server Actions Architecture",
            "Demystifies how server actions function as secure, RPC-like HTTP POST endpoints under the hood.",
            "sandbox",
            "Write an isolated server action that updates a database from a standard input form.",
            "essential",
          ),
          lesson(
            "modern-mutation-hooks",
            "Modern Mutation Hooks",
            "Covers the implementation of React 19's new useActionState (replacing useFormState), useFormStatus for sub-component load state, and useTransition for custom interactive transitions.",
            "sandbox",
            "Implement a modern multi-input form equipped with server-action state handling and immediate loading UI.",
            "essential",
          ),
          lesson(
            "cache-invalidation-mechanics",
            "Cache Invalidation Mechanics",
            "Explains how server mutations trigger cache updates using targeted revalidation paths (revalidatePath) and tags (revalidateTag) across layouts.",
            "pr-review",
            "Refactor an action file where stale layout components are failing to display newly created data.",
            "essential",
          ),
        ],
      },
      {
        slug: "alternative-fetching-paradigms",
        title: "Alternative Fetching Paradigms",
        lessons: [
          lesson(
            "third-party-data-fetching",
            "Integrating Third-Party Data Fetching",
            "Teaches how to safely integrate libraries like React Query or SWR inside an RSC architecture.",
            "sandbox",
            "Pass a pre-fetched query cache state from an RSC container into a client-side provider.",
            "advanced",
          ),
          lesson(
            "progressive-enhancement",
            "Progressive Enhancement",
            "Explores how Server Actions execute native form submissions when client-side JavaScript is fully disabled.",
            "sandbox",
            "Implement form submissions that gracefully fall back to pure HTML actions.",
            "advanced",
          ),
        ],
      },
    ],
  },
  {
    slug: "rendering-and-performance",
    number: 4,
    title: "Rendering Paradigms & Performance Optimization",
    description:
      "The rendering matrix, Partial Prerendering, performance diagnostics, and asset optimization.",
    chapters: [
      {
        slug: "rendering-optimization-and-core-web-vitals",
        title: "Rendering Optimization & Core Web Vitals",
        lessons: [
          lesson(
            "the-rendering-strategy-matrix",
            "The Rendering Strategy Matrix",
            "Compares CSR, SSR, SSG, and ISR to determine how they affect initial bundle sizes, SEO indexing, and content freshness.",
            null,
            "",
            "essential",
          ),
          lesson(
            "dynamic-params-and-static-generation",
            "Dynamic Params & Static Generation",
            "Teaches how to force static page compilation with dynamic parameters using generateStaticParams and managing fallback states.",
            "sandbox",
            "Write dynamic path-parameter generation configurations for a multi-page blog.",
            "essential",
          ),
          lesson(
            "streaming-ssr-and-suspense",
            "Streaming SSR & Suspense Boundaries",
            "Shows how to break up rendering work on the server to stream HTML chunks progressively to the client.",
            "trace",
            "Position Suspense boundaries in a component tree to isolate slow third-party API fetches.",
            "essential",
          ),
          lesson(
            "partial-prerendering",
            "Partial Prerendering (PPR)",
            "Details the experimental App Router feature that prerenders a static HTML shell immediately and streams in dynamic holes.",
            "pr-review",
            "Audit a route to ensure dynamic calls do not accidentally force the entire layout into dynamic rendering.",
            "advanced",
          ),
        ],
      },
      {
        slug: "asset-optimization-and-auditing",
        title: "Asset Optimization & Auditing",
        lessons: [
          lesson(
            "mapping-core-web-vitals",
            "Mapping Core Web Vitals to Rendering Decisions",
            "Connects LCP, INP, and CLS directly to App Router design patterns (e.g., how streaming improves LCP).",
            null,
            "",
            "essential",
          ),
          lesson(
            "web-vitals-profiling-tools",
            "Web Vitals Profiling Tools",
            "Teaches how to analyze a production application using @next/bundle-analyzer and Chrome DevTools to locate performance regressions.",
            "trace",
            "Diagnose a performance trace log to identify the specific third-party script blocking the browser.",
            "essential",
          ),
          lesson(
            "image-asset-optimization",
            "Image Asset Optimization",
            "Deep dives into next/image properties (sizes, layout, priority, placeholders) and how correct image management scales performance.",
            "sandbox",
            "Refactor standard <img> tags on a media-heavy page into optimized next/image structures with dynamic responsive sizes.",
            "essential",
          ),
          lesson(
            "font-strategy-and-layout-shift",
            "Font Strategy & Layout Shift",
            "Teaches how to configure next/font to load local zero-network files and prevent Cumulative Layout Shift (CLS) when custom fonts swap in.",
            "trace",
            "Spot flash-of-unstyled-text layout shifts in rendering traces and apply fallback configuration.",
            "essential",
          ),
        ],
      },
      {
        slug: "splitting-and-runtimes",
        title: "Splitting & Runtimes",
        lessons: [
          lesson(
            "code-splitting-and-dynamic-imports",
            "Code Splitting & Dynamic Imports",
            "Details how client-side modules are split automatically by Next.js, and how to force manual division using next/dynamic to reduce the main bundle.",
            "sandbox",
            "Defer a massive client chart widget using dynamic import until user interaction.",
            "essential",
          ),
          lesson(
            "node-vs-edge-runtime",
            "Runtime Trade-Offs: Node.js vs. Edge Runtime",
            "Evaluates the trade-offs of deploying routes onto Node.js vs. the resource-constrained Edge runtime.",
            "pr-review",
            "Audit an Edge-scoped Route Handler that imports a non-compatible Node-native database driver.",
            "advanced",
          ),
        ],
      },
    ],
  },
  {
    slug: "state-management",
    number: 5,
    title: "State Management & URL-as-State",
    description:
      "State architecture, global stores, search params, and optimistic state.",
    chapters: [
      {
        slug: "state-paradigms-in-the-app-router",
        title: "State Paradigms in the App Router",
        lessons: [
          lesson(
            "state-allocation-client-vs-server",
            "State Allocation (Client vs. Server)",
            "Teaches how to identify which state should live dynamically on the server (via databases, URLs, or cookies) versus the client.",
            null,
            "",
            "essential",
          ),
          lesson(
            "integrating-global-client-stores",
            "Integrating Global Client Stores",
            "Covers how to instantiate and scope global client-side libraries (like Zustand, Redux, or React Context) correctly within the App Router tree.",
            "sandbox",
            "Wrap a custom Zustand store provider around sub-nodes of a layout tree.",
            "essential",
          ),
          lesson(
            "passing-state-across-rsc-boundaries",
            "Passing State Across RSC Boundaries",
            "Details the exact process of passing dynamic state values downward from server parent layouts into client child components.",
            "sandbox",
            "Pull server data from an RSC and seed it safely into client interaction state.",
            "essential",
          ),
        ],
      },
      {
        slug: "state-mechanics-and-optimistic-ui",
        title: "State Mechanics & Optimistic UI",
        lessons: [
          lesson(
            "managing-url-as-state",
            "Managing URL-as-State",
            "Teaches how to map page layouts to URL query parameters (searchParams) for complex searching, filtering, and pagination, preserving shareability without unmounting layouts.",
            "sandbox",
            "Implement a fast multi-filter sidebar that synchronizes UI configuration to search parameters.",
            "essential",
          ),
          lesson(
            "optimistic-ui-updates",
            "Optimistic UI Updates",
            "Explains how to leverage React 19's useOptimistic hook to render immediate UI state changes before a server-side action mutation finishes.",
            "sandbox",
            "Enhance a standard comment-section form to reflect user updates optimistically.",
            "advanced",
          ),
        ],
      },
    ],
  },
  {
    slug: "security-and-production-ops",
    number: 6,
    title: "Security & Production Operations",
    description:
      "Auth structures, Server Action protection, env configuration, and observability.",
    chapters: [
      {
        slug: "security-protocols-in-nextjs",
        title: "Security Protocols in Next.js",
        lessons: [
          lesson(
            "sessions-vs-jwts",
            "Authentication Mechanics: Sessions vs. JWTs",
            "Compares JWT token-based authorization structures against database-backed session tables.",
            null,
            "",
            "essential",
          ),
          lesson(
            "securing-server-actions",
            "Securing Server Actions",
            "Analyzes how Server Actions are targeted by automated agents and teaches how to build validation and authorization checks.",
            "pr-review",
            "Find a vulnerable, exposed Server Action and implement authorization checks and schema validation.",
            "essential",
          ),
          lesson(
            "content-security-policies",
            "Content Security Policies (CSP)",
            "Details how to build, compile, and attach a secure Content Security Policy using dynamic cryptographic nonces for hydration scripts.",
            "pr-review",
            "Implement an active CSP block that securely rejects unauthorized script injections.",
            "essential",
          ),
          lesson(
            "middleware-based-route-guarding",
            "Middleware-Based Route Guarding",
            "Teaches how to parse JWTs or check session tokens in middleware to redirect unauthenticated requests.",
            "sandbox",
            "Write a custom middleware function that intercepts path layouts and redirects unauthenticated users.",
            "essential",
          ),
        ],
      },
      {
        slug: "build-life-cycle-and-monitoring",
        title: "Build Life-cycle & Monitoring",
        lessons: [
          lesson(
            "auth-providers-in-the-real-world",
            "Auth Providers in the Real World",
            "Demonstrates how tools like Auth.js or Clerk abstract session exchanges and OAuth flows.",
            "pr-review",
            "Spot a flawed manual session handler and refactor it into a standard provider framework.",
            "advanced",
          ),
          lesson(
            "environment-variable-lifecycle",
            "The Environment Variable Lifecycle",
            "Covers the lifecycle difference between static build-time constants (NEXT_PUBLIC_ variables compiled directly into client bundles) and dynamic runtime-only server secrets.",
            "pr-review",
            "Locate a security leak where a private database API key is accidentally exposed to the client bundle.",
            "essential",
          ),
          lesson(
            "production-observability-and-error-boundaries",
            "Production Observability & Error Boundaries",
            "Explains how to construct global error boundaries (error.tsx, global-error.tsx) to catch runtime crashes and route them to external monitoring tools (e.g., Sentry).",
            "sandbox",
            "Construct a global boundary that catches backend errors and safely displays a user-friendly recovery UI.",
            "essential",
          ),
        ],
      },
    ],
  },
  {
    slug: "system-design-and-scale",
    number: 7,
    title: "System Design & Architecting at Scale",
    description:
      "Enterprise patterns, scale concerns, SEO optimization, and target-company tracks.",
    chapters: [
      {
        slug: "advanced-architecture-patterns",
        title: "Advanced Architecture Patterns",
        lessons: [
          lesson(
            "monorepos-and-module-boundaries",
            "Monorepos and Enterprise Module Boundaries",
            "Details how to structure large-scale repositories (e.g., with Turborepo) and maintain clear separation between shared and domain-specific code.",
            "pr-review",
            "Correct an import-boundary violation where shared design components are importing domain-specific logic.",
            "advanced",
          ),
          lesson(
            "multi-tenant-architecture",
            "Multi-Tenant Architecture",
            "Covers dynamically routing multi-tenant platforms using dynamic subdomains and custom database pools.",
            "sandbox",
            "Design middleware that rewrites requests to subdomains based on sub-hostnames.",
            "advanced",
          ),
          lesson(
            "when-not-to-use-nextjs",
            "Evaluating When NOT to Use Next.js",
            "Discusses the system design trade-offs of the App Router vs. other React frameworks or pure SPA/static approaches.",
            null,
            "",
            "advanced",
          ),
        ],
      },
      {
        slug: "discovery-and-seo-strategies",
        title: "Discovery & SEO Strategies",
        lessons: [
          lesson(
            "metadata-api-and-structured-discovery",
            "Metadata API & Structured Discovery",
            "Explains how to leverage the Next.js Metadata API for dynamic indexing, sitemap generation, and structured markup schemas.",
            "sandbox",
            "Write a dynamic page metadata extractor that supports structured markup schemas.",
            "essential",
          ),
          lesson(
            "dynamic-social-graph-image-generation",
            "Dynamic Social Graph Image Generation",
            "Explains dynamic Open Graph (OG) social card image rendering using @vercel/og to generate programmatic image responses based on post data.",
            "sandbox",
            "Implement a dynamic image generator that compiles social layouts instantly.",
            "essential",
          ),
          lesson(
            "internationalization-routing",
            "Internationalization (i18n) Routing",
            "Condenses multi-lingual routing into a middleware-based redirect and layout pattern to localize routes.",
            "sandbox",
            "Design locale path manipulation using standard middleware routes.",
            "advanced",
          ),
        ],
      },
      {
        slug: "specialized-career-tracks",
        title: "Specialized Career Tracks",
        lessons: [
          lesson(
            "enterprise-track-distributed-self-hosting",
            "Enterprise Track — Distributed Self-Hosting & CDN Caching",
            "Architecting dynamic Next.js standalone container builds (output: 'standalone') across highly-scaled distributed container clusters (Kubernetes/AWS ECS), overriding local-disk cache handlers for distributed sync.",
            "canvas-defense",
            "Draw an active distributed self-hosting topology on a design canvas and record an audio defense of the design.",
            "advanced",
          ),
          lesson(
            "startup-track-rapid-tooling",
            "Startup Track — Rapid Tooling, Schema Validation, and Vertical Integrations",
            "Accelerating developer velocity using modern ORMs (Drizzle, Prisma) and implementing validation layers mapped to form boundaries.",
            "sandbox",
            "Implement a fast, Zod-validated mutation pipeline that checks form payloads and handles immediate feedback.",
            "advanced",
          ),
        ],
      },
    ],
  },
  {
    slug: "interactive-mock-interview-drills",
    number: 8,
    title: "Interactive Mock Interview Drills",
    description:
      "Practical diagnostic assessments, interactive debugging sandboxes, and behavioral/architectural mock interviews.",
    chapters: [
      {
        slug: "diagnostic-implementation-assessments",
        title: "Diagnostic Implementation Assessments",
        lessons: [
          lesson(
            "e2e-testing-ssr-layouts",
            "End-to-End Testing SSR Layouts",
            "Covers how to test production-grade Next.js rendering boundaries, dynamic loaders, and hydration paths.",
            "pr-review",
            "Diagnose a failing Playwright integration trace to locate why a hydration render crashed (via a pre-recorded .trace.zip audit, not a live headless browser).",
            "essential",
          ),
          lesson(
            "diagnostic-sandbox-live-mismatch-recovery",
            "Diagnostic Sandbox: Live Mismatch Recovery",
            "Exposes learners to an active, broken staging application displaying rendering failures and forces root-cause diagnosis.",
            "trace",
            "Debug a live dashboard displaying random client rendering state offsets.",
            "essential",
          ),
        ],
      },
      {
        slug: "mock-oral-boards-lifecycle-and-migrations",
        title: "Mock Oral Boards: Request Lifecycle & Migrations",
        lessons: [
          lesson(
            "explaining-the-request-lifecycle",
            "Explaining the Request Lifecycle",
            "Coaches the candidate to deliver a precise, senior-level verbal walkthrough of the entire App Router request lifecycle.",
            "canvas-defense",
            "Record an answering drill responding to: \"Walk me through the lifecycle of a Next.js App Router request.\"",
            "essential",
          ),
          lesson(
            "pages-to-app-router-migration-strategies",
            "Pages Router to App Router Migration Strategies",
            "Teaches how to formulate structured, low-risk migration paths for multi-page production systems.",
            "canvas-defense",
            "Design and verbally defend a gradual, directory-level path migration strategy.",
            "essential",
          ),
        ],
      },
      {
        slug: "system-design-sessions",
        title: "System Design Sessions",
        lessons: [
          lesson(
            "system-design-scalable-ecommerce",
            "System Design: Scalable E-Commerce Platforms",
            "Evaluates dynamic system design patterns for e-commerce scale, integrating static rendering paths with dynamic checkout flows.",
            "canvas-defense",
            "Draw and verbally explain a large-scale e-commerce storefront system architecture.",
            "essential",
          ),
          lesson(
            "system-design-distributed-cache-handlers",
            "System Design: Distributed Multi-Container Cache Handlers",
            "Evaluates complex container architectures where distributed servers must coordinate memory state under concurrent load.",
            "canvas-defense",
            "Whiteboard a highly redundant Redis cache-layer sync mechanism to handle concurrent load surges.",
            "essential",
          ),
        ],
      },
    ],
  },
];

export function getModule(slug: string): NextjsModule | undefined {
  return MODULES.find((m) => m.slug === slug);
}

export function getChapter(
  moduleSlug: string,
  chapterSlug: string,
): { module: NextjsModule; chapter: NextjsChapter } | undefined {
  const mod = getModule(moduleSlug);
  if (!mod) return undefined;
  const chapter = mod.chapters.find((c) => c.slug === chapterSlug);
  if (!chapter) return undefined;
  return { module: mod, chapter };
}

export function getLesson(
  moduleSlug: string,
  chapterSlug: string,
  lessonSlug: string,
):
  | { module: NextjsModule; chapter: NextjsChapter; lesson: NextjsLesson }
  | undefined {
  const hit = getChapter(moduleSlug, chapterSlug);
  if (!hit) return undefined;
  const lessonHit = hit.chapter.lessons.find((l) => l.slug === lessonSlug);
  if (!lessonHit) return undefined;
  return { module: hit.module, chapter: hit.chapter, lesson: lessonHit };
}

/** Every lesson id, in reading order. Format: module/chapter/lesson. */
export function allLessonIds(): string[] {
  return MODULES.flatMap((m) =>
    m.chapters.flatMap((c) =>
      c.lessons.map((l) => `${m.slug}/${c.slug}/${l.slug}`),
    ),
  );
}

/** Total lesson count across the whole course — 62 as of the Phase 1 curriculum. */
export function totalLessonCount(): number {
  return allLessonIds().length;
}
