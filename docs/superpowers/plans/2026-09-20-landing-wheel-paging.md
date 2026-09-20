# Speed-Sensitive Wheel Paging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One wheel gesture still moves the landing page exactly one snap stop, but the travel time scales with gesture speed and the page stops freezing for the whole trackpad momentum tail.

**Architecture:** A new pure, clock-injected state machine (`lib/landing/wheelGesture.ts`) owns speed, the duration curve, and the coasting rule that tells a decaying momentum tail from a rising new push. `useSectionPaging.ts` keeps only DOM wiring: it asks `pagingIntent` whether the event is a page move at all, then runs a `requestAnimationFrame` tween over `main.scrollTop` whose duration the machine sets and can shorten mid-flight. `scroll-snap-type` is suspended inline for the tween's lifetime, because `snap-mandatory` re-snaps under a hand-run tween.

**Tech Stack:** TypeScript strict, React 19 client hook, Vitest + jsdom. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-20-landing-wheel-paging-design.md`

## Global Constraints

- TypeScript strict; no `any`, no unchecked casts.
- Comments explain **why**, never what. Record the measurements and traps.
- Reuse before writing: `clamp01` already exists at `web/src/lib/landing/story.ts:167` — import it, do not write a second one.
- `tsc`, `eslint`, `npm test` and `npm run build` must all pass before the work is called done.
- Each new assertion must be proved able to fail by a deliberate-fault run.
- Tuning constants (`SLOW_PX_MS`, `FAST_PX_MS`, `SLOW_MS`, `FAST_MS`, `NEUTRAL_MS`, `QUIET_MS`, `RISE_RATIO`, `TAIL_FLOOR`) are exported so the tests read them rather than repeating literals.
- All work happens on branch `fix/landing-wheel-paging` off `main`.

---

### Task 1: The pure gesture state machine

**Files:**
- Create: `web/src/lib/landing/wheelGesture.ts`
- Test: `web/tests/landingPaging.test.ts` (extend; keep the existing `scrollsInside` describe block untouched)

**Interfaces:**
- Consumes: `clamp01` from `@/lib/landing/story`.
- Produces, for Task 2:
  - `type GestureState` — opaque to the hook; `IDLE` is the initial value.
  - `stepWheel(state: GestureState, deltaY: number, now: number): WheelStep` where
    `WheelStep` is `{ state, action: "start", dir: 1 | -1, durationMs: number }`
    | `{ state, action: "shorten", durationMs: number }`
    | `{ state, action: "hold" }`.
  - `travelEnded(state: GestureState): GestureState`.
  - `durationFor(speed: number): number`.
  - Constants listed in Global Constraints.

- [ ] **Step 1: Create the branch**

```bash
cd /Users/tharunk/leetExpert && git checkout -b fix/landing-wheel-paging
```

- [ ] **Step 2: Write the failing tests**

Append to `web/tests/landingPaging.test.ts`, above the `scrollsInside` describe block:

```ts
import {
  FAST_MS,
  FAST_PX_MS,
  IDLE,
  NEUTRAL_MS,
  QUIET_MS,
  RISE_RATIO,
  SLOW_MS,
  SLOW_PX_MS,
  TAIL_FLOOR,
  durationFor,
  stepWheel,
  travelEnded,
} from "@/lib/landing/wheelGesture";

/** Feed a stream of [deltaY, now] pairs, returning every step taken. */
function play(events: readonly (readonly [number, number])[], from = IDLE) {
  let state = from;
  return events.map(([deltaY, now]) => {
    const step = stepWheel(state, deltaY, now);
    state = step.state;
    return step;
  });
}

