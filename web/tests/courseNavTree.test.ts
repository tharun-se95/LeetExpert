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

  it("derives the level instead of storing it, and drops the override on navigation", () => {
    expect(tree).toContain("resolveNavView");
    // The override is the only stored piece; a stored level would go stale
    // against the route.
    expect(tree).toMatch(/useState<boolean>\(false\)|useState\(false\)/);
    expect(tree).toMatch(
      /useEffect\(\(\) => \{\s*setBackToModules\(false\);?\s*\}, \[pathname\]\)/,
    );
  });

  it("skips the animation under prefers-reduced-motion", () => {
    expect(tree).toContain("useReducedMotion");
    expect(tree).toContain("AnimatePresence");
  });

  it("moves focus from a callback ref, not an effect", () => {
    // mode="wait" mounts the incoming level only after the exit finishes, so
    // an effect (or onExitComplete) fires while the row is still unmounted —
    // both were tried and left focus on <body>.
    expect(tree).toMatch(
      /useCallback\(\(el: HTMLAnchorElement \| null\) => \{[\s\S]*?el\.focus\(\)/,
    );
    // The prop, not the word: the component's comment explains why it is
    // the wrong hook here.
    expect(tree).not.toMatch(/onExitComplete=/);
  });

  it("keeps the call-site props", () => {
    expect(tree).toMatch(/compact = true/);
    expect(tree).toMatch(/className\?: string/);
  });
});
