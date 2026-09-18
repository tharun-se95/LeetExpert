import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  EDITOR_LINE_PADDING_REM,
  MONO_ADVANCE_EM,
  coachColumnFits,
  editorMinPx,
  lengthToPx,
} from "@/lib/coach/coachColumn";

const globals = readFileSync(join(__dirname, "..", "src", "app", "globals.css"), "utf8");
const token = (css: string, name: string) =>
  new RegExp(`--${name}:\\s*([^;]+);`).exec(css)?.[1]?.trim() ?? "";

/** The app's root and code-size steps, parsed from globals.css, for a viewport width (tall screen). */
function stepFor(width: number): { rootPx: number; codeSize: string } {
  const block = (query: string) => {
    const at = globals.indexOf(`@media ${query} {`);
    return globals.slice(at, globals.indexOf("\n}\n", at));
  };
  const narrow = block("(max-width: 1400px), (max-height: 760px)");
  const mid = block("(max-width: 1600px), (max-height: 900px)");
  if (width <= 1400) return { rootPx: 13, codeSize: token(narrow, "code-size") };
  if (width <= 1600) return { rootPx: 15, codeSize: token(mid, "code-size") };
  return { rootPx: 16, codeSize: token(globals, "code-size") };
}

describe("coach column threshold", () => {
  it("resolves rem and px tokens against the root size", () => {
    expect(lengthToPx("40rem", 15)).toBe(600);
    expect(lengthToPx(".96rem", 13)).toBeCloseTo(12.48);
    expect(lengthToPx(" 300px ", 15)).toBe(300);
    expect(lengthToPx("auto", 15)).toBeNaN();
  });

  it("sizes the editor floor in code columns at the code size, as the CSS does", () => {
    // Measured 2026-09-17: JetBrains Mono advances 0.6em, and each editor line
    // carries 1rem of padding on both sides.
    expect(MONO_ADVANCE_EM).toBe(0.6);
    expect(EDITOR_LINE_PADDING_REM).toBe(2);
    expect(token(globals, "ide-editor-columns")).toBe("86");
    expect(globals).toMatch(
      /\n\.ide-editor-pane \{\s*min-width: calc\(var\(--code-size\) \* 0\.6 \* var\(--ide-editor-columns\) \+ 2rem\);\s*\}/,
    );
    expect(editorMinPx(13.35, 86, 15)).toBeCloseTo(718.86, 2);
  });

  /** The page's measures at a viewport width on a tall screen, drawer closed. */
  function measuresAt(width: number, defaultRootPx = 16) {
    const { rootPx, codeSize } = stepFor(width);
    return {
      workspace: width,
      rootPx,
      defaultRootPx,
      // 60ch of problem prose plus padding: 36.147rem of the current root, measured.
      descriptionCap: 36.147 * rootPx,
      codeSize: lengthToPx(codeSize, rootPx),
      editorColumns: Number(token(globals, "ide-editor-columns")),
      coachMinRem: lengthToPx(token(globals, "coach-column-min"), 1),
      handle: 0.25 * rootPx,
    };
  }

  it("needs the capped description, the editor's code columns, the coach floor and two handles, at the default text size", () => {
    // At 1920 wide (16px root, 13.6px code): 578.35 + 733.8 + 320 + 8 = 1640.2px.
    expect(coachColumnFits({ ...measuresAt(1920), workspace: 1640 })).toBe(false);
    expect(coachColumnFits({ ...measuresAt(1920), workspace: 1641 })).toBe(true);
  });

  it("never gives a narrower screen a column that a wider one lacks", () => {
    // The root steps down on smaller screens while code type holds its size.
    // Judged at the current root, a 1600px screen fit a column that 1608px,
    // one step up, did not (a rem floor had inverted 1280 against 1440 too).
    let seen = false;
    for (let width = 1024; width <= 2560; width += 8) {
      const fits = coachColumnFits(measuresAt(width));
      if (seen) expect(fits, `${width}px`).toBe(true);
      seen ||= fits;
    }
    expect(seen).toBe(true);
  });

  it("scales with a reader's larger default text size", () => {
    expect(coachColumnFits(measuresAt(1680))).toBe(true);
    expect(coachColumnFits(measuresAt(1680, 20))).toBe(false);
  });

  it("never fits on a measurement it cannot trust", () => {
    const sizes = { workspace: 4000, rootPx: 16, defaultRootPx: 16, descriptionCap: 578, codeSize: 13.6, editorColumns: 86, coachMinRem: 20, handle: 4 };
    expect(coachColumnFits(sizes)).toBe(true);
    expect(coachColumnFits({ ...sizes, descriptionCap: NaN })).toBe(false);
    expect(coachColumnFits({ ...sizes, editorColumns: NaN })).toBe(false);
  });

  it("opens the coach at the floating panel's width, floored at its minimum", () => {
    expect(token(globals, "coach-column-width")).toBe("26rem");
    expect(globals).toMatch(
      /\n\.coach-column \{\s*width: var\(--coach-column-width\);\s*min-width: var\(--coach-column-min\);\s*\}/,
    );
  });
});
