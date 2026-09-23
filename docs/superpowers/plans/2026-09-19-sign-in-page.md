# Sign-in Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the empty `/sign-in` card with a two-column page: headline, the landing's animated data structure, three true benefits and the sign-in card.

**Architecture:** `page.tsx` stays a static server component. Copy lives in `lib/auth/signInCopy.ts` (one source, asserted by tests). A new client component `SignInStory` owns only the stage timer, renders `EvolvingStructure` and the benefit list, and never imports the auth client. `SignInButtons` is untouched.

**Tech Stack:** Next.js 16 App Router, React 19, `motion/react` (already shared), `@phosphor-icons/react`, Tailwind v4 tokens, Vitest + jsdom.

Spec: `docs/superpowers/specs/2026-09-19-sign-in-page-design.md`. Work in `web/`; run every command from `web/`.

## Global Constraints

- Colour only through tokens (`text-muted`, `text-mark`, `border-border`, `bg-elevated`, `text-bad`); no Tailwind palette values.
- Space Mono (`font-display`) for `h1`/`h2`/benefit titles: `font-bold` or regular, never `font-semibold`. Space Grotesk body.
- The lamp green stays the logo's alone; icons are monochrome and `aria-hidden`.
- No `any`, no unchecked casts; comments explain why.
- The page stays static: no `cookies()`, `headers()`, `searchParams` or session read on the server (`npm run build` must still show `/sign-in` as `○`).
- `SignInStory` and everything it imports must not reach `@/lib/auth/client` or `better-auth`.
- The auth-unavailable card is unchanged, byte for byte (its markup and the existing test).
- Copy is exactly the strings in Task 1; no invented claims, counts or social proof.
- Commit trailer: `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.

---

### Task 1: Copy, the animated story and the import boundary

**Files:**
- Create: `web/src/lib/auth/signInCopy.ts`, `web/src/app/sign-in/SignInStory.tsx`, `web/tests/signInStory.test.tsx`
- Modify: `web/tests/authChunkBoundary.test.ts` (add one `it`)

**Interfaces:**
- Consumes: `EvolvingStructure({ stage, className })` from `@/components/landing/EvolvingStructure`; `STAGE_NAMES`, `describeStage(stage)` from `@/lib/landing/structureLayouts`.
- Produces: `SIGN_IN_COPY` (`headline`, `subline`, `benefits: readonly { id, title, body }[]`, `stored`); `SignInStory()`; `STAGE_MS = 1100`.

- [ ] **Step 1: Write `web/src/lib/auth/signInCopy.ts`**

```ts
/**
 * The sign-in page's words, in one place so the page renders them and the tests
 * assert them. Every claim maps to a shipped feature (spec
 * 2026-09-19-sign-in-page-design.md §2.2): only visited, solved and
 * problem-sandbox drafts sync; a draft conflict stashes rather than overwrites;
 * export and delete exist under /api/account. Do not add a claim without the
 * feature behind it.
 */
export const SIGN_IN_COPY = {
  headline: "Pick up where you left off, on any device.",
  subline: "The course works signed out too. Sign in only to sync.",
  benefits: [
    {
      id: "place",
      title: "Your place is saved",
      body: "Lessons you have visited and problems you have solved follow your account.",
    },
    {
      id: "code",
      title: "Your code follows you",
      body: "Your sandbox code syncs per problem. If two devices disagree, both versions are kept and you choose.",
    },
    {
      id: "own",
      title: "Yours to take or delete",
      body: "Export your data as a file, or delete the account and everything in it.",
    },
  ],
  // Kept word for word from the reviewed page: no privacy page exists yet, and
  // session rows may hold more than this names, so it must not say "nothing else".
  stored: "We store your name, email, avatar, lesson progress and sandbox code.",
} as const;
```

- [ ] **Step 2: Write the failing test `web/tests/signInStory.test.tsx`**

```tsx
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describeStage } from "@/lib/landing/structureLayouts";
import { SIGN_IN_COPY } from "@/lib/auth/signInCopy";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let reduced: boolean | null = false;
vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return { ...actual, useReducedMotion: () => reduced };
});

const { SignInStory, STAGE_MS } = await import("@/app/sign-in/SignInStory");

