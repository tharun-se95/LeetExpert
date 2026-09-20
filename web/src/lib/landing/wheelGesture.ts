import { clamp01 } from "@/lib/landing/story";

/**
 * When one wheel gesture on the landing page moves a stop, and how long that
 * travel should take. Pure and clock-injected: the hook passes
 * `performance.now()`, the tests pass numbers.
 *
 * `deltaY` is distance per event, never velocity, and the event *rate* differs
 * by an order of magnitude between a mouse notch (~100px, sparse) and a
 * trackpad (~1-10px, ~60/s). Speed is therefore accumulated across the
 * gesture rather than read off any one event.
 */

/** A notch or a careful drag: the slowest gesture that still counts as one. */
export const SLOW_PX_MS = 0.6;
/** A hard flick; above this the duration stops falling. */
export const FAST_PX_MS = 3;
export const SLOW_MS = 620;
export const FAST_MS = 260;
/**
 * The first event of a gesture moves at this duration. Sampling before moving
 * would add exactly the latency this module exists to remove, so the speed
 * estimate only ever shortens a travel already under way.
 */
export const NEUTRAL_MS = 560;
/** No wheel event for this long means the gesture, and its tail, are over. */
export const QUIET_MS = 120;
/**
 * A delta this far above the gesture's peak is a new push, not momentum.
 * Momentum decays monotonically once the fingers lift; a push is a rising
 * edge. The headroom covers a tail whose first events sit level with the
 * peak. A *gentle* push during a live tail does not clear it, and waits for
 * the quiet gap instead — the cost of never paging twice off one flick.
 */
export const RISE_RATIO = 1.15;

/** Travel time for a gesture running at `speed` px/ms. */
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
    if (now - state.last >= QUIET_MS) return begin(deltaY, now);
    if (size > state.peak * RISE_RATIO) return begin(deltaY, now);
    // Still the tail. `last` moves with it, so the quiet gap keeps measuring
    // from a real event and only opens once the tail truly stops.
    return { state: { ...state, last: now, peak: Math.max(state.peak, size) }, action: "hold" };
  }

  // Travelling. The landing stop is already fixed; later events only shorten.
  if (dir !== state.dir) return { state: { ...state, last: now }, action: "hold" };

  const travelled = state.travelled + size;
  const elapsed = now - state.began;
  const next = { ...state, last: now, travelled, peak: Math.max(state.peak, size) };
  if (elapsed <= 0) return { state: next, action: "hold" };
  return { state: next, action: "shorten", durationMs: durationFor(travelled / elapsed) };
}

/**
 * The travel finished. `last` deliberately keeps the last wheel event's time
 * rather than the landing time: a mouse notch produces one event and no tail,
 * so measuring the quiet gap from the landing would freeze the page for
 * QUIET_MS after every notch — the sluggishness this module removes.
 */
export function travelEnded(state: GestureState): GestureState {
  return { ...state, phase: "coast" };
}
