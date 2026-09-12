import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const sidebar = readFileSync(
  join(__dirname, "..", "src", "components", "layout", "Sidebar.tsx"),
  "utf8",
);
const floating = readFileSync(
  join(__dirname, "..", "src", "components", "layout", "FloatingLessonsButton.tsx"),
  "utf8",
);

describe("Sidebar chrome", () => {
  it("drops the 'Lessons' title bar — the panel names itself now", () => {
    expect(sidebar).not.toMatch(/>\s*Lessons\s*</);
  });

  it("keeps a way to close the drawer on desktop", () => {
    // FloatingLessonsButton hides itself while the drawer is open, so this is
    // the only close affordance on >=lg. Losing it strands the drawer open.
    expect(sidebar).toContain('aria-label="Close lessons drawer"');
    expect(floating).toContain("if (open) return null;");
  });
});
