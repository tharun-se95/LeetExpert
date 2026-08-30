# Coach Floating Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Coach drawer/rail (which resizes the code editor) with a floating launcher button and overlay panel that sit on top of the workspace.

**Architecture:** `IdeWithCoach` stops using `PanelSplit` entirely — the sandbox renders full-width and a new `CoachOverlay` portals a launcher FAB plus an animated floating panel into `document.body`. `CoachRail` is renamed `CoachPanel` (variant `"rail"` → `"floating"`); provider state `railOpen`/`setRailOpen` becomes `open`/`setOpen`, gaining a `closeCoach` action that returns focus to the launcher. Mobile's full-screen Coach tab (variant `"page"`) is untouched.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Tailwind CSS v4, `motion/react` (Framer Motion), Vitest 4, `@phosphor-icons/react`.

## Global Constraints

- Design spec: `docs/superpowers/specs/2026-08-30-coach-floating-panel-design.md`. Read it before starting.
- **No new design tokens.** Use only existing ones: `--radius-lg`, `--radius-md`, `--shadow-elevation` (via `.shadow-elevation`), `--dur-fast` (150ms), `--dur` (250ms), `--ease` (`cubic-bezier(0.2, 0, 0, 1)`).
- **No hardcoded Tailwind palette values** (`emerald-500`, `red-400`, …) and **no raw hex** in `.ts`/`.tsx` — `tests/design-tokens.test.ts` fails the build on both. Use semantic utilities only (`bg-pop`, `text-on-pop`, `bg-bad`, `bg-elevated`, `border-border`, `text-muted`, `text-foreground`, `ring-background`, `ring-accent`).
- **Never author `box-shadow` / `boxShadow` in a component** — `tests/design-tokens.test.ts` fails on it. Elevation comes from the `.shadow-elevation` class only.
- A fully-detached floating surface takes `.shadow-elevation` (all-around lift), **never** `.shadow-edge-*` (those are for panels attached to visible content on one side). This is the rule in `CLAUDE.md` §4.
- TypeScript strict: no `any`, no unchecked casts.
- Comments explain **why**, never what.
- All motion must be gated by `useReducedMotion()` from `motion/react`.
- Desktop-only scope: `IdeWithCoach` only renders when `ProblemWorkspace`'s `wide` state is true (matchMedia `min-width: 1024px`), so the launcher and panel are inherently desktop-only. Do **not** add extra `lg:` gates.
- Run all commands from `/Users/tharunk/DSA/web`.

## Testing Reality (read this before Task 5)

This repo has **no React Testing Library, no jsdom, and no component-rendering test setup** — `vitest` runs in a Node environment. Every existing test is either a pure-function test or a *source-scanning* test that reads component files as text (see `tests/design-tokens.test.ts`).

So "write a failing test first" here means a **source-scanning structural test**, and it is only used where it earns its keep: guarding a load-bearing, non-obvious decision that `tsc` cannot catch (a wrong class string, a removed portal). Renames and signature changes are already caught by `tsc` — do not write tests that duplicate the compiler.

Behavioural correctness is proven in the browser (Task 6), per `CLAUDE.md` §2: *"a green typecheck is not evidence that a feature works."*

## File Structure

