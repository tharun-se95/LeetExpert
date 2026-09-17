# Coach Column Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On a problem workspace wide enough, the coach is a collapsible, resizable column beside the editor instead of a panel floating over it.

**Architecture:**
- **Threshold:** a pure function decides column vs floating from the measured workspace row and CSS tokens.
- **PanelSplit** gains an optional, secondary-sized, persistable pane, so the sandbox stays its primary in every mode and is never remounted.
- **CoachProvider** tracks the layout and keeps a separate, remembered open state for the column; a failing run never expands it.
- **IdeWithCoach** measures, reports the layout, and renders the column, the collapsed strip, or the floating overlay.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, Vitest 4 + jsdom, Playwright MCP.

Spec: `docs/superpowers/specs/2026-09-17-coach-column-design.md`.

## Global Constraints

- Tokens: `--ide-editor-min: 40rem`, `--coach-column-min: 20rem`, `--coach-column-width: 26rem` in `:root`.
- Storage keys: `dsa:coach:rail-open` (floating, unchanged, default closed), `dsa:coach:column-open` (default open), `dsa:coach:column-width` (rem number).
- The sandbox is always `PanelSplit`'s `primary` inside `IdeWithCoach`; never branch its position in the tree.
- A failing run never expands the column. Escape does nothing in column mode.
- Colour through tokens only; focus is the global `:focus-visible` outline or the patterns already in these files.
- Every new test is seen failing before it passes; read vitest's exit code directly.
- Commits end with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- Commands run from `/Users/tharunk/leetExpert/.worktrees/coach-column/web`.

---

### Task 1: Threshold function and tokens

**Files:**
- Create: `web/src/lib/coach/coachColumn.ts`
- Modify: `web/src/app/globals.css`
- Test: `web/tests/coachColumn.test.ts`

**Interfaces:** Produces `coachColumnFits(sizes: CoachColumnSizes): boolean`, `lengthToPx(value: string, rootPx: number): number`, and CSS classes `.ide-editor-pane` and `.coach-column`.

- [ ] **Step 1: Write the failing test** `web/tests/coachColumn.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { coachColumnFits, lengthToPx } from "@/lib/coach/coachColumn";

const globals = readFileSync(join(__dirname, "..", "src", "app", "globals.css"), "utf8");
const token = (name: string) => new RegExp(`--${name}:\\s*([^;]+);`).exec(globals)?.[1]?.trim() ?? "";

describe("coach column threshold", () => {
  it("resolves rem and px tokens against the root size", () => {
    expect(lengthToPx("40rem", 15)).toBe(600);
    expect(lengthToPx(" 300px ", 15)).toBe(300);
    expect(lengthToPx("auto", 15)).toBeNaN();
  });

  it("fits only when the row holds the capped description, both minimums and two handles", () => {
    // At the 15px root: description cap 542.2px (measured), 40rem editor, 20rem
    // coach, 3.75px handles — 1449.7px of workspace.
    const sizes = {
      descriptionCap: 542.2,
      editorMin: lengthToPx(token("ide-editor-min"), 15),
      coachMin: lengthToPx(token("coach-column-min"), 15),
      handle: 3.75,
    };
    expect(sizes.editorMin).toBe(600);
    expect(sizes.coachMin).toBe(300);
    expect(coachColumnFits({ ...sizes, workspace: 1449 })).toBe(false);
    expect(coachColumnFits({ ...sizes, workspace: 1450 })).toBe(true);
  });

  it("never fits on a measurement it cannot trust", () => {
    const sizes = { workspace: 4000, descriptionCap: 542, editorMin: 600, coachMin: 300, handle: 4 };
    expect(coachColumnFits({ ...sizes, descriptionCap: NaN })).toBe(false);
    expect(coachColumnFits({ ...sizes, editorMin: NaN })).toBe(false);
  });

  it("opens the coach at the floating panel's width, and floors both panes", () => {
    expect(token("coach-column-width")).toBe("26rem");
    expect(globals).toMatch(/\n\.ide-editor-pane \{\s*min-width: var\(--ide-editor-min\);\s*\}/);
    expect(globals).toMatch(
      /\n\.coach-column \{\s*width: var\(--coach-column-width\);\s*min-width: var\(--coach-column-min\);\s*\}/,
    );
  });
});
```

- [ ] **Step 2: Run it and see it fail.** `npx vitest run tests/coachColumn.test.ts; echo "exit=$?"` → exit 1 (module missing).

- [ ] **Step 3: Implement** `web/src/lib/coach/coachColumn.ts`:

