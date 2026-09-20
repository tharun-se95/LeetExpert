// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { pagingIntent, scrollsInside } from "@/components/landing/useSectionPaging";
import {
  FAST_MS,
  FAST_PX_MS,
  IDLE,
  NEUTRAL_MS,
  SLOW_MS,
  SLOW_PX_MS,
  durationFor,
  stepWheel,
  travelEnded,
  type GestureState,
  type WheelStep,
} from "@/lib/landing/wheelGesture";

/**
 * Wheel paging on the landing page with stepped feature sections (owner,
 * 2026-09-20: "show the features one by one as we scroll"), at a travel
 * duration that scales with gesture speed (owner, 2026-09-20: "it should be
 * scroll speed sensitive, it feels very sluggish").
 */

const base = { deltaY: 100, sectionTop: 0, sectionBottom: 900, viewport: 900 };

describe("paging a stepped section", () => {
  it("moves one feature per gesture inside a stepped section, never scrolling it natively", () => {
    // Understand from lg: three screens tall, the reader on its first step.
    const tall = { ...base, sectionTop: 0, sectionBottom: 2700 };
    expect(pagingIntent({ ...tall, stepped: false })).toBe("native");
    expect(pagingIntent({ ...tall, stepped: true })).toBe("down");
    // On its middle step, going back up.
    expect(pagingIntent({ ...base, sectionTop: -900, sectionBottom: 1800, deltaY: -80, stepped: true })).toBe("up");
  });
});

/** Feed a stream of [deltaY, now] pairs, returning every step taken. */
function play(events: readonly (readonly [number, number])[], from: GestureState = IDLE): WheelStep[] {
  let state = from;
  return events.map(([deltaY, now]) => {
    const step = stepWheel(state, deltaY, now);
    state = step.state;
    return step;
  });
}

/** The last step of a stream, or a thrown error rather than a silent undefined. */
function lastOf(steps: readonly WheelStep[]): WheelStep {
  const step = steps.at(-1);
  if (!step) throw new Error("no steps taken");
  return step;
}

function durationOf(step: WheelStep): number {
  if (step.action === "hold") throw new Error(`expected a move, got ${step.action}`);
  return step.durationMs;
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
    expect(play([[100, 1000]])[0]).toMatchObject({ action: "start", dir: 1, durationMs: NEUTRAL_MS });
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
    expect(durationOf(lastOf(steps))).toBe(FAST_MS);
    // No step past the first carries a direction: the landing stop is fixed.
    expect(steps.slice(1).every((s) => !("dir" in s))).toBe(true);
  });

  it("keeps a slow drag at the slow end of the curve", () => {
    // A careful drag: 3px per event, one every 16ms => under 0.2 px/ms.
    const steps = play([
      [3, 0],
      [3, 16],
      [3, 32],
    ]);
    expect(durationOf(lastOf(steps))).toBe(SLOW_MS);
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
  /** A gesture that peaked at 60px, last seen at t=8, then landed. */
  const landed = () => travelEnded(lastOf(play([[60, 0], [60, 8]])).state);

  it("holds a monotonically decaying momentum tail for its whole length", () => {
    const tail = [50, 40, 32, 25, 19, 14, 10, 7, 5, 3];
    const steps = play(tail.map((d, i) => [d, 20 + i * 16] as const), landed());
    expect(steps.every((s) => s.action === "hold")).toBe(true);
  });

  it("releases on a rising edge: a new push during the tail pages at once", () => {
    // Literal sizes, not RISE_RATIO: a test written in terms of the constant
    // it verifies moves with it and can never fail. 90px clears the flick's
    // 60px peak; the tail's own events never do.
    const steps = play(
      [
        [50, 20],
        [30, 36],
        [18, 52],
        [90, 68],
      ],
      landed(),
    );
    expect(steps.map((s) => s.action)).toEqual(["hold", "hold", "hold", "start"]);
  });

  it("releases after a quiet gap, so a mouse notch is never made to wait", () => {
    // 30px is well under the 60px peak, so only the gap itself can release it:
    // 150ms of silence pages, 60ms is still the tail.
    expect(stepWheel(landed(), 30, 8 + 150).action).toBe("start");
    expect(stepWheel(landed(), 30, 8 + 60).action).toBe("hold");
  });

  it("measures the rising edge against the gesture's peak, not against zero", () => {
    // Regression: seeding the coast peak at 0 makes the tail's FIRST event a
    // rising edge, which pages a second stop off one flick.
    expect(stepWheel(landed(), 55, 20).action).toBe("hold");
  });
});

/** A box that scrolls vertically, with the sizes jsdom can't lay out. */
function scroller(scrollHeight: number, clientHeight: number, scrollTop: number) {
  const el = document.createElement("div");
  el.style.overflowY = "auto";
  Object.defineProperties(el, {
    scrollHeight: { value: scrollHeight },
    clientHeight: { value: clientHeight },
  });
  Object.defineProperty(el, "scrollTop", { value: scrollTop });
  return el;
}

describe("scrolling inside a component first", () => {
  it("lets a scrollable box under the pointer scroll until it reaches its end", () => {
    const main = document.createElement("main");
    const box = scroller(1764, 570, 0);
    const text = document.createElement("span");
    box.append(text);
    main.append(box);
    document.body.append(main);
    // The cheatsheet at its top: down scrolls it, up pages the page.
    expect(scrollsInside(text, 100, main)).toBe(true);
    expect(scrollsInside(text, -100, main)).toBe(false);
    main.remove();
  });

  it("pages once the box is at its end, or when nothing under the pointer scrolls", () => {
    const main = document.createElement("main");
    const atEnd = scroller(1764, 570, 1194);
    const short = scroller(127, 127, 0);
    const plain = document.createElement("p");
    main.append(atEnd, short, plain);
    document.body.append(main);
    expect(scrollsInside(atEnd, 100, main)).toBe(false);
    expect(scrollsInside(atEnd, -100, main)).toBe(true);
    expect(scrollsInside(short, 100, main)).toBe(false);
    expect(scrollsInside(plain, 100, main)).toBe(false);
    // The walk stops at the page's own scroller.
    expect(scrollsInside(main, 100, main)).toBe(false);
    main.remove();
  });
});
