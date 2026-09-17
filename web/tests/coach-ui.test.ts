import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(import.meta.dirname, "..", "src");
const OVERLAY = join(SRC, "components", "coach", "CoachOverlay.tsx");

describe("coach floating overlay", () => {
  it("portals to document.body", () => {
    // Load bearing, and invisible to the type checker: PageEnter wraps route
    // content in a motion.div whose inline `transform` becomes the containing
    // block for any fixed-position descendant. Drop the portal and the panel
    // silently anchors to the route wrapper instead of the viewport.
    const body = readFileSync(OVERLAY, "utf8");
    expect(body).toMatch(/createPortal\(/);
    expect(body).toMatch(/document\.body/);
  });

  it("lifts the floating panel with the all-around elevation shadow", () => {
    // A detached floating surface takes .shadow-elevation; .shadow-edge-* is
    // for panels attached to visible content on exactly one side (CLAUDE.md
    // §4). The old rail was edge-left; carrying that over would light the
    // panel from one side with nothing beside it to justify the direction.
    const body = readFileSync(OVERLAY, "utf8");
    expect(body).toMatch(/shadow-elevation/);
    expect(body).not.toMatch(/shadow-edge-/);
  });
});

describe("coach column", () => {
  const read = (...p: string[]) => readFileSync(join(SRC, ...p), "utf8");

  it("keeps the sandbox as the split's primary in every layout, and floats only in floating layout", () => {
    const ide = read("components", "coach", "IdeWithCoach.tsx");
    expect(ide).toMatch(/primary=\{sandbox\}/);
    expect(ide).toContain('sizedPane="secondary"');
    expect(ide).toContain('storageKey="dsa:coach:column-width"');
    // Collapsed, the column leaves the layout and the floating launcher brings it back.
    expect(ide).toMatch(/\{column && open \? null : <CoachOverlay \/>\}/);
    expect(ide).toMatch(/secondary=\{column && open \? <CoachPanel variant="column" \/> : null\}/);
    expect(existsSync(join(SRC, "components", "coach", "CoachStrip.tsx"))).toBe(false);
    expect(ide).toMatch(/coachColumnFits\(/);
    expect(ide).toContain('closest<HTMLElement>("[data-problem-workspace]")');
    expect(read("components", "problems", "ProblemWorkspace.tsx")).toMatch(/<div data-problem-workspace /);
  });

  it("collapses from the column header, naming the state", () => {
    const panel = read("components", "coach", "CoachPanel.tsx");
    expect(panel).toMatch(/aria-label="Collapse problem coach"\s+aria-expanded=\{true\}/);
  });

  it("is layout, not a popover: no dialog role and no Escape in the column", () => {
    const panel = read("components", "coach", "CoachPanel.tsx");
    expect(panel).toMatch(/role=\{variant === "floating" \? "dialog" : variant === "column" \? "complementary" : undefined\}/);
    expect(panel).toMatch(/e\.key === "Escape" && variant === "floating"/);
  });
});