let root: Root | null = null;
let host: HTMLElement;
beforeEach(() => {
  vi.useFakeTimers();
  reduced = false;
  host = document.createElement("div");
  document.body.append(host);
});
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const label = () => host.querySelector('svg[role="img"]')!.getAttribute("aria-label");
function mount() {
  root = createRoot(host);
  act(() => root!.render(<SignInStory />));
}

describe("SignInStory", () => {
  it("starts on the array and steps once, a stage at a time, to the graph", () => {
    mount();
    expect(label()).toBe(describeStage(0));
    act(() => void vi.advanceTimersByTime(STAGE_MS));
    expect(label()).toBe(describeStage(1));
    act(() => void vi.advanceTimersByTime(STAGE_MS));
    expect(label()).toBe(describeStage(2));
    act(() => void vi.advanceTimersByTime(STAGE_MS));
    expect(label()).toBe(describeStage(3));
  });

  it("rests on the graph: it does not loop", () => {
    mount();
    act(() => void vi.advanceTimersByTime(STAGE_MS * 12));
    expect(label()).toBe(describeStage(3));
  });

  it("goes straight to the graph, with no timer, under reduced motion", () => {
    reduced = true;
    const setIntervalSpy = vi.spyOn(window, "setInterval");
    mount();
    expect(label()).toBe(describeStage(3));
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it("stops its timer when it unmounts mid-animation", () => {
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");
    mount();
    act(() => void vi.advanceTimersByTime(STAGE_MS));
    act(() => root!.unmount());
    root = null;
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("lists every benefit from the copy module", () => {
    mount();
    for (const { title, body } of SIGN_IN_COPY.benefits) {
      expect(host.textContent).toContain(title);
      expect(host.textContent).toContain(body);
    }
    expect(host.querySelectorAll("li")).toHaveLength(SIGN_IN_COPY.benefits.length);
  });

  it("uses no heading level: the page's h1 and the card's h2 own the outline", () => {
    mount();
    expect(host.querySelector("h1, h2, h3, h4")).toBeNull();
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run tests/signInStory.test.tsx --testTimeout=30000`
Expected: FAIL, `Failed to resolve import "@/app/sign-in/SignInStory"`.

- [ ] **Step 4: Write `web/src/app/sign-in/SignInStory.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Bookmark, Code, DownloadSimple } from "@phosphor-icons/react";
import { EvolvingStructure } from "@/components/landing/EvolvingStructure";
import { SIGN_IN_COPY } from "@/lib/auth/signInCopy";
import { STAGE_NAMES } from "@/lib/landing/structureLayouts";

/** The landing hero's cadence: longer than the 0.9 s morph, so each stage lands. */
export const STAGE_MS = 1100;
const LAST_STAGE = STAGE_NAMES.length - 1;

const ICONS = { place: Bookmark, code: Code, own: DownloadSimple } as const;

/**
 * The structure plays array → hash table → tree → graph once and rests on the
 * graph; it never loops, because motion that does not stop competes with the
 * buttons for a learner who is choosing a provider. Server render and the first
 * client render both show stage 0, so reduced motion jumping to the graph is an
 * effect, not a hydration mismatch. This file must not import the auth client:
 * SignInButtons is the route's only module that does (authChunkBoundary test).
 */
export function SignInStory() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (reduce) {
      setStage(LAST_STAGE);
      return;
    }
    setStage(0);
    let next = 0;
    const id = window.setInterval(() => {
      next += 1;
      setStage(next);
      if (next >= LAST_STAGE) window.clearInterval(id);
    }, STAGE_MS);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <div>
      <EvolvingStructure stage={stage} className="w-full max-w-xs" />
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {SIGN_IN_COPY.benefits.map(({ id, title, body }) => {
          const Icon = ICONS[id];
          return (
            <li key={id} className="flex gap-4 py-4">
              <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-mark" />
              <div>
                {/* Not a heading: the h1 and the card's h2 own the outline. */}
                <p className="font-display text-sm font-bold">{title}</p>
                <p className="mt-1 text-sm text-muted">{body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 5: Run the test**

Run: `npx vitest run tests/signInStory.test.tsx --testTimeout=30000`
Expected: PASS, 6 tests. If the reduced-motion test fails because `reduce` is `null` on the first effect, that is the bug to fix in the component, not in the test.

- [ ] **Step 6: Add the import-boundary assertion**

In `web/tests/authChunkBoundary.test.ts`, inside the existing top-level `describe`, add (reuse the file's `closure` helper and `SRC`; adjust names to what the file actually defines):

```ts
  it("the sign-in story never reaches the auth client", () => {
    const { files, packages } = closure(["app/sign-in/SignInStory.tsx"].map((p) => join(SRC, p)));
    expect([...files].filter((f) => /lib\/auth\/client\.ts$/.test(f))).toEqual([]);
    expect([...packages].filter((p) => p.startsWith("better-auth"))).toEqual([]);
  });
```

Run: `npx vitest run tests/authChunkBoundary.test.ts --testTimeout=30000` → PASS.

- [ ] **Step 7: Prove it can fail**

Temporarily add `import { authClient } from "@/lib/auth/client";` (and use it, e.g. `void authClient;`) to `SignInStory.tsx`: the new boundary test FAILS. Then temporarily change `STAGE_MS` use so the effect never clears (remove the `clearInterval` inside the interval callback and keep looping `next` modulo 4): "rests on the graph" FAILS. Restore both and re-run the two test files: PASS.

- [ ] **Step 8: Typecheck, lint, commit**

Run: `npx tsc --noEmit && npx eslint src/app/sign-in src/lib/auth tests/signInStory.test.tsx tests/authChunkBoundary.test.ts` → clean (0 errors; the 9 pre-existing warnings elsewhere are fine).

```bash
git add src/lib/auth/signInCopy.ts src/app/sign-in/SignInStory.tsx tests/signInStory.test.tsx tests/authChunkBoundary.test.ts
git commit -m "feat(auth): sign-in story with the animated structure and three benefits"
```

---

### Task 2: Compose the page, update its tests, verify

**Files:**
- Modify: `web/src/app/sign-in/page.tsx`, `web/tests/signIn.test.tsx` (the `SignInPage` describe block only)

**Interfaces:**
- Consumes: `SIGN_IN_COPY`, `SignInStory` (Task 1); `SignInButtons` (unchanged).
- Produces: nothing new.

- [ ] **Step 1: Update the page tests first (they fail against the old page)**

In `web/tests/signIn.test.tsx`, replace the first test of `describe("SignInPage")` and extend the unavailable test:

```tsx
  it("renders the pitch, the benefits and the provider buttons when auth is configured", () => {
    for (const [k, v] of Object.entries(AUTH_ENV)) vi.stubEnv(k, v);
    const html = renderToStaticMarkup(<SignInPage />);
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>Pick up where you left off, on any device\.<\/h1>/);
    expect(html).toMatch(/<h2[^>]*>Sign in<\/h2>/);
    for (const { title, body } of SIGN_IN_COPY.benefits) {
      expect(html).toContain(title);
      expect(html).toContain(body);
    }
    expect(html).toContain("Continue with GitHub");
    expect(html).toContain("Continue with Google");
    expect(html).toContain(SIGN_IN_COPY.stored);
  });

  it("puts the card before the structure and benefits in reading order, so phones see the buttons first", () => {
    for (const [k, v] of Object.entries(AUTH_ENV)) vi.stubEnv(k, v);
    const html = renderToStaticMarkup(<SignInPage />);
    expect(html.indexOf("<h1")).toBeLessThan(html.indexOf("Sign in</h2>"));
    expect(html.indexOf("Sign in</h2>")).toBeLessThan(html.indexOf(SIGN_IN_COPY.benefits[0]!.title));
  });
```

Add `import { SIGN_IN_COPY } from "@/lib/auth/signInCopy";` to the imports, and in the unavailable test add:

```tsx
    expect(html).not.toContain(SIGN_IN_COPY.headline);
    expect(html).not.toContain(SIGN_IN_COPY.benefits[0]!.title);
```

Run: `npx vitest run tests/signIn.test.tsx --testTimeout=30000` → the two new tests FAIL (old page has no benefits and its `h1` is "Sign in").

- [ ] **Step 2: Rewrite `web/src/app/sign-in/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { isAuthConfigured } from "@/lib/auth/env";
import { SIGN_IN_COPY } from "@/lib/auth/signInCopy";
import { SignInButtons } from "./SignInButtons";
import { SignInStory } from "./SignInStory";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

// Static: the query string is read on the client (useSearchParams inside
// Suspense), so this page does not render per request. Whether auth is
// configured is therefore fixed at build time, exactly like the root layout's
// authEnabled, so the header and this page always agree.
export default function SignInPage() {
  if (!isAuthConfigured()) return <Unavailable />;
  return (
    // One DOM order (headline, card, structure and benefits) so a phone shows the
    // buttons before the story and a screen reader reads the same sequence; from
    // lg the grid places the card beside the other two.
    <div className="mx-auto grid max-w-5xl gap-y-10 px-6 py-12 md:px-16 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-x-16 lg:py-20">
      <header className="lg:col-start-1 lg:row-start-1">
        <h1 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">{SIGN_IN_COPY.headline}</h1>
        <p className="mt-4 max-w-prose text-base text-muted">{SIGN_IN_COPY.subline}</p>
      </header>
      <section
        aria-labelledby="sign-in-heading"
        className="w-full rounded-[length:var(--radius-lg)] border border-border bg-elevated p-8 shadow-elevation lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center"
      >
        <h2 id="sign-in-heading" className="font-display text-2xl font-bold tracking-tight">
          Sign in
        </h2>
        <Suspense fallback={<div className="mt-6 h-[6.25rem]" aria-hidden />}>
          <SignInButtons />
        </Suspense>
        <p className="mt-6 text-xs text-muted">{SIGN_IN_COPY.stored}</p>
      </section>
      <div className="lg:col-start-1 lg:row-start-2">
        <SignInStory />
      </div>
    </div>
  );
}

function Unavailable() {
  return (
    <div className="mx-auto flex max-w-md px-4 py-16 lg:py-24">
      <section className="w-full rounded-[length:var(--radius-lg)] border border-border bg-elevated p-8 shadow-elevation">
        <h1 className="font-display text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="mt-3 text-sm text-muted">Sign-in isn&apos;t available here. Your progress is saved on this device.</p>
        <Link
          href="/courses/dsa"
          className="mt-6 inline-flex h-10 items-center rounded-[length:var(--radius-md)] border border-border px-4 text-sm font-medium transition hover:bg-surface"
        >
          Back to the course
        </Link>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Run the page tests**

Run: `npx vitest run tests/signIn.test.tsx tests/signInStory.test.tsx tests/authChunkBoundary.test.ts --testTimeout=30000` → all PASS (the old "provider copy" line "Your progress and code follow you to any device." is gone from the page; if any existing test asserts it, update that assertion to the new headline and say so in the commit).

- [ ] **Step 4: Full checks**

```bash
npx tsc --noEmit
npx eslint src e2e tests
npm test -- --testTimeout=30000
npm run build 2>&1 | tee "$TMPDIR/build-signin.txt"
```

Expected: tsc clean; eslint 0 errors; the whole suite green; build exit 0 and `/sign-in` still `○` (Static) in the route table; every pre-existing route keeps its symbol (compare with `.superpowers/sdd/build-final.txt` if present).

- [ ] **Step 5: Look at it in a browser**

The accounts dev server is `http://localhost:3003` (auth is configured in `web/.env.local`, so the two-column page renders). Check, with screenshots you actually look at: `/sign-in` at 1280 px in light and dark; at 375 px (buttons above the fold, no horizontal scroll); the animation steps and rests on the graph; keyboard Tab reaches both provider buttons with a visible focus ring; `/sign-in?error=oauth` shows the alert above the buttons; a signed-in visit redirects to `/courses/dsa`; with `prefers-reduced-motion: reduce` emulated the graph shows at once. Then unset `DATABASE_URL` in a scratch env (or rely on the unit test) and confirm the unavailable card is unchanged. Say plainly which of these you could not do.

- [ ] **Step 6: Commit**

```bash
git add src/app/sign-in/page.tsx tests/signIn.test.tsx
git commit -m "feat(auth): richer sign-in page with the structure, three benefits and a privacy line"
```

---

## Spec coverage

| Spec section | Task |
| --- | --- |
| §2.1 layout, unavailable card unchanged | 2 |
| §2.2 copy, one source | 1 (copy), 2 (render) |
| §2.3 animation once, reduced motion | 1 |
| §2.4 file structure, no auth client in the story | 1 |
| §2.5 tokens, type, lamp | 1, 2 |
| §3 performance, still static | 2 (build) |
| §4 tests and browser pass | 1, 2 |

The spec says reduced motion renders the graph "immediately"; the plan does it in the first client effect (server and first render show stage 0) so hydration matches. That is the only deviation.
