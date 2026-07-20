/**
 * Shared contract for step-through algorithm tracers rendered by VizPlayer.
 *
 * A viz is a pure function `(props) => VizStep[]` — deterministic,
 * serializable snapshots. The player renders one snapshot at a time and
 * animates between them; nothing inside a viz drives its own timers.
 */

export interface VizLineRef {
  /** 1-indexed line into the viz's own Python snippet */
  python: number;
  /** 1-indexed line into the viz's own TypeScript snippet */
  typescript: number;
}

export interface VizStep<S> {
  /** One-sentence narration of this step; doubles as the screen-reader text */
  caption: string;
  /** The code line "executing" at this step, per language */
  line: VizLineRef;
  /** Full snapshot of the algorithm's observable state */
  state: S;
}

export interface VizCode {
  python: string;
  typescript: string;
}
