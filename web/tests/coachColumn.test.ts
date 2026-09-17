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