```ts
/**
 * Whether the problem workspace can hold the coach as a column beside the
 * editor rather than floating over it. Measured on the workspace row, not the
 * viewport: the lessons drawer docks in flow and narrows it.
 * Spec: docs/superpowers/specs/2026-09-17-coach-column-design.md §4
 */
export interface CoachColumnSizes {
  /** The workspace row (description + IDE), px. */
  workspace: number;
  /** The description pane's computed max-width, px. */
  descriptionCap: number;
  /** --ide-editor-min, px. */
  editorMin: number;
  /** --coach-column-min, px. */
  coachMin: number;
  /** One split handle, px. */
  handle: number;
}

export function coachColumnFits(sizes: CoachColumnSizes): boolean {
  // An unresolved token or an unmounted pane measures NaN; floating is the
  // layout that always fits, so doubt falls back to it.
  if (!Object.values(sizes).every((n) => Number.isFinite(n) && n >= 0)) return false;
  const { workspace, descriptionCap, editorMin, coachMin, handle } = sizes;
  return workspace >= descriptionCap + editorMin + coachMin + 2 * handle;
}

/** A length token ("40rem", "300px") in px against the root font size; NaN otherwise. */
export function lengthToPx(value: string, rootPx: number): number {
  const match = /^\s*(\d*\.?\d+)(rem|px)\s*$/.exec(value);
  if (!match) return NaN;
  const n = Number(match[1]);
  return match[2] === "rem" ? n * rootPx : n;
}
```

In `web/src/app/globals.css`, directly after `  --problem-prose-scale: 0.875;` add:

```css
  /*
    The coach column (spec 2026-09-17-coach-column-design.md): the editor's and
    the coach's minimum widths decide whether the workspace can hold the column
    at all (lib/coach/coachColumn.ts); it opens at the floating panel's width.
  */
  --ide-editor-min: 40rem;
  --coach-column-min: 20rem;
  --coach-column-width: 26rem;
```

Directly before the `/*` comment that introduces `.problem-description-pane`, add:

```css
/*
  Coach column panes. The editor's floor is applied only in column mode, where
  the threshold guarantees the row can hold it. PanelSplit reads both floors to
  bound the editor/coach drag, and the coach may shrink to its floor when the
  row is narrower than its opening width.
*/
.ide-editor-pane {
  min-width: var(--ide-editor-min);
}

.coach-column {
  width: var(--coach-column-width);
  min-width: var(--coach-column-min);
}

```

- [ ] **Step 4: Verify.** `npx vitest run tests/coachColumn.test.ts; echo "exit=$?"` → 0. `npx tsc --noEmit; echo "tsc=$?"` → 0.

- [ ] **Step 5: Commit.**

```bash
git add src/lib/coach/coachColumn.ts src/app/globals.css tests/coachColumn.test.ts
git commit -m "feat(coach): threshold and tokens for the coach column

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: PanelSplit — optional, secondary-sized, remembered pane

**Files:**
- Modify: `web/src/components/problems/PanelSplit.tsx` (whole file)
- Test: `web/tests/panelSplit.test.tsx` (append)

**Interfaces:** Produces the `PanelSplit` props `secondary: ReactNode | null`, `sizedPane?: "primary" | "secondary"`, `resizable?: boolean`, `storageKey?: string` and `secondaryClassName?: string`, plus `data-split-handle` on the handle.

- [ ] **Step 1: Append failing tests** to `web/tests/panelSplit.test.tsx`. Change the `react` import to `import { act, useState, type ReactElement, type ReactNode } from "react";`, then append (using `ReactElement` / `ReactNode` where the code below says `React.ReactElement` / `React.ReactNode`):

```tsx
function Counter() {
  const [n, setN] = useState(0);
  return (
    <button type="button" data-counter onClick={() => setN((v) => v + 1)}>
      {n}
    </button>
  );
}

