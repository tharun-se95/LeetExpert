import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const SRC = join(__dirname, "..", "src");
const tree = readFileSync(
  join(SRC, "components", "layout", "CourseNavTree.tsx"),
  "utf8",
);

describe("CourseNavTree wiring", () => {
  it("renders one Course nav landmark around the shared panel", () => {
    expect(tree.match(/aria-label="Course"/g)).toHaveLength(1);
    expect(tree).toContain("<CourseNavPanel");
  });

  it("renders the single-level navigation panel directly without 2-level slide transitions", () => {
    expect(tree).not.toContain("resolveNavView");
    expect(tree).not.toContain("AnimatePresence");
  });

  it("keeps the call-site props", () => {
    expect(tree).toMatch(/compact = true/);
    expect(tree).toMatch(/className\?: string/);
  });
});
