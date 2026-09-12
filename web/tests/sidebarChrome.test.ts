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
  /** Comments sit between JSX nodes here; ordering assertions read the tree. */
  const jsx = sidebar.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

  it("drops the 'Lessons' title bar — the panel names itself now", () => {
    expect(sidebar).not.toMatch(/>\s*Lessons\s*</);
  });

  it("always offers a close button, on every pointer type", () => {
    // FloatingLessonsButton hides itself while the drawer is open, so this is
    // the only close control on desktop — and touch has no hover at all.
    expect(sidebar).toContain('aria-label="Close lessons drawer"');
    expect(sidebar).not.toContain("showClose");
    expect(floating).toContain("if (open) return null;");
  });

  it("hangs the close button past the panel's edge, not above the rows", () => {
    const close = jsx.match(
      /<button[\s\S]*?aria-label="Close lessons drawer"[\s\S]*?<\/button>/,
    )![0];
    expect(close).toMatch(/absolute/);
    // A negative right offset is what puts it outside the rail.
    expect(close).toMatch(/-right-/);
    // It would otherwise sit over the article with the drawer shut.
    expect(jsx).toMatch(/\{open \?[\s\S]*?aria-label="Close lessons drawer"/);
  });

  it("puts the way out before the rows in the tab order", () => {
    // Absolute positioning frees source order from visual order, so the close
    // button leads: tabbing into the drawer should not cost 20 lesson rows to
    // reach it. Esc is the other way out (see the hover-drawer tests).
    expect(jsx.indexOf('aria-label="Close lessons drawer"')).toBeLessThan(
      jsx.indexOf("<CourseNavTree"),
    );
  });

  it("starts the nav at the top of the panel", () => {
    // No chrome row above it: the close button left the flow entirely.
    expect(jsx).toMatch(/style=\{\{ width \}\}>\s*<CourseNavTree/);
  });

  it("keeps the collapsing column clipped by an inner wrapper", () => {
    // The aside can no longer hide its overflow — that is what lets the close
    // button hang outside — so the clip moves to a wrapper that is exactly as
    // wide as the animating rail. Without it the tree spills out when closed.
    expect(jsx).toMatch(
      /overflow-hidden[^"]*">\s*<div className="flex h-full flex-col" style=\{\{ width \}\}/,
    );
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
    expect(shell).toMatch(/const HOVER_CLOSE_MS = [\d_]+;/);
    const ms = Number(
      shell.match(/const HOVER_CLOSE_MS = ([\d_]+);/)![1].replace(/_/g, ""),
    );
    // A slow tidy-up, not a reaction to the pointer: closing belongs to the
    // close button.
    expect(ms).toBeGreaterThanOrEqual(30_000);
    expect(shell).toMatch(/onPointerLeave=\{canHover \? closeAfterGrace : undefined\}/);
  });

  it("pushes the article rather than overlaying it", () => {
    expect(sidebar).toContain("relative z-[45]");
    expect(sidebar).not.toMatch(/fixed top-14 bottom-0 left-0/);
    expect(sidebar).toMatch(/transition-\[width\]/);
  });

  it("pushes gently, on tokens rather than a one-off duration", () => {
    const globals = readFileSync(
      join(__dirname, "..", "src", "app", "globals.css"),
      "utf8",
    );
    expect(globals).toMatch(/--dur-gentle:/);
    expect(globals).toMatch(/--ease-gentle:/);
    expect(sidebar).toContain("duration-[var(--dur-gentle)]");
    expect(sidebar).toContain("ease-[var(--ease-gentle)]");
  });

  it("closes by pointer position, not only by the panel's own leave event", () => {
    // The drawer slides in under a stationary cursor, so pointerenter never
    // fires on it and pointerleave never follows — it would hang open.
    expect(shell).toContain('window.addEventListener("pointermove", onMove)');
    expect(shell).toMatch(/clientX > rail\.getBoundingClientRect\(\)\.right/);
  });

  it("counts the drawer's own overhanging controls as still inside it", () => {
    // The close button sits past the rail's right edge on purpose, so the x
    // test alone would start the close timer while the pointer is on it.
    expect(shell).toMatch(/rail\.contains\(/);
  });

  it("is dismissible from the keyboard (WCAG 1.4.13)", () => {
    expect(shell).toMatch(/e\.key === "Escape"/);
  });

  it("does not persist a hover-driven drawer as a preference", () => {
    expect(shell).toMatch(/canHover\) return;/);
  });
});