describe("PanelSplit with a secondary-sized pane", () => {
  function mountSplit() {
    const host = document.createElement("div");
    document.body.append(host);
    const created = createRoot(host);
    root = created;
    return { host, render: (ui: React.ReactElement) => act(() => created.render(ui)) };
  }

  it("keeps the primary mounted when the secondary appears, disappears or stops resizing", () => {
    // The sandbox is the primary: a remount would wipe its run results.
    const { host, render } = mountSplit();
    const split = (secondary: React.ReactNode, resizable = true) => (
      <PanelSplit
        orientation="horizontal"
        sizedPane="secondary"
        resizable={resizable}
        primary={<Counter />}
        secondary={secondary}
      />
    );
    render(split(null));
    const counter = host.querySelector("[data-counter]");
    if (!(counter instanceof HTMLButtonElement)) throw new Error("no counter");
    expect(host.querySelector("[data-split-handle]")).toBeNull();
    act(() => counter.click());
    render(split(<p>coach</p>));
    expect(host.querySelector("[data-split-handle]")).not.toBeNull();
    render(split(<p>strip</p>, false));
    expect(host.querySelector("[data-split-handle]")).toBeNull();
    render(split(null));
    expect(host.querySelector("[data-counter]")).toBe(counter);
    expect(counter.textContent).toBe("1");
  });

  it("bounds a secondary drag by both panes' floors, in rem, and remembers it", () => {
    const style = document.createElement("style");
    style.textContent = ".side { min-width: 200px; max-width: 600px; } .main { min-width: 500px; }";
    document.head.append(style);
    document.documentElement.style.fontSize = "20px";
    localStorage.clear();
    const { host, render } = mountSplit();
    const split = (
      <PanelSplit
        orientation="horizontal"
        sizedPane="secondary"
        storageKey="test:split"
        primaryClassName="main"
        secondaryClassName="side"
        primary={<p>editor</p>}
        secondary={<p>coach</p>}
      />
    );
    render(split);
    const container = host.firstElementChild;
    if (!(container instanceof HTMLElement)) throw new Error("no container");
    container.getBoundingClientRect = () => new DOMRect(0, 0, 1000, 600);
    const handle = host.querySelector("[data-split-handle]");
    const side = container.lastElementChild;
    if (!handle || !(side instanceof HTMLElement)) throw new Error("no panes");
    const move = (clientX: number) =>
      act(() => {
        window.dispatchEvent(Object.assign(new Event("pointermove"), { clientX, clientY: 10 }));
      });

    act(() => {
      handle.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));
    });
    move(900); // 100px wanted, the coach's 200px floor wins
    expect(side.style.width).toBe("10rem");
    move(200); // 800px wanted: 600px cap, but the editor keeps its 500px floor
    expect(side.style.width).toBe("25rem");
    move(650);
    expect(side.style.width).toBe("17.5rem");
    act(() => {
      window.dispatchEvent(new Event("pointerup"));
    });
    expect(localStorage.getItem("test:split")).toBe("17.5");

    act(() => root?.unmount());
    const again = mountSplit();
    again.render(split);
    const restored = again.host.firstElementChild?.lastElementChild;
    expect(restored instanceof HTMLElement && restored.style.width).toBe("17.5rem");
    document.documentElement.style.fontSize = "";
  });
});
```

- [ ] **Step 2: Run and see them fail.** `npx vitest run tests/panelSplit.test.tsx; echo "exit=$?"` → exit 1.

- [ ] **Step 3: Replace `web/src/components/problems/PanelSplit.tsx`** with:

```tsx
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DotsSixVertical } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/** A computed length in px, or null for "none", "auto" or unset. */
function computedPx(value: string | undefined): number | null {
  const n = parseFloat(value ?? "");
  return Number.isFinite(n) ? n : null;
}

