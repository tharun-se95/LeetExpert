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
