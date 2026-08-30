import { readFileSync } from "node:fs";
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
