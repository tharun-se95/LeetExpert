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
const shell = readFileSync(
  join(__dirname, "..", "src", "components", "layout", "AppShell.tsx"),
  "utf8",
);

describe("Sidebar chrome", () => {
  it("drops the 'Lessons' title bar — the panel names itself now", () => {
    expect(sidebar).not.toMatch(/>\s*Lessons\s*</);
  });

  it("keeps an explicit close where the pointer cannot hover", () => {
    // Touch has no hover, and FloatingLessonsButton hides itself while the
    // drawer is open — without this the drawer would be stuck open on a
    // touchscreen.
    expect(sidebar).toContain("showClose");
    expect(sidebar).toContain('aria-label="Close lessons drawer"');
    expect(floating).toContain("if (open) return null;");
  });
});

describe("hover-driven drawer", () => {
  it("opens from an edge strip, since a closed drawer is 0px wide", () => {
    expect(shell).toContain('"(hover: hover) and (pointer: fine)"');
    expect(shell).toMatch(/onPointerEnter=\{openOnHover\}/);
  });

  it("closes on pointer-leave, after a grace delay long enough to read as auto-close", () => {
    // Not a snap: a ~200ms grace felt like a glitch when the pointer merely
    // clipped the panel's edge.
    expect(shell).toMatch(/const HOVER_CLOSE_MS = (\d+);/);
    const ms = Number(shell.match(/const HOVER_CLOSE_MS = (\d+);/)![1]);
    expect(ms).toBeGreaterThanOrEqual(500);
    expect(shell).toMatch(/onPointerLeave=\{canHover \? closeAfterGrace : undefined\}/);
  });

  it("closes by pointer position, not only by the panel's own leave event", () => {
    // The drawer slides in under a stationary cursor, so pointerenter never
    // fires on it and pointerleave never follows — it would hang open.
    expect(shell).toContain('window.addEventListener("pointermove", onMove)');
    expect(shell).toMatch(/clientX > rail\.getBoundingClientRect\(\)\.right/);
  });

  it("is dismissible from the keyboard (WCAG 1.4.13)", () => {
    expect(shell).toMatch(/e\.key === "Escape"/);
  });

  it("does not persist a hover-driven drawer as a preference", () => {
    expect(shell).toMatch(/canHover\) return;/);
  });
});
