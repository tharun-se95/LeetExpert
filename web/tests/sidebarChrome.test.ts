import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (...p: string[]) =>
  readFileSync(join(__dirname, "..", "src", ...p), "utf8");
const sidebar = read("components", "layout", "Sidebar.tsx");
const floating = read("components", "layout", "FloatingLessonsButton.tsx");
const tree = read("components", "layout", "CourseNavTree.tsx");
const panel = read("components", "layout", "CourseNavPanel.tsx");
const shell = read("components", "layout", "AppShell.tsx");
const header = read("components", "layout", "Header.tsx");
const globals = read("app", "globals.css");
const workspace = read("components", "problems", "ProblemWorkspace.tsx");


describe("Sidebar chrome", () => {
  /** Comments sit between JSX nodes here; ordering assertions read the tree. */
  const jsx = sidebar.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

  it("drops the 'Lessons' title bar — the panel names itself now", () => {
    expect(sidebar).not.toMatch(/>\s*Lessons\s*</);
  });

  it("always offers a close button, on every pointer type", () => {
    // FloatingLessonsButton hides itself while the drawer is open, so the
    // drawer's own pinned header row is the only close control on desktop —
    // and touch has no hover at all. Tab order and placement are rendered in
    // courseNavPanel.test.tsx ("CourseNavPanel header row").
    expect(jsx).toMatch(/<CourseNavTree[^>]*\bonClose=\{onClose\}/);
    expect(tree).toMatch(/<CourseNavPanel[\s\S]*?\bonClose=\{onClose\}/);
    expect(panel).toContain('aria-label="Close lessons drawer"');
    expect(floating).toContain("if (open) return null;");
  });

  it("keeps the close button inside the drawer, not hanging off its edge", () => {
    // The 2026-09-13 edge tab is gone (owner, 2026-09-14): no close control of
    // the aside's own, and nothing offset past its right edge.
    expect(sidebar).not.toContain('aria-label="Close lessons drawer"');
    expect(sidebar).not.toMatch(/-right-\d/);
  });

  it("starts the nav at the top of the panel", () => {
    // No chrome row above it: the close button left the flow entirely.
    expect(jsx).toMatch(/style=\{\{ width \}\}>\s*<CourseNavTree/);
  });

  it("keeps the rail's edge shadow off the header above it", () => {
    // The rail sits above the header (z-45 over z-40), so its shadow cannot
    // tuck under it, and a box-shadow's blur spreads vertically as well: a
    // band of shade ran up across the rail's full width onto the header's
    // bottom edge (measured 1.5px above the rail: header 255 -> 247 in light,
    // 38 -> 32 in dark). With header and rail on one paper it read as a dirty
    // seam. The aside clips to its own top, bottom and left; only the right
    // stays open, where the shadow and the close tab belong.
    const asideCls = sidebar.match(/"(sidebar-rail print:hidden[^"]*)"/)![1];
    const clip = asideCls.match(/\[clip-path:inset\(([^)]*)\)\]/);
    expect(clip, "the rail must clip its own shadow").toBeTruthy();
    const [top, right, bottom, left] = clip![1].split("_");
    expect([top, bottom, left]).toEqual(["0", "0", "0"]);
    const rightRem = Number(right!.match(/^-(\d*\.?\d+)rem$/)?.[1] ?? NaN);
    // Wider than the shadow's own reach (offset + blur) in either theme, even
    // at a 12px root, or the clip would cut the shadow it keeps.
    const reach = [...globals.matchAll(/--shadow-edge-right:\s*(\d+)px\s+0\s+(\d+)px/g)].map(
      (m) => Number(m[1]) + Number(m[2]),
    );
    expect(reach.length).toBeGreaterThanOrEqual(2);
    expect(Math.max(...reach)).toBeLessThan(rightRem * 12);
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
      new RegExp(`background-color:\\s*var\\(--${headerBg}\\);`),
    );
    expect(rule(".sidebar-rail")).not.toMatch(/background-image|color-mix/);
    expect(globals).not.toContain(".dark .sidebar-rail {");
  });
});

