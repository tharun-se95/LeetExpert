import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (...p: string[]) =>
  readFileSync(join(__dirname, "..", "src", ...p), "utf8");
const sidebar = read("components", "layout", "Sidebar.tsx");
const floating = read("components", "layout", "FloatingLessonsButton.tsx");
const shell = read("components", "layout", "AppShell.tsx");
const header = read("components", "layout", "Header.tsx");
const globals = read("app", "globals.css");
const workspace = read("components", "problems", "ProblemWorkspace.tsx");

/** The className string of the first element carrying `aria-label`. */
const classOf = (src: string, ariaLabel: string) => {
  const el = src.match(
    new RegExp(`<button[\\s\\S]*?aria-label="${ariaLabel}"[\\s\\S]*?</button>`),
  )![0];
  return el.match(/className="([^"]*)"/)![1];
};

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
    const cls = classOf(jsx, "Close lessons drawer");
    expect(cls).toMatch(/absolute/);
    // A negative right offset is what puts it outside the rail.
    expect(cls).toMatch(/-right-/);
    // It would otherwise sit over the article with the drawer shut.
    expect(jsx).toMatch(/\{open \?[\s\S]*?aria-label="Close lessons drawer"/);
  });

  it("reads as a tab on the panel's own page, not a chip beside it", () => {
    const cls = classOf(jsx, "Close lessons drawer");
    // Same paper as the panel, by the same classes — not a re-authored colour.
    expect(cls).toContain("sidebar-rail");
    expect(cls).toContain("drawer-tab");
    // Only the outer corners round; the seam side stays square and borderless
    // so the tab joins the panel instead of sitting beside it.
    expect(cls).toMatch(/rounded-r-/);
    expect(cls).toContain("border-l-0");
    // Measured at 8x: its own shadow fell back onto the panel as a dark band
    // beside the seam (246 -> 243 in light), outlining it as a separate
    // object. The tab is part of the sheet; the sheet casts the shadow.
    expect(cls).not.toMatch(/shadow-/);
    // The fillets draw their curve in --border and cannot follow a hover
    // colour, so hover must not recolour the tab's own border either.
    expect(cls).not.toMatch(/hover:border-/);
  });

  it("sits flush against the panel, over its border line", () => {
    // The offset has to equal the tab's own width: one step less and a gap
    // opens, one more and the rail's border-r draws a seam across its base.
    const cls = classOf(jsx, "Close lessons drawer");
    expect(cls.match(/-right-(\d+)/)![1]).toBe(cls.match(/\bw-(\d+)/)![1]);
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

describe("drawer tab idiom", () => {
  /**
   * A rule body from globals.css, by its exact selector. Skips a match that
   * is the tail of a selector list (".a,\n.b {"), which would otherwise hand
   * back the shared rule's body instead of the selector's own.
   */
  const rule = (selector: string) => {
    let at = globals.indexOf(`${selector} {`);
    while (at > 0 && globals.slice(at - 2, at) === ",\n") {
      at = globals.indexOf(`${selector} {`, at + 1);
    }
    expect(at, `missing rule: ${selector}`).toBeGreaterThanOrEqual(0);
    return globals.slice(at, globals.indexOf("}", at));
  };

  it("paints the rail in the app header's own paper, in both themes", () => {
    // Owner request (2026-09-13): the drawer matches the header — the token
    // the header's bg-* class names, no steel wash, and no per-theme override,
    // so light and dark both follow whatever the header paints. One solid
    // token also lets the tabs' fillets reuse it as a gradient stop.
    const headerBg = header.match(/<header[^>]*className="[^"]*\bbg-([a-z-]+)\b/)![1];
    expect(rule(".sidebar-rail")).toMatch(
      new RegExp(`--rail-surface:\\s*var\\(--${headerBg}\\);`),
    );
    expect(rule(".sidebar-rail")).toMatch(/background-color:\s*var\(--rail-surface\)/);
    expect(rule(".sidebar-rail")).not.toMatch(/background-image|color-mix/);
    expect(globals).not.toContain(".dark .sidebar-rail {");
  });

  it("flares into the sheet with concave fillets, drawn in the rail's own inks", () => {
    // Without them the rail's border line ends in a square step where the
    // tab's top and bottom borders begin.
    for (const pseudo of [".drawer-tab::before", ".drawer-tab::after"]) {
      const body = rule(pseudo);
      expect(body).toContain("var(--rail-surface)");
      expect(body).toContain("var(--border)");
      expect(body).toMatch(/radial-gradient\(/);
    }
    expect(rule(".drawer-tab::before,\n.drawer-tab::after")).toMatch(
      /pointer-events:\s*none/,
    );
  });

  it("overlaps each fillet onto the tab's border row, not beside it", () => {
    // An absolute child measures from the padding box, inside the tab's 1px
    // borders, so a bare 100% lands the fillet 1px into the border row: that
    // covers the straight border under the flare and meets the ring to the
    // row's centre-line. "+1px" looks like the fix for the padding box and is
    // the bug — measured at 8x it left a line across the flare and a 1px step.
    expect(rule(".drawer-tab::before")).toMatch(/\bbottom:\s*100%;/);
    expect(rule(".drawer-tab::after")).toMatch(/\btop:\s*100%;/);
  });

  it("makes the opener the same tab, on the closed sheet's edge", () => {
    const cls = floating.match(/className="([^"]*)"/)![1];
    for (const c of ["sidebar-rail", "drawer-tab", "border-l-0", "left-0"]) {
      expect(cls).toContain(c);
    }
    expect(cls).toMatch(/rounded-r-/);
    expect(cls).not.toMatch(/rounded-full|shadow-|hover:border-/);
    // Same size as the close tab, so opening and closing read as one tab.
    const close = classOf(sidebar.replace(/\{\/\*[\s\S]*?\*\/\}/g, ""), "Close lessons drawer");
    expect(cls.match(/\bw-(\d+)/)![1]).toBe(close.match(/\bw-(\d+)/)![1]);
    expect(cls.match(/\bh-(\d+)/)![1]).toBe(close.match(/\bh-(\d+)/)![1]);
  });

  it("holds the opener at the close tab's height on screen", () => {
    // The close tab is absolute inside a rail that starts under the header;
    // the opener is fixed to the viewport. Header height + the close tab's
    // own offset is where it sits, so the tab does not jump on close.
    // The <header> element's own height — Header.tsx sizes a logo and
    // icons with h-* before it.
    const headerH = Number(
      header.match(/<header[^>]*className="[^"]*\bh-(\d+)\b/)![1],
    );
    const closeTop = Number(
      classOf(sidebar.replace(/\{\/\*[\s\S]*?\*\/\}/g, ""), "Close lessons drawer").match(
        /\btop-(\d+)\b/,
      )![1],
    );
    const openerTop = Number(
      floating.match(/className="[^"]*\btop-(\d+)\b/)![1],
    );
    expect(openerTop).toBe(headerH + closeTop);
  });
});