| File | Responsibility |
| --- | --- |
| `src/components/coach/CoachProvider.tsx` | **Modify.** State + actions. Renames `railOpen`→`open`, `setRailOpen`→`setOpen`; adds `closeCoach` and `registerLauncherEl` for focus-return. |
| `src/components/coach/CoachPanel.tsx` | **Rename** from `CoachRail.tsx`. The panel's own chrome (header, privacy note, thread, composer). Variant `"floating"` (desktop) or `"page"` (mobile tab). |
| `src/components/coach/CoachLauncher.tsx` | **Create.** The floating action button: opens the coach, carries the unread dot, registers itself for focus-return. |
| `src/components/coach/CoachOverlay.tsx` | **Create.** Portal + mounted guard + `AnimatePresence`; owns the fixed positioning of launcher and panel. |
| `src/components/coach/IdeWithCoach.tsx` | **Modify.** Drops `PanelSplit`; renders `{sandbox}` full-width plus `<CoachOverlay />`. |
| `src/components/problems/PanelSplit.tsx` | **Modify.** Remove the now-unused `secondaryCollapsed` prop. |
| `src/components/problems/ProblemWorkspace.tsx` | **Modify.** Import rename only (`CoachRail` → `CoachPanel`). |
| `src/components/sandbox/Sandbox.tsx` | **Modify.** Remove the toolbar "Coach" button; rename `coach.railOpen` → `coach.open`. |
| `src/components/coach/CoachComposer.tsx` | **Modify.** Input pill goes `rounded-full` to match the panel's softer radius. |
| `tests/coach-ui.test.ts` | **Create.** Structural guards for the two load-bearing decisions `tsc` can't see. |

---

### Task 1: Provider — rename rail state and add focus-return plumbing

**Files:**
- Modify: `src/components/coach/CoachProvider.tsx`
- Modify: `src/components/coach/CoachRail.tsx` (call sites only — the file is renamed in Task 2)
- Modify: `src/components/sandbox/Sandbox.tsx` (call sites only)

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `CoachContextValue` gains `open: boolean`, `setOpen: (open: boolean) => void`, `closeCoach: () => void`, `registerLauncherEl: (el: HTMLElement | null) => void`. Removes `railOpen` and `setRailOpen`. All other fields unchanged.

- [ ] **Step 1: Rename the state field and its setter in `CoachProvider.tsx`**

In the `CoachContextValue` interface, replace these two lines:

```ts
  railOpen: boolean;
  setRailOpen: (open: boolean) => void;
```

with:

```ts
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Closes the panel AND returns focus to the launcher. */
  closeCoach: () => void;
```

Then add this field to the same interface, directly below the existing `registerComposerEl` declaration:

```ts
  /**
   * CoachLauncher calls this with its button element so this provider can
   * return focus to it when the panel closes — a floating disclosure that
   * drops focus on the document body is a keyboard dead end.
   */
  registerLauncherEl: (el: HTMLElement | null) => void;
```

- [ ] **Step 2: Rename the state variable and setter in the component body**

Change:

```tsx
  const [railOpen, setRailOpenState] = useState(false);
```

to:

```tsx
  const [open, setOpenState] = useState(false);
```

Then in the localStorage-restore effect change `setRailOpenState(...)` to `setOpenState(...)`:

```tsx
      setOpenState(window.localStorage.getItem(RAIL_KEY) === "1");
```

Leave the `RAIL_KEY` constant and its `"dsa:coach:rail-open"` string **exactly as they are**. The string is persisted in real learners' browsers, so renaming it would silently discard everyone's open/closed preference for the sake of tidiness — and the constant should keep matching the string it holds.

Then rename the `setRailOpen` callback:

```tsx
  const setOpen = useCallback((next: boolean) => {
    setOpenState(next);
    if (next) setUnread(false);
    try {
      window.localStorage.setItem(RAIL_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);
```

- [ ] **Step 3: Update the three internal call sites of the old names**

In `toggleCoach`:

```tsx
  const toggleCoach = useCallback(() => {
    if (isDesktopViewport()) {
      const opening = !open;
      setOpen(opening);
      // Only opening is a focus-worthy event — closing has nowhere to focus.
      if (opening) setFocusRequest((n) => n + 1);
      return;
    }
    setUnread(false);
    setMobileCoachTick((n) => n + 1);
  }, [open, setOpen]);
```

In `openCoach`, change `setRailOpen(true)` to `setOpen(true)` and the dependency array to `[setOpen]`.

In `reportRun`, change `setRailOpen(true)` to `setOpen(true)`, change `if (failed && !railOpen) setUnread(true);` to `if (failed && !open) setUnread(true);`, and update the dependency array from `[hintLabels.length, persistThread, railOpen, setRailOpen]` to `[hintLabels.length, persistThread, open, setOpen]`.