function readStoredRem(key: string | undefined): number | null {
  if (!key) return null;
  try {
    const raw = window.localStorage.getItem(key);
    const n = raw === null ? NaN : Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

/**
 * Two-pane split with a drag handle. By default the handle sizes the primary
 * as a fraction of the container, clamped so neither pane collapses into
 * unreadability. With sizedPane="secondary" it sizes the secondary in rem
 * instead (optionally remembered), and the primary takes the rest.
 *
 * The primary is always the first child, in every mode: a secondary that
 * comes, goes or stops resizing never remounts it. The problem workspace's
 * sandbox lives there, and a remount would wipe its run results.
 */
export function PanelSplit({
  orientation,
  primary,
  secondary,
  initialPrimary = 0.5,
  minPrimary = 0.25,
  maxPrimary = 0.75,
  className,
  primaryClassName,
  secondaryClassName,
  sizedPane = "primary",
  resizable = true,
  storageKey,
  resizeLabel,
}: {
  orientation: "horizontal" | "vertical";
  primary: ReactNode;
  /** null: the primary fills the split and there is no handle. */
  secondary: ReactNode | null;
  initialPrimary?: number;
  minPrimary?: number;
  maxPrimary?: number;
  className?: string;
  /** Classes for the primary pane; a CSS max- or min-width there also bounds the drag. */
  primaryClassName?: string;
  /** Classes for the secondary pane; with sizedPane="secondary" its CSS limits bound the drag. */
  secondaryClassName?: string;
  /** Which pane the handle sizes. */
  sizedPane?: "primary" | "secondary";
  /** false: no handle and no applied size, for a fixed secondary such as a collapsed strip. */
  resizable?: boolean;
  /** Remembers the secondary's size in rem (sizedPane="secondary" only). */
  storageKey?: string;
  resizeLabel?: string;
}) {
  const [primaryFrac, setPrimaryFrac] = useState(initialPrimary);
  const [secondaryRem, setSecondaryRem] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLDivElement>(null);
  const secondaryRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);
  const dragging = useRef(false);
  const draggedRem = useRef<number | null>(null);

  // Read after mount: storage does not exist during the server render.
  useEffect(() => {
    setSecondaryRem(readStoredRem(storageKey));
  }, [storageKey]);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const horizontal = orientation === "horizontal";
      const size = horizontal ? rect.width : rect.height;
      if (size <= 0) return;

      if (sizedPane === "secondary") {
        const secondaryEl = secondaryRef.current;
        const primaryEl = primaryRef.current;
        if (!secondaryEl || !primaryEl) return;
        const s = getComputedStyle(secondaryEl);
        const p = getComputedStyle(primaryEl);
        const handleBox = handleRef.current?.getBoundingClientRect();
        const handle = (horizontal ? handleBox?.width : handleBox?.height) ?? 0;
        const wanted = horizontal ? rect.right - e.clientX : rect.bottom - e.clientY;
        const floor = computedPx(horizontal ? s.minWidth : s.minHeight) ?? 0;
        const cap = computedPx(horizontal ? s.maxWidth : s.maxHeight) ?? Infinity;
        // The primary's own floor caps the secondary too: dragging the coach
        // wider must never squeeze the editor below its minimum.
        const primaryFloor = computedPx(horizontal ? p.minWidth : p.minHeight) ?? 0;
        const px = Math.max(floor, Math.min(cap, size - handle - primaryFloor, wanted));
        const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        // rem, not px: the app steps its root size with the viewport, and a
        // remembered px width would drift against everything around it.
        const rem = Math.round((px / rootPx) * 1000) / 1000;
        draggedRem.current = rem;
        setSecondaryRem(rem);
        return;
      }

      const raw = horizontal
        ? (e.clientX - rect.left) / rect.width
        : (e.clientY - rect.top) / rect.height;
      // A CSS size limit on the pane bounds the drag too. Past a max-width the
      // pane stops growing while the stored fraction would not, so the handle
      // would run on with nothing following it. A min-width is a floor that
      // holds on any screen, so it relaxes the fractional one: on a wide
      // screen that fraction can exceed the cap and lock the pane in place.
      const style = primaryRef.current ? getComputedStyle(primaryRef.current) : null;
      const px = (value: string | undefined) => {
        const n = parseFloat(value ?? "");
        return Number.isFinite(n) ? n / size : null;
      };
      const cap = px(horizontal ? style?.maxWidth : style?.maxHeight);
      const floor = px(horizontal ? style?.minWidth : style?.minHeight);
      const max = cap === null ? maxPrimary : Math.min(maxPrimary, cap);
      const min = Math.min(floor === null ? minPrimary : Math.min(minPrimary, floor), max);
      setPrimaryFrac(Math.min(max, Math.max(min, raw)));
    },
    [orientation, minPrimary, maxPrimary, sizedPane],
  );

  const stopDrag = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    if (storageKey && draggedRem.current !== null) {
      try {
        window.localStorage.setItem(storageKey, String(draggedRem.current));
      } catch {
        // Private mode: the width still holds for this visit.
      }
    }
    draggedRem.current = null;
  }, [storageKey]);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDrag);
    window.addEventListener("pointercancel", stopDrag);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopDrag);
      window.removeEventListener("pointercancel", stopDrag);
    };
  }, [onPointerMove, stopDrag]);

  const startDrag = () => {
    dragging.current = true;
    document.body.style.cursor =
      orientation === "horizontal" ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";
  };

  const horizontal = orientation === "horizontal";
  const hasSecondary = secondary !== null;
  const sizesSecondary = sizedPane === "secondary";
  const primaryStyle =
    hasSecondary && !sizesSecondary
      ? horizontal
        ? { width: `${primaryFrac * 100}%` }
        : { height: `${primaryFrac * 100}%` }
      : undefined;
  const secondaryStyle =
    sizesSecondary && resizable && secondaryRem !== null
      ? horizontal
        ? { width: `${secondaryRem}rem` }
        : { height: `${secondaryRem}rem` }
      : undefined;

  return (
    <div
      ref={containerRef}
      className={cn(
        // h-full/w-full fill a sized block parent (nested splits). flex-1
        // fills when this node is itself a flex item. Without both, the
        // inner IDE column sizes to content and leaves a dead band below.
        "flex h-full min-h-0 min-w-0 w-full flex-1",
        horizontal ? "flex-row" : "flex-col",
        className,
      )}
    >
      <div
        ref={primaryRef}
        className={cn(
          "flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden",
          (sizesSecondary || !hasSecondary) && "flex-1",
          primaryClassName,
        )}
        style={primaryStyle}
      >
        {primary}
      </div>
      {/*
        The bar itself stays the app's usual hairline weight — every other
        divider in this app is this same low-alpha --border, and making
        just this one loud would read as inconsistent chrome rather than a
        deliberate control. What was missing was an affordance that says
        "this splits, and it moves" — that's the grip chip below, which is
        the one thing here that departs from a plain line, on purpose.
      */}
      {hasSecondary && resizable ? (
        <button
          ref={handleRef}
          type="button"
          data-split-handle
          aria-label={
            resizeLabel ??
            (horizontal
              ? "Resize description and editor"
              : "Resize editor and tests")
          }
          onPointerDown={(e) => {
            e.preventDefault();
            startDrag();
          }}
          className={cn(
            "group relative shrink-0 touch-none bg-border transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
            horizontal ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize",
          )}
        >
          {/*
            Same bg-elevated + shadow-elevation chip idiom CodeEditor already
            uses for its own focus hint — a small floating surface reads as
            "there's a control here" precisely because the rest of the app
            reserves that treatment for exactly that. Visible at rest (a
            hover-only affordance can't be discovered without already
            suspecting the seam is interactive) at reduced opacity, full
            strength and accent-tinted once you're actually on the handle.
          */}
          <span
            aria-hidden
            className={cn(
              "shadow-elevation pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-elevated text-muted opacity-70 transition-all duration-[var(--dur-fast)] ease-[var(--ease)] group-hover:border-accent/40 group-hover:text-foreground group-hover:opacity-100 group-focus-visible:border-accent/40 group-focus-visible:text-foreground group-focus-visible:opacity-100 motion-reduce:transition-none",
              horizontal ? "h-9 w-4" : "h-4 w-9",
            )}
          >
            <DotsSixVertical
              size={12}
              weight="bold"
              className={horizontal ? undefined : "rotate-90"}
            />
          </span>
        </button>
      ) : null}
      {hasSecondary ? (
        <div
          ref={secondaryRef}
          className={cn(
            "flex h-full min-h-0 min-w-0 flex-col overflow-hidden",
            // A sized secondary may still shrink to its own floor when the row
            // is narrower than its width; the primary's floor stays intact.
            sizesSecondary ? null : "w-full flex-1",
            secondaryClassName,
          )}
          style={secondaryStyle}
        >
          {secondary}
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Verify.** `npx vitest run tests/panelSplit.test.tsx tests/design-tokens.test.ts tests/sidebarChrome.test.ts; echo "exit=$?"` → 0. `npx tsc --noEmit; echo "tsc=$?"` → 0. `npx eslint src/components/problems tests/panelSplit.test.tsx; echo "eslint=$?"` → 0.

- [ ] **Step 5: Commit.**

```bash
git add src/components/problems/PanelSplit.tsx tests/panelSplit.test.tsx
git commit -m "feat(problems): PanelSplit can size an optional secondary pane and remember it

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Coach layout state

**Files:**
- Modify: `web/src/components/coach/CoachProvider.tsx`
- Test: `web/tests/coachLayout.test.tsx`

**Interfaces:**
- Produces on the context:
  - `layout: CoachLayout`, where `export type CoachLayout = "floating" | "column"`;
  - `setLayout(layout: CoachLayout): void`;
  - `open` redefined as "visible in the current layout".
- Consumed by Task 4.

- [ ] **Step 1: Write the failing test** `web/tests/coachLayout.test.tsx`:

```tsx
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CoachProvider, useCoach } from "@/components/coach/CoachProvider";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Coach = ReturnType<typeof useCoach>;
let root: Root | null = null;
let coach: Coach | null = null;

function Probe() {
  coach = useCoach();
  return null;
}

function current(): Coach {
  if (!coach) throw new Error("provider not mounted");
  return coach;
}

function mount() {
  const host = document.createElement("div");
  document.body.append(host);
  const created = createRoot(host);
  root = created;
  act(() =>
    created.render(
      <CoachProvider sandboxId="layout-test" hintLabels={[]}>
        <Probe />
      </CoachProvider>,
    ),
  );
}

const fail = () =>
  act(() => current().reportRun({ results: null, fatal: "boom", property: false }));

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ configured: false }) })));
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: true,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }));
});

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  coach = null;
  vi.unstubAllGlobals();
});