describe("problem page drawer tab", () => {
  /** The problem header's className, and the step values we reason in. */
  const headerCls = () => workspace.match(/<header className="([^"]*)"/)![1];
  const closeCls = () =>
    classOf(sidebar.replace(/\{\/\*[\s\S]*?\*\/\}/g, ""), "Close lessons drawer");

  it("uses the same opener tab as lesson pages, not an inline header toggle", () => {
    // One opener idiom app-wide: the inline toggle beside the title was a
    // second, differently shaped control for the same drawer — and with the
    // drawer open it relabelled itself a second "Close lessons drawer".
    expect(shell).toMatch(/\{showCourseNav \? <FloatingLessonsButton \/> : null\}/);
    expect(workspace).not.toContain('aria-controls="lessons-sidebar"');
    expect(workspace).not.toMatch(/toggleSidebar|useSidebar/);
  });

  it("still keeps the hover edge strip off the IDE", () => {
    // The description pane starts at the left edge; a pointer resting there
    // must not throw the drawer open over the problem.
    expect(shell).toMatch(/showCourseNav && !ideViewport && canHover && !sidebarOpen/);
  });

  it("reserves the tab's room at the header's leading edge", () => {
    // Measured before this: with the drawer open the close tab sat on top of
    // the back link (x 319-353 vs 335-413) — the header started its content
    // exactly where the tab hangs, in both drawer states.
    const pl = Number(headerCls().match(/\blg:pl-(\d+)\b/)?.[1] ?? NaN);
    const tabW = Number(closeCls().match(/\bw-(\d+)\b/)![1]);
    expect(pl).toBeGreaterThan(tabW);
  });

  it("is tall enough on desktop to hold the tab and both fillets", () => {
    // The tabs sit at the rail's top-4 on every page, which here lands them
    // in the problem header's band. The bottom fillet ends --radius-md below
    // the tab; at py-2 that overran the header's border-b into the
    // description pane. Spacing steps are 4px at the root size.
    const py = Number(headerCls().match(/\blg:py-(\d+)\b/)?.[1] ?? NaN);
    const controlH = Number(
      workspace.match(/href=\{backHref\}\s+className="[^"]*\bmin-h-(\d+)\b/)![1],
    );
    const tabTop = Number(closeCls().match(/\btop-(\d+)\b/)![1]);
    const tabH = Number(closeCls().match(/\bh-(\d+)\b/)![1]);
    const radius = Number(globals.match(/--radius-md:\s*(\d+)px/)![1]);
    const filletBottom = (tabTop + tabH) * 4 + radius;
    const bandInner = (2 * py + controlH) * 4 - 1; // less its 1px border-b
    expect(filletBottom).toBeLessThanOrEqual(bandInner);
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