- [ ] **Step 4: Add the launcher registry and the close-with-focus-return action**

Directly below the existing `registerComposerEl` definition, add:

```tsx
  const launcherElRef = useRef<HTMLElement | null>(null);
  const registerLauncherEl = useCallback((el: HTMLElement | null) => {
    launcherElRef.current = el;
  }, []);
  const [closeRequest, setCloseRequest] = useState(0);
```

Then directly below the existing `focusRequest` effect, add:

```tsx
  // Focus returns to the launcher on an explicit close. Ordering is load
  // bearing and works because effects run child-before-parent: setting
  // `open` false remounts CoachLauncher, whose own effect registers its
  // element, and only then does this (ancestor) effect run and find it.
  // `isFirstRun` guards the initial mount so a page load never yanks focus.
  const isFirstCloseEffect = useRef(true);
  useEffect(() => {
    if (isFirstCloseEffect.current) {
      isFirstCloseEffect.current = false;
      return;
    }
    launcherElRef.current?.focus();
  }, [closeRequest]);

  const closeCoach = useCallback(() => {
    setOpen(false);
    setCloseRequest((n) => n + 1);
  }, [setOpen]);
```

- [ ] **Step 5: Update the context value object and its dependency array**

In the `useMemo` that builds `value`, replace `railOpen,` with `open,` and `setRailOpen,` with `setOpen,`, then add `closeCoach,` and `registerLauncherEl,`. Make the **same four edits** to the `useMemo` dependency array below it. Both lists must match.

- [ ] **Step 6: Update the two external call sites so the build stays green**

In `src/components/coach/CoachRail.tsx`, change the destructure on line 20 from `setRailOpen` to `closeCoach`:

```tsx
  const { closeCoach, clearThread, clearUnread, registerComposerEl } =
    useCoach();
```