describe("floating opener", () => {
  it("is a round floating button in the bottom-left corner, not a tab", () => {
    const cls = floating.match(/className=\{cn\(ROUND_CONTROL, "([^"]*)"\)\}/)?.[1];
    expect(cls, "opener classes").toBeDefined();
    for (const c of ["fixed", "bottom-6", "left-6", "bg-background", "shadow-elevation", "lg:flex"]) {
      expect(cls!.split(" "), c).toContain(c);
    }
    expect(floating).toMatch(/import \{[^}]*\bROUND_CONTROL\b[^}]*\} from "@\/components\/layout\/headerChrome"/);
    expect(floating).not.toMatch(/drawer-tab|sidebar-rail|rounded-r-|border-l-0/);
  });

  it("never covers the end of the problem description: the pane scrolls its text clear of it", () => {
    // The description pane runs to the viewport's bottom-left corner, under
    // the opener. Its scroll area ends in bottom padding covering the opener's
    // inset plus its height, plus a 1rem gap (Tailwind spacing units), from lg,
    // where the opener shows.
    const cls = floating.match(/className=\{cn\(ROUND_CONTROL, "([^"]*)"\)\}/)?.[1] ?? "";
    const units = (prefix: string) => Number(cls.match(new RegExp(`(?:^| )${prefix}-(\\d+)(?: |$)`))?.[1]);
    const covered = units("bottom") + units("h");
    expect(covered).toBeGreaterThan(0);
    // The desktop pane; the phone layout's panel sits below lg, where the opener is hidden.
    const panel = workspace.match(/function LeftPane[\s\S]*?role="tabpanel"[\s\S]*?className="([^"]*)"/)?.[1] ?? "";
    const padding = Number(panel.match(/(?:^| )lg:pb-(\d+)(?: |$)/)?.[1]);
    expect(padding, panel).toBe(covered + 4);
  });

  it("floats above the hover edge strip, so resting on it does not open the drawer", () => {
    const opener = Number(floating.match(/\bz-(\d+)\b/)![1]);
    const strip = Number(shell.match(/fixed top-14 bottom-0 left-0 z-(\d+)/)![1]);
    expect(opener).toBeGreaterThan(strip);
  });

  it("leaves no drawer tab styles behind", () => {
    expect(globals).not.toContain(".drawer-tab");
    for (const src of [sidebar, floating]) expect(src).not.toContain("drawer-tab");
  });
});

describe("problem page drawer opener", () => {
  /** The problem header's className. */
  const headerCls = () => workspace.match(/<header className="([^"]*)"/)![1];

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

  it("reserves no room for a tab in the problem header", () => {
    // The opener floats at the bottom-left now, so the band is back to its
    // compact size and starts its content at its own padding.
    expect(headerCls()).not.toMatch(/\blg:pl-\d+|\blg:py-\d+/);
    expect(headerCls()).toContain("sm:py-2");
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
    // The resize grip's pill overhangs the rail's right edge, so the x test
    // alone would start the close timer while the pointer is on it.
    expect(shell).toMatch(/rail\.contains\(/);
  });

  it("is dismissible from the keyboard (WCAG 1.4.13)", () => {
    expect(shell).toMatch(/e\.key === "Escape"/);
  });

  it("does not persist a hover-driven drawer as a preference", () => {
    expect(shell).toMatch(/canHover\) return;/);
  });
});

describe("header overlay", () => {
  it("starts the rail below the overlaying header", () => {
    // The app header is absolute over the page (spec 2026-09-15). The rail must
    // not slide under it, or its pinned close row would be covered.
    const asideCls = sidebar.match(/"(sidebar-rail print:hidden[^"]*)"/)![1].split(/\s+/);
    expect(asideCls).toContain("mt-14");
    expect(asideCls).not.toContain("h-full");
  });

  it("lets pages scroll under the header", () => {
    expect(shell).toContain('className="relative flex h-dvh flex-col overflow-hidden"');
    expect(shell).toContain('!landing && "pt-14"');
  });
});
