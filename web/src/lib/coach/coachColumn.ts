/**
 * Whether the problem workspace can hold the coach as a column beside the
 * editor rather than floating over it. Measured on the workspace row, not the
 * viewport: the lessons drawer docks in flow and narrows it.
 * Spec: docs/superpowers/specs/2026-09-17-coach-column-design.md §4
 */

/** JetBrains Mono advances 0.6em per character (measured in Chrome, 2026-09-17). */
export const MONO_ADVANCE_EM = 0.6;
/** Each editor line carries 1rem of padding on both sides (measured). */
export const EDITOR_LINE_PADDING_REM = 2;

export interface CoachColumnMeasures {
  /** The workspace row (description + IDE), px. */
  workspace: number;
  /** The current root font size, px. */
  rootPx: number;
  /** The browser's default text size, px: the root the roomiest layout uses. */
  defaultRootPx: number;
  /** The description pane's computed max-width at the current root, px. */
  descriptionCap: number;
  /** The editor's code size, px (the app holds it near one size at every root). */
  codeSize: number;
  /** --ide-editor-columns: code columns the editor must show, gutter included. */
  editorColumns: number;
  /** --coach-column-min, rem. */
  coachMinRem: number;
  /** One split handle at the current root, px. */
  handle: number;
}

/**
 * The editor's floor: `columns` code columns at the code size, plus its line
 * padding. In code columns, not rem, because code type holds its size while
 * the root steps down. Mirrors `.ide-editor-pane` in globals.css.
 */
export function editorMinPx(codeSizePx: number, columns: number, rootPx: number): number {
  return codeSizePx * MONO_ADVANCE_EM * columns + EDITOR_LINE_PADDING_REM * rootPx;
}

/**
 * Judged at the browser's default text size, not the current root. The app
 * steps its root down on smaller screens, shrinking every rem-sized part, so a
 * fit at the current root let a 1600px screen hold a column that 1620px, one
 * root step up, did not. At the default root the need is one stable width. The
 * default is never below the current root, so a column that fits here also
 * fits as rendered.
 */
export function coachColumnFits(m: CoachColumnMeasures): boolean {
  // An unresolved token or an unmounted pane measures NaN; floating is the
  // layout that always fits, so doubt falls back to it.
  if (!Object.values(m).every((n) => Number.isFinite(n) && n >= 0) || m.rootPx === 0) {
    return false;
  }
  const scale = m.defaultRootPx / m.rootPx;
  const need =
    m.descriptionCap * scale +
    editorMinPx(m.codeSize, m.editorColumns, m.defaultRootPx) +
    m.coachMinRem * m.defaultRootPx +
    2 * m.handle * scale;
  return m.workspace >= need;
}

/** A length token ("40rem", "300px") in px against the root font size; NaN otherwise. */
export function lengthToPx(value: string, rootPx: number): number {
  const match = /^\s*(\d*\.?\d+)(rem|px)\s*$/.exec(value);
  if (!match) return NaN;
  const n = Number(match[1]);
  return match[2] === "rem" ? n * rootPx : n;
}