describe("the duration curve", () => {
  it("falls as the gesture gets faster and clamps at both ends", () => {
    expect(durationFor(0)).toBe(SLOW_MS);
    expect(durationFor(SLOW_PX_MS)).toBe(SLOW_MS);
    expect(durationFor(FAST_PX_MS)).toBe(FAST_MS);
    expect(durationFor(99)).toBe(FAST_MS);
    const middle = durationFor((SLOW_PX_MS + FAST_PX_MS) / 2);
    expect(middle).toBeLessThan(SLOW_MS);
    expect(middle).toBeGreaterThan(FAST_MS);
  });
});

describe("starting a gesture", () => {
  it("moves on the first event at the neutral duration, without waiting to measure speed", () => {
    const [first] = play([[100, 1000]]);
    expect(first).toMatchObject({ action: "start", dir: 1, durationMs: NEUTRAL_MS });
    expect(play([[-100, 1000]])[0]).toMatchObject({ action: "start", dir: -1 });
  });

  it("shortens the travel as a fast gesture continues, and never re-targets it", () => {
    // A hard trackpad flick: 40px per event, one every 8ms => 5 px/ms.
    const steps = play([
      [40, 0],
      [40, 8],
      [40, 16],
    ]);
    expect(steps[0]?.action).toBe("start");
    expect(steps.slice(1).map((s) => s.action)).toEqual(["shorten", "shorten"]);
    const last = steps[2];
    if (last?.action !== "shorten") throw new Error("expected a shorten");
    expect(last.durationMs).toBe(FAST_MS);
    // No step past the first carries a direction: the landing stop is fixed.
    expect(steps.slice(1).every((s) => !("dir" in s))).toBe(true);
  });

  it("keeps a slow drag near the slow end of the curve", () => {
    // A careful drag: 3px per event, one every 16ms => under 0.2 px/ms.
    const steps = play([
      [3, 0],
      [3, 16],
      [3, 32],
    ]);
    const last = steps[2];
    if (last?.action !== "shorten") throw new Error("expected a shorten");
    expect(last.durationMs).toBe(SLOW_MS);
  });

  it("ignores a reversal mid-travel, so an overshooting gesture cannot whiplash", () => {
    const steps = play([
      [80, 0],
      [-80, 10],
      [-80, 20],
    ]);
    expect(steps.slice(1).map((s) => s.action)).toEqual(["hold", "hold"]);
  });
});