describe("coach layout", () => {
  it("opens the column by default, and a failing run never expands a collapsed one", () => {
    mount();
    act(() => current().setLayout("column"));
    expect(current().open).toBe(true);
    act(() => current().setOpen(false));
    expect(localStorage.getItem("dsa:coach:column-open")).toBe("0");
    fail();
    expect(current().open).toBe(false);
    expect(current().unread).toBe(true);
  });

  it("marks nothing unread when the column is open to show the diagnosis", () => {
    mount();
    act(() => current().setLayout("column"));
    fail();
    expect(current().open).toBe(true);
    expect(current().unread).toBe(false);
  });

  it("remembers a collapsed column across visits, separately from the floating panel", () => {
    localStorage.setItem("dsa:coach:column-open", "0");
    localStorage.setItem("dsa:coach:rail-open", "1");
    mount();
    expect(current().open).toBe(true);
    act(() => current().setLayout("column"));
    expect(current().open).toBe(false);
  });

  it("still opens the floating panel on the session's first failure", () => {
    mount();
    expect(current().layout).toBe("floating");
    expect(current().open).toBe(false);
    fail();
    expect(current().open).toBe(true);
  });
});
```

- [ ] **Step 2: Run it and see it fail.** `npx vitest run tests/coachLayout.test.tsx; echo "exit=$?"` → exit 1 (`setLayout` is not a function).

- [ ] **Step 3: Implement in `web/src/components/coach/CoachProvider.tsx`.**

1. Before `interface CoachContextValue {` add:

```ts
/** "column" when the workspace can hold the coach beside the editor (IdeWithCoach decides). */
export type CoachLayout = "floating" | "column";
```

2. In `CoachContextValue`, replace `  open: boolean;` with:

```ts
  layout: CoachLayout;
  setLayout: (layout: CoachLayout) => void;
  /** The coach is visible in the current layout: the floating panel is open, or the column is expanded. */
  open: boolean;
```

3. After `const RAIL_KEY = "dsa:coach:rail-open";` add:

```ts
/** The column's own state: it defaults to open, where the floating panel defaults to closed. */
const COLUMN_KEY = "dsa:coach:column-open";
```

4. Replace `  const [open, setOpenState] = useState(false);` with:

```ts
  const [layout, setLayout] = useState<CoachLayout>("floating");
  const [floatingOpen, setFloatingOpen] = useState(false);
  const [columnOpen, setColumnOpen] = useState(true);
  const open = layout === "column" ? columnOpen : floatingOpen;
```

5. In the mount effect, replace

```ts
      setOpenState(window.localStorage.getItem(RAIL_KEY) === "1");
```

with

```ts
      setFloatingOpen(window.localStorage.getItem(RAIL_KEY) === "1");
      setColumnOpen(window.localStorage.getItem(COLUMN_KEY) !== "0");
```

6. Replace the whole `setOpen` callback with:

```ts
  const setOpen = useCallback(
    (next: boolean) => {
      const column = layout === "column";
      (column ? setColumnOpen : setFloatingOpen)(next);
      if (next) setUnread(false);
      try {
        // RAIL_KEY keeps its original "rail" name on purpose: the string is
        // persisted in real learners' browsers, so renaming it for tidiness
        // would silently discard everyone's open/closed preference.
        window.localStorage.setItem(column ? COLUMN_KEY : RAIL_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
    },
    [layout],
  );
```

7. In `reportRun`, replace

```ts
      if (failed && !openedThisSession.current) {
        openedThisSession.current = true;
        if (
          typeof window !== "undefined" &&
          window.matchMedia("(min-width: 1024px)").matches
        ) {
          setOpen(true);
        }
      }
```

with

```ts
      if (failed && !openedThisSession.current) {
        openedThisSession.current = true;
        // Only the floating panel opens itself. The column never expands on a
        // run: that resized the editor under the learner, which is why the
        // old rail was retired (spec 2026-09-17-coach-column-design.md).
        if (
          layout === "floating" &&
          typeof window !== "undefined" &&
          window.matchMedia("(min-width: 1024px)").matches
        ) {
          setOpen(true);
        }
      }
```

and change that callback's dependency array from `[hintLabels.length, persistThread, open, setOpen]` to `[hintLabels.length, persistThread, open, setOpen, layout]`.

8. In the `useMemo` value object and its dependency array, add `layout,` and `setLayout,` directly before `open,` (both places).

- [ ] **Step 4: Verify.** `npx vitest run tests/coachLayout.test.tsx; echo "exit=$?"` → 0. `npx tsc --noEmit; echo "tsc=$?"` → 0. `npx eslint src/components/coach tests/coachLayout.test.tsx; echo "eslint=$?"` → 0.

- [ ] **Step 5: Commit.**

```bash
git add src/components/coach/CoachProvider.tsx tests/coachLayout.test.tsx
git commit -m "feat(coach): track the layout and remember the column's own open state

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: The column, the strip, and the switch

**Files:**
- Create: `web/src/components/coach/CoachStrip.tsx`
- Modify: `web/src/components/coach/CoachPanel.tsx`, `web/src/components/coach/IdeWithCoach.tsx` (whole file), `web/src/components/problems/ProblemWorkspace.tsx`
- Test: `web/tests/coach-ui.test.ts` (append), `web/tests/paperGrain.test.ts` (allowlist)

**Interfaces:** Consumes `layout`, `setLayout`, `open`, `toggleCoach`, `closeCoach`, `unread` and `registerLauncherEl` (Task 3); `PanelSplit` props (Task 2); `coachColumnFits` and `lengthToPx` (Task 1).

- [ ] **Step 1: Write failing tests.** Append to `web/tests/coach-ui.test.ts`:

```ts
describe("coach column", () => {
  const read = (...p: string[]) => readFileSync(join(SRC, ...p), "utf8");

  it("keeps the sandbox as the split's primary in every layout, and floats only in floating layout", () => {
    const ide = read("components", "coach", "IdeWithCoach.tsx");
    expect(ide).toMatch(/primary=\{sandbox\}/);
    expect(ide).toContain('sizedPane="secondary"');
    expect(ide).toContain('storageKey="dsa:coach:column-width"');
    expect(ide).toMatch(/\{column \? null : <CoachOverlay \/>\}/);
    expect(ide).toMatch(/coachColumnFits\(/);
    expect(ide).toContain('closest<HTMLElement>("[data-problem-workspace]")');
    expect(read("components", "problems", "ProblemWorkspace.tsx")).toMatch(/<div data-problem-workspace /);
  });

  it("collapses from the column header and expands from the strip, naming the state", () => {
    const panel = read("components", "coach", "CoachPanel.tsx");
    expect(panel).toMatch(/aria-label="Collapse problem coach"\s+aria-expanded=\{true\}/);
    const strip = read("components", "coach", "CoachStrip.tsx");
    expect(strip).toMatch(/aria-label="Expand problem coach"\s+aria-expanded=\{false\}/);
    expect(strip).toContain("registerLauncherEl(ref.current)");
    expect(strip).toContain("New diagnosis");
  });

  it("is layout, not a popover: no dialog role and no Escape in the column", () => {
    const panel = read("components", "coach", "CoachPanel.tsx");
    expect(panel).toMatch(/role=\{variant === "floating" \? "dialog" : variant === "column" \? "complementary" : undefined\}/);
    expect(panel).toMatch(/e\.key === "Escape" && variant === "floating"/);
  });
});
```

In `web/tests/paperGrain.test.ts`, in the `expect(uses).toEqual({` object, add `"components/coach/CoachPanel.tsx": 1,` and `"components/coach/CoachStrip.tsx": 1,` as its first two entries.

- [ ] **Step 2: Run and see them fail.** `npx vitest run tests/coach-ui.test.ts tests/paperGrain.test.ts; echo "exit=$?"` → exit 1.

- [ ] **Step 3: Create `web/src/components/coach/CoachStrip.tsx`:**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { Sparkle } from "@phosphor-icons/react";
import { useCoach } from "./CoachProvider";

/**
 * The collapsed coach column: a strip beside the editor that keeps the coach's
 * mark and its unread dot in view. Registered as the launcher, so collapsing
 * the column returns focus here, and expanding it focuses the composer.
 * Spec: docs/superpowers/specs/2026-09-17-coach-column-design.md §3
 */
export function CoachStrip() {
  const { toggleCoach, unread, registerLauncherEl } = useCoach();
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    registerLauncherEl(ref.current);
    return () => registerLauncherEl(null);
  }, [registerLauncherEl]);

  return (
    <div className="flex h-full w-12 flex-col items-center border-l border-border py-1.5 grain-paper [--grain-paper:var(--elevated)]">
      <button
        ref={ref}
        type="button"
        onClick={toggleCoach}
        aria-label="Expand problem coach"
        aria-expanded={false}
        className="relative flex h-11 w-11 items-center justify-center rounded-[length:var(--radius-md)] hover:bg-surface"
      >
        {/* The floating panel's mark: steel bg-pop/text-on-pop, a designed pair. */}
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-[length:var(--radius-md)] bg-pop text-on-pop"
        >
          <Sparkle size={19} weight="fill" />
        </span>
        {unread ? (
          <>
            {/* bg-bad, not bg-pop: see CoachLauncher — it must stay legible on the mark. */}
            <span
              aria-hidden
              className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-bad ring-2 ring-elevated"
            />
            <span className="sr-only">New diagnosis</span>
          </>
        ) : null}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Add the column variant to `web/src/components/coach/CoachPanel.tsx`.**

1. Change the icon import to `import { CaretLineRight, Sparkle, X, Trash } from "@phosphor-icons/react";` and add `import { cn } from "@/lib/utils";` after it.
2. Change the variant type to `variant?: "floating" | "page" | "column";`.
3. In the composer-registration effect replace `if (variant !== "floating") return;` with `if (variant === "page") return;`, and replace the comment line `  // Floating (desktop) variant: no focus call here at all. It would fire on` with `  // Floating and column (desktop) variants: no focus call here at all. It would fire on`.
4. Replace `role={variant === "floating" ? "dialog" : undefined}` with `role={variant === "floating" ? "dialog" : variant === "column" ? "complementary" : undefined}`.
5. Replace `className="relative flex h-full min-h-0 flex-col bg-elevated"` with:

```tsx
      className={cn(
        "relative flex h-full min-h-0 flex-col",
        // The column is a flush workspace pane, so it takes the description
        // pane's grainy --elevated paper (AA holds there, grainContrast.test).
        variant === "column" ? "grain-paper [--grain-paper:var(--elevated)]" : "bg-elevated",
      )}
```

6. Replace `{variant === "floating" ? (` (the header condition) with `{variant !== "page" ? (`, and replace the close button (the whole `<button … aria-label="Close problem coach" …>…</button>`) with:

```tsx
          {variant === "column" ? (
            <button
              type="button"
              aria-label="Collapse problem coach"
              aria-expanded={true}
              onClick={closeCoach}
              className="-mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] text-muted hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <CaretLineRight size={16} weight="bold" />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Close problem coach"
              onClick={closeCoach}
              className="-mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] text-muted hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <X size={16} weight="bold" />
            </button>
          )}
```

- [ ] **Step 5: Replace `web/src/components/coach/IdeWithCoach.tsx`:**

```tsx
"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { PanelSplit } from "@/components/problems/PanelSplit";
import { coachColumnFits, lengthToPx } from "@/lib/coach/coachColumn";
import { CoachOverlay } from "./CoachOverlay";
import { CoachPanel } from "./CoachPanel";
import { useCoach } from "./CoachProvider";
import { CoachStrip } from "./CoachStrip";

/**
 * The sandbox with its coach. On a workspace wide enough to hold it
 * (lib/coach/coachColumn.ts) the coach is a column beside the editor,
 * collapsible to a strip; otherwise it floats over the IDE. The sandbox is
 * PanelSplit's primary in every layout, so switching never remounts it and
 * wipes run results.
 * Spec: docs/superpowers/specs/2026-09-17-coach-column-design.md
 */
export function IdeWithCoach({ sandbox }: { sandbox: ReactNode }) {
  const { layout, setLayout, open } = useCoach();
  const rootRef = useRef<HTMLDivElement>(null);

  // A layout effect, so a wide workspace never paints the floating launcher
  // first. Observed on the whole workspace row: the column's own width is not
  // in it, so switching layout cannot feed back into the measurement.
  useLayoutEffect(() => {
    const workspace = rootRef.current?.closest<HTMLElement>("[data-problem-workspace]");
    if (!workspace) return;
    const measure = () => {
      const rootStyle = getComputedStyle(document.documentElement);
      const rootPx = parseFloat(rootStyle.fontSize) || 16;
      const description = workspace.querySelector<HTMLElement>(".problem-description-pane");
      const handle = workspace.querySelector<HTMLElement>("[data-split-handle]");
      const fits = coachColumnFits({
        workspace: workspace.getBoundingClientRect().width,
        descriptionCap: description ? parseFloat(getComputedStyle(description).maxWidth) : NaN,
        editorMin: lengthToPx(rootStyle.getPropertyValue("--ide-editor-min"), rootPx),
        coachMin: lengthToPx(rootStyle.getPropertyValue("--coach-column-min"), rootPx),
        handle: handle?.getBoundingClientRect().width ?? NaN,
      });
      setLayout(fits ? "column" : "floating");
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(workspace);
    return () => observer.disconnect();
  }, [setLayout]);

  const column = layout === "column";

  return (
    <div ref={rootRef} className="h-full min-h-0 min-w-0 overflow-hidden">
      <PanelSplit
        orientation="horizontal"
        sizedPane="secondary"
        storageKey="dsa:coach:column-width"
        resizable={column && open}
        resizeLabel="Resize editor and coach"
        primary={sandbox}
        primaryClassName={column ? "ide-editor-pane" : undefined}
        secondary={column ? open ? <CoachPanel variant="column" /> : <CoachStrip /> : null}
        secondaryClassName={column && open ? "coach-column" : undefined}
      />
      {column ? null : <CoachOverlay />}
    </div>
  );
}
```

- [ ] **Step 6: Mark the workspace row in `web/src/components/problems/ProblemWorkspace.tsx`.** Wrap the desktop `<PanelSplit … />` (the one with `primaryClassName="problem-description-pane"`) in:

```tsx
          <div data-problem-workspace className="flex min-h-0 min-w-0 flex-1">
            {/* PanelSplit … unchanged */}
          </div>
```

Add a comment above that `div`: `{/* The coach reads this row's width to choose column or floating (IdeWithCoach). */}`.

- [ ] **Step 7: Verify.** `npx vitest run; echo "vitest=$?"` → 0 (all files). `npx tsc --noEmit; echo "tsc=$?"` → 0. `npm run lint; echo "lint=$?"` → 0 errors.

- [ ] **Step 8: Commit.**

```bash
git add src/components/coach src/components/problems/ProblemWorkspace.tsx tests/coach-ui.test.ts tests/paperGrain.test.ts
git commit -m "feat(coach): a collapsible column beside the editor on wide workspaces

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Full gate and browser proof

- [ ] **Step 1: Gate.** `npx tsc --noEmit`, `npm run lint`, `npx vitest run`, `npm run build`. All exit 0, and lesson and problem routes stay ● (SSG).

- [ ] **Step 2: Dev server.**
  - Add a temporary `web-dev-coach` entry to `/Users/tharunk/leetExpert/.claude/launch.json` (`npm --prefix /Users/tharunk/leetExpert/.worktrees/coach-column/web run dev -- --port 3006`, port 3006) and start it with `preview_start`.
  - Before any visual check, confirm the served CSS has `.coach-column` (`document.styleSheets`); if it doesn't, stop, `rm -rf web/.next/dev`, and restart.

- [ ] **Step 3: Browser checks** (Playwright, `/courses/dsa/problems/rotate-array`):
  1. **Mode matches the threshold.** At 1280, 1440, 1600 and 1920 wide, with the drawer open and closed, the layout matches `coachColumnFits` from the measured row. Column mode shows no floating launcher; floating mode shows no strip or column.
  2. **Run results survive.** Run the starter (fails) in column mode; the results rail shows failures and a diagnosis card is in the column. Toggle the drawer to cross the threshold both ways; the results stay without re-running. Collapse and expand; the results still stay.
  3. **No auto-expand.** Collapse, reload, run: the column stays collapsed and the strip shows the unread dot. Expand: the dot clears and the composer has focus.
  4. **Keyboard.** Tab to "Collapse problem coach", press Enter: focus lands on "Expand problem coach". Press Enter: the composer is focused.
  5. **Width drag.** Drag the editor/coach handle far right: the coach stops at `--coach-column-min`. Drag far left: the editor stops at `--ide-editor-min`. Reload: the width is restored.
  6. **Themes.** Screenshots of column and strip in light and dark; read them.

- [ ] **Step 4: Clean up.** `preview_stop`; remove the `web-dev-coach` launch entry.

- [ ] **Step 5: Commit** any fixes found, each with its own failing test first.