Then change both `setRailOpen(false)` calls (the `onKeyDown` Escape handler and the close button's `onClick`) to `closeCoach()`.

In `src/components/sandbox/Sandbox.tsx`, change line 231 `aria-expanded={coach.railOpen}` to `aria-expanded={coach.open}`, and line 757 `coach.railOpen && "lg:hidden",` to `coach.open && "lg:hidden",`. In the comment directly above line 757, change the phrase `` `railOpen` is a desktop-rail concept `` to `` `open` is a desktop-panel concept ``.

- [ ] **Step 7: Verify the build is green**

Run: `npx tsc --noEmit && npx eslint src`
Expected: both produce no output. If `tsc` reports `Property 'railOpen' does not exist`, a call site was missed — fix it and re-run.

- [ ] **Step 8: Commit**

```bash
git add src/components/coach/CoachProvider.tsx src/components/coach/CoachRail.tsx src/components/sandbox/Sandbox.tsx
git commit -m "refactor(coach): rename rail state to open, add focus-return plumbing"
```

---

### Task 2: Float the coach — launcher, overlay portal, and panel restyle

This is one task because splitting it leaves a broken build: the moment `IdeWithCoach` stops rendering `CoachRail` in a pane, the launcher and overlay must already exist.

**Files:**
- Create: `src/components/coach/CoachLauncher.tsx`
- Create: `src/components/coach/CoachOverlay.tsx`
- Rename + modify: `src/components/coach/CoachRail.tsx` → `src/components/coach/CoachPanel.tsx`
- Modify: `src/components/coach/IdeWithCoach.tsx`
- Modify: `src/components/problems/ProblemWorkspace.tsx` (import + JSX name only)
- Modify: `src/components/sandbox/Sandbox.tsx` (remove toolbar button)

**Interfaces:**
- Consumes: from Task 1 — `useCoach()` returning `open`, `toggleCoach`, `closeCoach`, `unread`, `registerLauncherEl`, `registerComposerEl`, `clearThread`, `clearUnread`.
- Produces: `CoachLauncher` (no props), `CoachOverlay` (no props), `CoachPanel({ variant?: "floating" | "page"; active?: boolean })`.

- [ ] **Step 1: Create the launcher**

Create `src/components/coach/CoachLauncher.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { ChatCircle } from "@phosphor-icons/react";
import { useCoach } from "./CoachProvider";

/**
 * The coach's single entry point on desktop. Only rendered while the panel
 * is closed, so `aria-expanded` is honestly always false and the label can
 * promise "Open" without lying about what the click does.
 */
export function CoachLauncher() {
  const { toggleCoach, unread, registerLauncherEl } = useCoach();
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    registerLauncherEl(ref.current);
    return () => registerLauncherEl(null);
  }, [registerLauncherEl]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={toggleCoach}
      aria-label="Open problem coach"
      aria-expanded={false}
      className="shadow-elevation fixed right-6 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-pop text-on-pop transition-transform duration-[var(--dur-fast)] ease-[var(--ease)] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none motion-reduce:hover:scale-100"
    >
      <ChatCircle size={24} weight="fill" aria-hidden />
      {unread ? (
        <>
          {/*
            bg-bad, not bg-pop: the badge must stay legible against the
            launcher's own fill, and --pop is remapped per topic family, so a
            pop-on-pop badge would vanish on whichever family shares its hue.
          */}
          <span
            aria-hidden
            className="absolute top-1 right-1 h-3 w-3 rounded-full bg-bad ring-2 ring-background"
          />
          <span className="sr-only">New diagnosis</span>
        </>
      ) : null}
    </button>
  );
}
```

- [ ] **Step 2: Create the overlay (portal + animation)**

Create `src/components/coach/CoachOverlay.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCoach } from "./CoachProvider";
import { CoachLauncher } from "./CoachLauncher";
import { CoachPanel } from "./CoachPanel";

/**
 * Portals to document.body rather than positioning in place. This is load
 * bearing, not tidiness: PageEnter wraps route content in a motion.div, and
 * an ancestor `transform` makes that ancestor the containing block for any
 * `position: fixed` descendant — the panel would be fixed to the route
 * wrapper's box instead of the viewport. document.body has no such ancestor.
 */
export function CoachOverlay() {
  const { open } = useCoach();
  const reduceMotion = useReducedMotion();
  // createPortal needs a real document, which the server render has not got.
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <>
      {open ? null : <CoachLauncher />}
      <AnimatePresence>
        {open ? (
          <motion.div
            key="coach-panel"
            className="shadow-elevation fixed right-6 bottom-6 z-40 flex h-[40rem] max-h-[calc(100vh-6rem)] w-[26rem] origin-bottom-right flex-col overflow-hidden rounded-[length:var(--radius-lg)] border border-border bg-elevated"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 8 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
          >
            <CoachPanel variant="floating" />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>,
    document.body,
  );
}
```

Notes on the values above, so they are not "adjusted" arbitrarily later: `max-h-[calc(100vh-6rem)]` keeps the panel clear of the `h-14` (3.5rem) sticky header even on short viewports, which is why `z-40` (the header's own layer) is safe and why the panel still sits below the `z-50` modal layer that `SearchDialog` and `MobileLessonsSheet` use. `[0.2, 0, 0, 1]` is `--ease` expressed as the array `motion/react` needs.

**Do not add a backdrop, an overlay scrim, or click-outside-to-close.** Their absence is a decision, not an oversight: the core workflow is "read the coach's note, then click into the editor to act on it", and a widget that dismisses itself on precisely that click would defeat its own purpose. Escape (already handled inside `CoachPanel`) and the close button are the only dismissals.

- [ ] **Step 3: Rename the rail file to the panel file**

```bash
git mv src/components/coach/CoachRail.tsx src/components/coach/CoachPanel.tsx
```

- [ ] **Step 4: Rewrite the panel's shell for the floating variant**

In `src/components/coach/CoachPanel.tsx`, rename the exported function and change the variant type. Replace the whole declaration:

```tsx
export function CoachRail({
  variant = "rail",
  active = true,
}: {
  variant?: "rail" | "page";
  /** False while the mobile tab is hidden so we do not steal Code focus. */
  active?: boolean;
}) {
```

with:

```tsx
export function CoachPanel({
  variant = "floating",
  active = true,
}: {
  variant?: "floating" | "page";
  /** False while the mobile tab is hidden so we do not steal Code focus. */
  active?: boolean;
}) {
```

Then replace every remaining `variant !== "rail"` / `variant === "rail"` comparison in the file with `!== "floating"` / `=== "floating"` respectively. There are four: one in the composer-registration effect, and three in the returned JSX (the `<section>` className, the header className, and the header's title/close-button branches).

- [ ] **Step 5: Drop the rail's border and edge shadow from the section**

`CoachOverlay` now owns the panel's border, radius, and elevation, so the section must not paint a second border or an edge shadow. Replace the `<section>`'s `className` block:

```tsx
      className={cn(
        "flex h-full min-h-0 flex-col bg-elevated",
        // Only the rail variant borders visible workspace to its left; the
        // page (mobile) variant fills its own full-screen tab with nothing
        // beside it to cast a shadow onto.
        variant === "rail" ? "border-l border-border shadow-edge-left" : "",
      )}
```

with:

```tsx
      // No border, radius, or shadow here: CoachOverlay owns the floating
      // surface's own chrome, and the page (mobile) variant fills its tab.
      className="flex h-full min-h-0 flex-col bg-elevated"
```

Also delete the now-unused `cn` import if nothing else in the file uses it — check with `grep -n "cn(" src/components/coach/CoachPanel.tsx` first; the header still uses it, so it should stay.

- [ ] **Step 5a: Mark the section as a non-modal dialog**

Add `role="dialog"` to the `<section>`, keeping its existing `aria-label="Problem coach"`:

```tsx
    <section
      aria-label="Problem coach"
      // Non-modal on purpose: no aria-modal and no focus trap, because the
      // whole point of floating over the workspace is that the editor stays
      // usable while the coach is open.
      role={variant === "floating" ? "dialog" : undefined}
      onKeyDown={onKeyDown}
```

The mobile `"page"` variant keeps no role — it is a tab panel there, and `ProblemWorkspace` already supplies `role="tabpanel"` on its wrapper.

- [ ] **Step 6: Point the close button at `closeCoach` and label it for a panel**

Confirm the close button (added in Task 1 Step 6) reads:

```tsx
          <button
            type="button"
            aria-label="Close problem coach"
            onClick={closeCoach}
            className="-mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] text-muted hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X size={16} weight="bold" />
          </button>
```

Remove the bare `aria-expanded` attribute if still present — it was meaningful on a rail that was part of layout, but on a close button inside a panel that is already open it says nothing.

- [ ] **Step 7: Rewrite `IdeWithCoach` to stop splitting the pane**

Replace the entire contents of `src/components/coach/IdeWithCoach.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";
import { CoachOverlay } from "./CoachOverlay";

export function IdeWithCoach({ sandbox }: { sandbox: ReactNode }) {
  return (
    <div className="h-full min-h-0 min-w-0 overflow-hidden">
      {sandbox}
      <CoachOverlay />
    </div>
  );
}
```

- [ ] **Step 8: Update `ProblemWorkspace`'s import and mobile usage**

In `src/components/problems/ProblemWorkspace.tsx` line 28, change:

```tsx
import { CoachRail } from "@/components/coach/CoachRail";
```

to:

```tsx
import { CoachPanel } from "@/components/coach/CoachPanel";
```

and at line 362 change `<CoachRail variant="page" active={showCoach} />` to `<CoachPanel variant="page" active={showCoach} />`.

- [ ] **Step 9: Remove the sandbox toolbar's Coach button**

In `src/components/sandbox/Sandbox.tsx`, delete this entire block (lines ~226–240) — the launcher is now the single entry point:

```tsx
        {variant === "ide" && coach ? (
          <button
            type="button"
            onClick={coach.toggleCoach}
            aria-label="Toggle problem coach"
            aria-expanded={coach.open}
            className="inline-flex h-11 items-center gap-1.5 rounded-[length:var(--radius-md)] px-2 text-[0.7rem] text-muted transition-colors hover:bg-code hover:text-foreground"
          >
            <ChatCircle size={12} weight="bold" aria-hidden />
            Coach
            {coach.unread ? (
              <span className="h-1.5 w-1.5 rounded-full bg-pop" aria-hidden />
            ) : null}
          </button>
        ) : null}
```

- [ ] **Step 10: Clean up now-unused imports in `Sandbox.tsx`**

Run: `npx eslint src/components/sandbox/Sandbox.tsx`

If it reports `ChatCircle` is unused, remove it from the `@phosphor-icons/react` import. If it reports the `coach` variable from `useCoachOptional()` is now unused **inside the toolbar component**, check whether that component still uses `coach` elsewhere before removing the call — `CoachFailBanner` has its own separate `useCoachOptional()` call and must keep it.

- [ ] **Step 11: Verify the build is green**

Run: `npx tsc --noEmit && npx eslint src`
Expected: no output from either.

- [ ] **Step 12: Commit**

```bash
git add -A src/components/coach src/components/problems/ProblemWorkspace.tsx src/components/sandbox/Sandbox.tsx
git commit -m "feat(coach): float the coach as a launcher and overlay panel"
```

---

### Task 3: Remove `PanelSplit`'s now-unused `secondaryCollapsed` prop

**Files:**
- Modify: `src/components/problems/PanelSplit.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks except the fact that Task 2 removed the last caller.
- Produces: `PanelSplit` without a `secondaryCollapsed` prop. Its remaining props are unchanged.

- [ ] **Step 1: Confirm there are genuinely no callers left**

Run: `grep -rn "secondaryCollapsed" src/`
Expected: only matches inside `src/components/problems/PanelSplit.tsx` itself. If any other file matches, **stop** — Task 2 was left incomplete; finish it before removing the prop.

- [ ] **Step 2: Delete the prop, its type, and its documentation comment**

In `src/components/problems/PanelSplit.tsx`, remove `secondaryCollapsed = false,` from the destructured parameters, and remove this whole block from the type literal:

```tsx
  /**
   * Primary fills the container; the handle and secondary are not rendered.
   * This is how a caller closes the secondary pane WITHOUT switching which
   * element type wraps `primary` at the call site — doing that (e.g.
   * returning a bare div instead of <PanelSplit>) makes React treat it as a
   * different tree and remount everything inside `primary`, discarding any
   * state it holds. PanelSplit itself stays mounted across the toggle, so
   * `primary`'s subtree never unmounts.
   */
  secondaryCollapsed?: boolean;
```

- [ ] **Step 3: Unconditional-ise the three places that branched on it**

Change the `primaryStyle` computation from:

```tsx
  const primaryStyle = secondaryCollapsed
    ? undefined
    : horizontal
      ? { width: `${primaryFrac * 100}%` }
      : { height: `${primaryFrac * 100}%` };
```

to:

```tsx
  const primaryStyle = horizontal
    ? { width: `${primaryFrac * 100}%` }
    : { height: `${primaryFrac * 100}%` };
```

Change the primary pane's className from:

```tsx
        className={cn(
          "flex h-full min-h-0 min-w-0 flex-col overflow-hidden",
          secondaryCollapsed ? "w-full flex-1" : "w-full",
        )}
```

to:

```tsx
        className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden"
```

Then unwrap the handle and secondary pane — replace `{secondaryCollapsed ? null : (<>…</>)}` with its contents directly, dropping the `<>`/`</>` fragment and the ternary.

- [ ] **Step 4: Remove `cn` if it is now unused**

Run: `grep -n "cn(" src/components/problems/PanelSplit.tsx`
If there are no matches, remove `import { cn } from "@/lib/utils";` from the top of the file. `eslint` in the next step will catch it either way.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npx eslint src`
Expected: no output from either.

- [ ] **Step 6: Commit**

```bash
git add src/components/problems/PanelSplit.tsx
git commit -m "refactor(problems): drop PanelSplit secondaryCollapsed, now unused"
```

---

### Task 4: Visual polish inside the panel

**Files:**
- Modify: `src/components/coach/CoachComposer.tsx`
- Modify: `src/components/coach/CoachPanel.tsx`

**Interfaces:**
- Consumes: `CoachPanel` from Task 2.
- Produces: no API change — presentation only.

- [ ] **Step 1: Round the composer's input pill**

In `src/components/coach/CoachComposer.tsx`, change the input wrapper's className from:

```tsx
      <div className="flex items-end gap-1.5 rounded-[length:var(--radius-md)] border border-border bg-code px-2 py-1.5">
```

to:

```tsx
      {/* Fully rounded to echo the floating panel's own softer corners — a
          sharp 12px rectangle inside a 20px-radius card reads as unfinished. */}
      <div className="flex items-end gap-1.5 rounded-full border border-border bg-code px-2 py-1.5">
```

- [ ] **Step 2: Give the panel header a little more presence**

In `src/components/coach/CoachPanel.tsx`, the header mark is currently `h-8 w-8` with a `size={17}` icon. Change to `h-9 w-9` and `size={19}`:

```tsx
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] bg-pop text-on-pop"
            >
              <ChatCircle size={19} weight="fill" />
            </span>
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npx eslint src`
Expected: no output from either.

- [ ] **Step 4: Commit**

```bash
git add src/components/coach/CoachComposer.tsx src/components/coach/CoachPanel.tsx
git commit -m "style(coach): soften composer pill and lift panel masthead"
```

---

### Task 5: Structural regression tests

Read the **Testing Reality** section above first. These two assertions guard decisions `tsc` cannot see: a silently-wrong shadow class, and a removed portal that would reintroduce the `PageEnter` transform bug. Nothing here re-tests what the compiler already enforces.

**Files:**
- Create: `tests/coach-ui.test.ts`

**Interfaces:**
- Consumes: `src/components/coach/CoachOverlay.tsx` from Task 2 (read as text).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Write the failing test**

Create `tests/coach-ui.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(import.meta.dirname, "..", "src");
const OVERLAY = join(SRC, "components", "coach", "CoachOverlay.tsx");

describe("coach floating overlay", () => {
  it("portals to document.body", () => {
    // Load bearing, and invisible to the type checker: PageEnter wraps route
    // content in a motion.div whose inline `transform` becomes the containing
    // block for any fixed-position descendant. Drop the portal and the panel
    // silently anchors to the route wrapper instead of the viewport.
    const body = readFileSync(OVERLAY, "utf8");
    expect(body).toMatch(/createPortal\(/);
    expect(body).toMatch(/document\.body/);
  });

  it("lifts the floating panel with the all-around elevation shadow", () => {
    // A detached floating surface takes .shadow-elevation; .shadow-edge-* is
    // for panels attached to visible content on exactly one side (CLAUDE.md
    // §4). The old rail was edge-left; carrying that over would light the
    // panel from one side with nothing beside it to justify the direction.
    const body = readFileSync(OVERLAY, "utf8");
    expect(body).toMatch(/shadow-elevation/);
    expect(body).not.toMatch(/shadow-edge-/);
  });
});
```

- [ ] **Step 2: Run it and confirm it passes for the right reason**

Run: `npx vitest run tests/coach-ui.test.ts`
Expected: 2 passed.

- [ ] **Step 3: Prove each test can actually fail**

`CLAUDE.md` §2 requires this — a test that has never failed is not a test.

First fault: in `src/components/coach/CoachOverlay.tsx`, temporarily change `shadow-elevation` to `shadow-edge-left` in the `motion.div` className. Run `npx vitest run tests/coach-ui.test.ts`. Expected: the elevation test FAILS on both assertions. Restore it.

Second fault: temporarily comment out the `createPortal(` call and return the fragment directly. Run `npx vitest run tests/coach-ui.test.ts`. Expected: the portal test FAILS. Restore it.

Run `npx vitest run tests/coach-ui.test.ts` once more.
Expected: 2 passed, with both files back to their committed state (`git diff src/` should be empty).

- [ ] **Step 4: Commit**

```bash
git add tests/coach-ui.test.ts
git commit -m "test(coach): guard overlay portal and elevation shadow choice"
```

---

### Task 6: Full verification

**Files:** none modified unless a defect is found.

**Interfaces:**
- Consumes: everything from Tasks 1–5.
- Produces: a verified feature.

- [ ] **Step 1: Run the full static battery**

```bash
npx tsc --noEmit && npx eslint src && npm test && npm run build
```

Expected: `tsc` and `eslint` silent; `npm test` reports 28 test files passing with 561 tests (559 before this plan, plus the 2 new ones); `npm run build` ends with the route table and no errors. If the test count differs, read the failure — do not adjust the expectation to match.

- [ ] **Step 2: Start the dev server and open a problem page**

Use `mcp__Claude_Browser__preview_start` (never `Bash` for dev servers). Navigate to a problem page, e.g. `http://localhost:3002/problems/move-zeroes`, at a viewport ≥1024px wide.

- [ ] **Step 3: Verify the launcher and the portal fix**

Confirm by screenshot that the launcher renders as a circular filled button at the bottom-right of the viewport, and confirm with `javascript_tool` that it is a child of `document.body`, not of the route wrapper:

```js
const b = document.querySelector('button[aria-label="Open problem coach"]');
({ parentIsBody: b.parentElement === document.body,
   rect: b.getBoundingClientRect().toJSON(),
   viewport: { w: innerWidth, h: innerHeight } })
```

Expected: `parentIsBody` is `true`, and the button's `right`/`bottom` sit ~24px from `innerWidth`/`innerHeight`. This is the specific check that proves the `PageEnter` transform is not capturing the fixed positioning — reasoning about it is not sufficient.

- [ ] **Step 4: Verify open, close, and focus return**

Click the launcher. Confirm the panel animates in at the bottom-right, the launcher is gone, and focus landed in the composer textarea (`document.activeElement.id === "coach-input"`).

Press Escape while focus is inside the panel. Confirm the panel closes, the launcher returns, and focus is back on it:

```js
document.activeElement?.getAttribute("aria-label")
```

Expected: `"Open problem coach"`. Note that `javascript_tool` reads state from the same tick as a preceding click can leave stale — issue the click and the read as **two separate calls**.

- [ ] **Step 5: Verify the unread badge and the auto-open focus guarantee**

Write a deliberately wrong solution in the editor and run it. Confirm: the panel auto-opens on the first failing run **without** stealing focus from the editor (this is an existing guarantee that the rename must not have broken — `document.activeElement` should still be inside the CodeMirror editor, not the composer).

Close the panel, run a failing case again, and confirm the launcher shows the `bg-bad` unread dot. Open it and confirm the dot clears.

- [ ] **Step 6: Verify both themes and reduced motion**

Screenshot the open panel in light and dark themes. Confirm the panel reads as a lifted card in both — a visible border, rounded corners, and a soft shadow, sitting clearly above the editor behind it.

Then verify the reduced-motion branch. `useReducedMotion()` reads `prefers-reduced-motion`, so confirm the guard is actually wired rather than trying to flip the OS setting from the browser tool: with the panel closed, run

```js
matchMedia("(prefers-reduced-motion: reduce)").matches
```

and record the value. If it is `true` (the machine is set that way), open the panel and confirm a plain fade with no scale or slide. If it is `false`, say so in the report and note that the reduced-motion path was verified by code inspection only — do not claim a visual check that did not happen.

- [ ] **Step 7: Verify the mobile path is untouched**

Resize to 375px wide. Confirm the Coach tab still exists in the mobile tab strip, still opens the full-screen coach, and that **no** floating launcher appears at any point (`IdeWithCoach` should be unmounted entirely below 1024px).

- [ ] **Step 8: Report**

Report what was verified and how, distinguishing "ran it and it passed" from anything left unproven, per `CLAUDE.md` §6. If any step failed, fix it and re-run the full static battery from Step 1 before reporting.
