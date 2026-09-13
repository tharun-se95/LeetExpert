import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const workspace = readFileSync(
  join(__dirname, "..", "src", "components", "problems", "ProblemWorkspace.tsx"),
  "utf8",
);
/** The TabList component's own source, so other elements can't satisfy it. */
const tabList = workspace.slice(workspace.indexOf("function TabList("));

describe("problem workspace tab bar", () => {
  const scroller = tabList.match(/role="tablist"[\s\S]*?className="([^"]*)"/)?.[1] ?? "";
  const beforeScroller = tabList.slice(0, tabList.indexOf('role="tablist"'));
  const tabClasses = tabList.slice(tabList.indexOf('role="tab"'));

  it("never scrolls vertically", () => {
    // overflow-x: auto silently makes overflow-y auto as well, so any 1px that
    // escapes the bar turns it into a vertical scroller — measured: 28px
    // visible vs 29px content on desktop, 35 vs 36 on mobile, scrollTop 1.
    expect(scroller).toContain("overflow-x-auto");
    expect(scroller).toContain("overflow-y-hidden");
  });

  it("keeps horizontal scroll for tab rows wider than the screen", () => {
    // Six mobile tabs measured 324px in a 320px viewport.
    expect(scroller).toContain("overflow-x-auto");
  });

  it("draws the rule on a wrapper the scroller extends over", () => {
    // The underline used to sit 1px below the scroller to land on the
    // scroller's own border-b — which is outside a scroll box's clip area.
    expect(scroller).not.toMatch(/\bborder-b\b/);
    expect(scroller).toContain("-mb-px");
    expect(beforeScroller).toMatch(/className=\{cn\(\s*"[^"]*\bborder-b border-border\b/);
  });

  it("anchors the underline inside the scroll area", () => {
    expect(tabClasses).not.toContain("after:-bottom-px");
    expect(tabClasses).toContain("after:bottom-0");
  });

  it("gives tabs a focus ring the scroller cannot clip", () => {
    // The browser's default outline is drawn outside the tab, and the scroll
    // box cut it off at the top and bottom. An inset ring stays inside.
    for (const c of [
      "focus-visible:outline-none",
      "focus-visible:ring-2",
      "focus-visible:ring-inset",
      "focus-visible:ring-accent",
    ]) {
      expect(tabClasses).toContain(c);
    }
  });
});