describe("coasting after a stop lands", () => {
  /** A gesture that peaked at 60px, then landed. */
  const landed = () => {
    let state = IDLE;
    for (const [deltaY, now] of [
      [60, 0],
      [60, 8],
    ] as const) {
      state = stepWheel(state, deltaY, now).state;
    }
    return travelEnded(state);
  };

  it("holds a monotonically decaying momentum tail for its whole length", () => {
    const tail = [50, 40, 32, 25, 19, 14, 10, 7, 5, 3];
    const steps = play(
      tail.map((d, i) => [d, 20 + i * 16] as const),
      landed(),
    );
    expect(steps.every((s) => s.action === "hold")).toBe(true);
  });

  it("releases on a rising edge: a new push during the tail pages at once", () => {
    const steps = play(
      [
        [50, 20],
        [30, 36],
        [18, 52],
        // The reader pushes again. Above the tail's peak (50) by RISE_RATIO.
        [50 * RISE_RATIO + 1, 68],
      ],
      landed(),
    );
    expect(steps.map((s) => s.action)).toEqual(["hold", "hold", "hold", "start"]);
  });

  it("releases after a quiet gap, so a mouse notch is never made to wait", () => {
    const state = landed();
    // One notch, no tail at all: the next notch pages immediately.
    expect(stepWheel(state, 100, 8 + QUIET_MS).action).toBe("start");
    expect(stepWheel(state, 100, 8 + QUIET_MS - 1).action).toBe("hold");
  });

  it("does not let a dying tail's noise read as a rising edge", () => {
    // Below the floor, a tail crossing 1px repeatedly must not release,
    // and must not raise the peak it is measured against either.
    const steps = play(
      [
        [TAIL_FLOOR - 1, 20],
        [TAIL_FLOOR - 1, 36],
        [TAIL_FLOOR - 1, 52],
      ],
      landed(),
    );
    expect(steps.every((s) => s.action === "hold")).toBe(true);
    // Still measured against the gesture's own peak, not against 1px.
    expect(stepWheel(steps[2]!.state, 5, 68).action).toBe("hold");
  });

  it("measures the rising edge against the gesture's peak, not against zero", () => {
    // Regression: seeding the coast peak at 0 makes the tail's FIRST event a
    // rising edge, which pages a second stop off one flick.
    expect(stepWheel(landed(), 55, 20).action).toBe("hold");
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

```bash
cd /Users/tharunk/leetExpert/web && npx vitest run tests/landingPaging.test.ts
```

Expected: FAIL — `Failed to resolve import "@/lib/landing/wheelGesture"`.

- [ ] **Step 4: Write the state machine**

Create `web/src/lib/landing/wheelGesture.ts`:

```ts
import { clamp01 } from "@/lib/landing/story";

/**
 * When one wheel gesture on the landing page moves a stop, and how long the
 * travel should take. Pure and clock-injected: the hook passes
 * `performance.now()`, the tests pass numbers.
 *
 * `deltaY` is distance per event, never velocity, and the event *rate* differs
 * by an order of magnitude between a mouse notch (~100px, sparse) and a
 * trackpad (~1-10px, ~60/s). Speed is therefore accumulated across the
 * gesture, not read off one event.
 */

/** A notch or a careful drag: the slowest gesture that still counts as one. */
export const SLOW_PX_MS = 0.6;
/** A hard flick; above this the duration stops falling. */
export const FAST_PX_MS = 3;
export const SLOW_MS = 620;
export const FAST_MS = 260;
/**
 * The first event of a gesture moves immediately at this duration. Sampling
 * before moving would add exactly the latency this module exists to remove,
 * so the speed estimate only ever shortens a travel already under way.
 */
export const NEUTRAL_MS = 560;
/** No wheel event for this long means the gesture, and its tail, are over. */
export const QUIET_MS = 120;
/**
 * A delta this much above the tail's peak is a new push, not momentum.
 * Momentum decays monotonically once the fingers lift; a push is a rising
 * edge. The headroom covers a tail whose first events sit level with the
 * gesture's own peak.
 */
export const RISE_RATIO = 1.15;
/** Below this a delta is a dying tail's noise: it neither releases nor counts. */
export const TAIL_FLOOR = 2;

export function durationFor(speed: number): number {
  const t = clamp01((speed - SLOW_PX_MS) / (FAST_PX_MS - SLOW_PX_MS));
  return Math.round(SLOW_MS + (FAST_MS - SLOW_MS) * t);
}

export type GestureState = {
  /** "travel": a stop is on its way. "coast": it landed, this is the tail. */
  readonly phase: "idle" | "travel" | "coast";
  readonly dir: 0 | 1 | -1;
  readonly began: number;
  readonly last: number;
  readonly travelled: number;
  /** Largest delta of the gesture; what a coasting tail is measured against. */
  readonly peak: number;
};

export const IDLE: GestureState = {
  phase: "idle",
  dir: 0,
  began: 0,
  last: 0,
  travelled: 0,
  peak: 0,
};

export type WheelStep =
  | { state: GestureState; action: "start"; dir: 1 | -1; durationMs: number }
  | { state: GestureState; action: "shorten"; durationMs: number }
  | { state: GestureState; action: "hold" };

function begin(deltaY: number, now: number): WheelStep {
  const dir = deltaY > 0 ? 1 : -1;
  const size = Math.abs(deltaY);
  return {
    state: { phase: "travel", dir, began: now, last: now, travelled: size, peak: size },
    action: "start",
    dir,
    durationMs: NEUTRAL_MS,
  };
}

export function stepWheel(state: GestureState, deltaY: number, now: number): WheelStep {
  const size = Math.abs(deltaY);
  const dir = deltaY > 0 ? 1 : -1;

  if (state.phase === "idle") return begin(deltaY, now);

  if (state.phase === "coast") {
    const quiet = now - state.last >= QUIET_MS;
    if (quiet) return begin(deltaY, now);
    // Noise from a dying tail: hold, and keep the tail alive so the quiet gap
    // still measures from a real event.
    if (size < TAIL_FLOOR) return { state: { ...state, last: now }, action: "hold" };
    if (size > state.peak * RISE_RATIO) return begin(deltaY, now);
    return { state: { ...state, last: now, peak: Math.max(state.peak, size) }, action: "hold" };
  }

  // Travelling. The landing stop is already fixed; later events only shorten.
  const held: WheelStep = { state: { ...state, last: now }, action: "hold" };
  if (dir !== state.dir || size < TAIL_FLOOR) return held;

  const travelled = state.travelled + size;
  const elapsed = now - state.began;
  const next = {
    ...state,
    last: now,
    travelled,
    peak: Math.max(state.peak, size),
  };
  if (elapsed <= 0) return { state: next, action: "hold" };
  return { state: next, action: "shorten", durationMs: durationFor(travelled / elapsed) };
}

/**
 * The travel finished. `last` deliberately keeps the last wheel event's time,
 * not the landing time: a mouse notch produces one event and no tail, so
 * measuring the quiet gap from the landing would freeze the page for QUIET_MS
 * after every notch — the sluggishness this module removes.
 */
export function travelEnded(state: GestureState): GestureState {
  return { ...state, phase: "coast" };
}
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
cd /Users/tharunk/leetExpert/web && npx vitest run tests/landingPaging.test.ts
```

Expected: PASS, all describes.

- [ ] **Step 6: Prove the new tests can fail**

Apply each fault, run the suite, confirm the named test fails, then restore. Do not batch them — one at a time.

| Fault in `wheelGesture.ts` | Test that must fail |
| --- | --- |
| `RISE_RATIO = 100` | "releases on a rising edge" |
| `QUIET_MS = 100000` | "releases after a quiet gap" |
| `TAIL_FLOOR = 0` | "does not let a dying tail's noise read as a rising edge" |
| `peak: 0` in `travelEnded` | "measures the rising edge against the gesture's peak" |
| `durationFor` returns `SLOW_MS` always | "the duration curve", "shortens the travel as a fast gesture continues" |
| drop the `dir !== state.dir` guard | "ignores a reversal mid-travel" |

- [ ] **Step 7: Commit**

```bash
cd /Users/tharunk/leetExpert && git add web/src/lib/landing/wheelGesture.ts web/tests/landingPaging.test.ts && git commit -m "feat(landing): a pure wheel-gesture machine with speed-scaled travel"
```

---

### Task 2: Wire the machine into the paging hook

**Files:**
- Modify: `web/src/components/landing/useSectionPaging.ts` (whole file)
- Test: `web/tests/landingPaging.test.ts` (adjust the one `pagingIntent` assertion that passes `locked`)

**Interfaces:**
- Consumes: everything Task 1 produced.
- Produces: `pagingIntent` **loses its `locked` parameter** — gating now belongs to the state machine, and leaving a dead parameter behind invites a second source of truth. Its other parameters and its return type (`"down" | "up" | "hold" | "native"`) are unchanged; `"hold"` is now unreachable from `pagingIntent` and is removed from the `Paging` union.

- [ ] **Step 1: Update the one test that passes `locked`**

In `web/tests/landingPaging.test.ts`, in the "paging a stepped section" describe:
- remove `locked: false` from the `base` object;
- delete the final assertion `expect(pagingIntent({ ...tall, stepped: true, locked: true })).toBe("hold")` and its comment — momentum is Task 1's concern now and is covered by the coasting describe.

- [ ] **Step 2: Run the typecheck to verify it fails**

```bash
cd /Users/tharunk/leetExpert/web && npx tsc --noEmit -p tsconfig.json
```

Expected: FAIL in `tests/landingPaging.test.ts` — `pagingIntent` still requires `locked`, which the edited `base` object no longer supplies. If it passes, the Step 1 edit was not made.

- [ ] **Step 3: Rewrite the hook**

Replace the contents of `web/src/components/landing/useSectionPaging.ts` with:

```ts
"use client";

import { useEffect } from "react";
import { activeSectionIndex } from "@/components/landing/useSectionReveal";
import { IDLE, stepWheel, travelEnded, type GestureState } from "@/lib/landing/wheelGesture";

export type Paging = "down" | "up" | "native";

/**
 * What one wheel event should do on the landing page.
 * - "down" / "up": move one snap stop.
 * - "native": let the browser scroll — the current section is taller than
 *   the viewport and the reader hasn't reached its edge in that direction.
 *   Not for a stepped section (`data-scroll-steps`: Understand, Build and
 *   Keep from lg, owner 2026-09-20), which is tall only to hold one screen per
 *   feature: there each gesture moves one feature, then on to the next section.
 *
 * Whether the gesture is *allowed* to move now, and how fast, is
 * `wheelGesture`'s job, not this function's.
 */
export function pagingIntent({
  deltaY,
  sectionTop,
  sectionBottom,
  viewport,
  stepped = false,
}: {
  deltaY: number;
  sectionTop: number;
  sectionBottom: number;
  viewport: number;
  stepped?: boolean;
}): Paging {
  const down = deltaY > 0;
  if (stepped) return down ? "down" : "up";
  if (down && sectionBottom > viewport + 2) return "native";
  if (!down && sectionTop < -2) return "native";
  return down ? "down" : "up";
}

/**
 * Whether the wheel, over `target`, would scroll something inside the page
 * rather than the page: a scrollable box between it and `root` that can still
 * move in that direction (the cheatsheet, the problem list, the coach
 * thread). Those scroll first; the page pages once they reach their end.
 */
export function scrollsInside(target: EventTarget | null, deltaY: number, root: Element): boolean {
  for (let el = target instanceof Element ? target : null; el && el !== root; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY !== "auto" && overflowY !== "scroll") continue;
    if (el.scrollHeight <= el.clientHeight + 1) continue;
    const room = deltaY > 0 ? el.scrollHeight - el.clientHeight - el.scrollTop : el.scrollTop;
    if (room > 1) return true;
  }
  return false;
}

/** Shortening a travel always leaves this much glide, so it never snaps shut. */
const MIN_GLIDE_MS = 80;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * One wheel gesture moves one section on the landing page (from lg, fine
 * pointers only), taking longer for a gentle gesture than for a flick.
 *
 * Measured in Chrome with `snap-mandatory`: a 300px wheel scroll from the top
 * ended back at 0, because the nearest stop to 300px of a 1306px section is
 * the one it left — a mouse-wheel reader felt the page resist. So the wheel is
 * turned into a tween we run ourselves. Keyboard and touch keep the browser's
 * native snapping; reduced motion pages instantly.
 *
 * The tween is ours rather than `behavior: "smooth"` because smooth's duration
 * is fixed and unreadable, and the duration is the whole point here.
 */
export function useSectionPaging() {
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const desktop = window.matchMedia("(pointer: fine) and (min-width: 1024px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let gesture: GestureState = IDLE;
    let frame = 0;
    let travel: { from: number; to: number; began: number; duration: number } | null = null;

    /**
     * `snap-mandatory` re-snaps every assignment to scrollTop, which would
     * fight the tween frame by frame. Suspended inline for its lifetime and
     * handed back to AppShell's classes on landing — the tween lands exactly
     * on a stop, so restoring is a no-op except after an interruption, which
     * must not leave the page unsnapped.
     */
    const land = () => {
      travel = null;
      gesture = travelEnded(gesture);
      main.style.removeProperty("scroll-snap-type");
    };

    const tick = (now: number) => {
      if (!travel) return;
      const t = Math.min(1, (now - travel.began) / travel.duration);
      main.scrollTop = travel.from + (travel.to - travel.from) * easeOutCubic(t);
      if (t >= 1) return land();
      frame = requestAnimationFrame(tick);
    };

    /**
     * A viewport, not a measured stop: `STOP` is `min-h-dvh`, so a section
     * that outgrows the screen sits further than a viewport from its
     * neighbour, and the first stop is AppShell's grain wrapper rather than
     * the hero section. The old `scrollBy` leaned on snapping to resolve the
     * residual onto the real stop, and restoring `scroll-snap-type` on
     * landing keeps exactly that correction.
     */
    const startTravel = (dir: 1 | -1, durationMs: number) => {
      const to = main.scrollTop + dir * main.clientHeight;
      if (reduce.matches) {
        main.scrollTop = to;
        gesture = travelEnded(gesture);
        return;
      }
      main.style.setProperty("scroll-snap-type", "none");
      travel = { from: main.scrollTop, to, began: performance.now(), duration: durationMs };
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };

    const shorten = (durationMs: number) => {
      if (!travel) return;
      const elapsed = performance.now() - travel.began;
      travel.duration = Math.max(elapsed + MIN_GLIDE_MS, Math.min(travel.duration, durationMs));
    };

    const apply = (e: WheelEvent) => {
      e.preventDefault();
      const step = stepWheel(gesture, e.deltaY, performance.now());
      gesture = step.state;
      if (step.action === "start") startTravel(step.dir, step.durationMs);
      else if (step.action === "shorten") shorten(step.durationMs);
    };

    const onWheel = (e: WheelEvent) => {
      // ctrl+wheel is pinch-zoom on trackpads; leave it to the browser.
      if (!desktop.matches || e.ctrlKey || e.deltaY === 0) return;
      // Mid-travel the section under the middle band is changing, so asking
      // pagingIntent again could hand the browser a native scroll that fights
      // the tween. The gesture machine alone decides what happens now.
      if (gesture.phase === "travel") return apply(e);
      if (scrollsInside(e.target, e.deltaY, main)) return;

      const viewport = main.clientHeight;
      const sections = Array.from(main.querySelectorAll<HTMLElement>("[data-scroll-section]"));
      const boxes = sections.map((el) => el.getBoundingClientRect());
      const at = activeSectionIndex(boxes, viewport / 2);
      const current = boxes[at];
      const intent = pagingIntent({
        stepped: sections[at]?.hasAttribute("data-scroll-steps") ?? false,
        deltaY: e.deltaY,
        sectionTop: current?.top ?? 0,
        sectionBottom: current?.bottom ?? viewport,
        viewport,
      });
      // The browser is about to scroll this section itself: forget the
      // gesture, or its tail would hold the next page move.
      if (intent === "native") {
        gesture = IDLE;
        return;
      }
      apply(e);
    };

    main.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      main.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(frame);
      main.style.removeProperty("scroll-snap-type");
    };
  }, []);
}
```

- [ ] **Step 4: Typecheck, lint and run the full suite**

```bash
cd /Users/tharunk/leetExpert/web && npx tsc --noEmit -p tsconfig.json && npx eslint src/lib/landing/wheelGesture.ts src/components/landing/useSectionPaging.ts && npm test
```

Expected: no type errors, no lint errors, all tests pass. If `landingStory.test.tsx` renders `LandingStory` and breaks on the changed hook, read the failure before changing anything.

- [ ] **Step 5: Probe the snapping assumption in a real browser**

Two things in Task 2 are assumptions, not measurements, and both are cheap to
check. Start the dev server (`preview_start`, never `npm run dev` in Bash),
open `/` at a desktop size, then in the page:

```js
// 1. Does snap-mandatory actually fight a hand-run tween?
//    Tween 400px over 300ms WITHOUT suspending snapping and watch scrollTop.
const main = document.querySelector("main");
const from = main.scrollTop, began = performance.now(), seen = [];
(function tick(now) {
  const t = Math.min(1, (now - began) / 300);
  main.scrollTop = from + 400 * t;
  seen.push(Math.round(main.scrollTop));
  if (t < 1) requestAnimationFrame(tick); else console.log(seen.join(" "));
})(performance.now());
```

Expected if the assumption holds: the samples are yanked back toward `from`
or jump to a stop, rather than rising smoothly. Record what actually happened
in the spec — if snapping does **not** fight the tween, delete the
`scroll-snap-type` suspension from the hook rather than keeping code that
earns nothing.

```js
// 2. How large is the residual the snap restore has to correct?
//    On each stop, the gap between a viewport and the next real stop.
const m = document.querySelector("main");
[...m.querySelectorAll("[data-scroll-section]")].map((s) => ({
  id: s.id || "(hero)",
  height: Math.round(s.getBoundingClientRect().height),
  viewport: m.clientHeight,
}));
```

A section whose height is not a multiple of the viewport is one where landing
will visibly correct. Report the numbers; do not silently accept a large jump.

- [ ] **Step 6: Build**

```bash
cd /Users/tharunk/leetExpert/web && npm run build
```

Expected: a clean production build.

- [ ] **Step 7: Commit**

```bash
cd /Users/tharunk/leetExpert && git add web/src/components/landing/useSectionPaging.ts web/tests/landingPaging.test.ts && git commit -m "fix(landing): scale wheel travel to gesture speed, drain the momentum lock"
```

---

### Task 3: Bring the documentation back in step

**Files:**
- Modify: `CLAUDE.md` (the landing-page bullet, the `useSectionPaging` sentence)
- Modify: `docs/superpowers/specs/2026-09-15-landing-product-page-design.md` (§14, a pointer)

**Interfaces:** none.

- [ ] **Step 1: Update `CLAUDE.md`**

Find the sentence inside the landing-page bullet:

> `useSectionPaging` moves one step per wheel gesture in a stepped section (never native), and first lets a box under the pointer that can still scroll (cheatsheet, problem list, coach thread) scroll — `scrollsInside`;

Replace "moves one step per wheel gesture in a stepped section (never native)" with a description of the new rule: one step per gesture still, but over a travel whose duration scales with gesture speed (`lib/landing/wheelGesture.ts`, spec `2026-09-20-landing-wheel-paging-design.md`), a tween the hook runs itself with `scroll-snap-type` suspended for its lifetime, and a coasting rule that tells a decaying momentum tail from a rising new push instead of a fixed timer that the tail itself kept extending.

- [ ] **Step 2: Point §14 of the product-page spec at the new spec**

Add one line to §14 recording that the wheel-paging rule is superseded by `2026-09-20-landing-wheel-paging-design.md`.

- [ ] **Step 3: Verify the docs match the code**

```bash
cd /Users/tharunk/leetExpert && grep -n "useSectionPaging\|wheelGesture" CLAUDE.md docs/superpowers/specs/2026-09-15-landing-product-page-design.md
```

Expected: both files name `wheelGesture` and the 2026-09-20 spec; no surviving claim of a fixed one-step-per-gesture lock.

- [ ] **Step 4: Commit**

```bash
cd /Users/tharunk/leetExpert && git add CLAUDE.md docs/superpowers/specs/2026-09-15-landing-product-page-design.md && git commit -m "docs: record speed-scaled wheel paging on the landing page"
```

---

## Reporting

Wheel *feel* is hardware: real trackpad inertia and event cadence cannot be
reproduced by synthetic wheel events, so a headless pass proves nothing about
whether the page now feels right. Report the change as unit-tested with a
deliberate-fault pass, `tsc`/`eslint`/`npm test`/`npm run build` green, and the
feel handed to the owner to judge — stating that limit rather than implying the
sluggishness is verified gone.
