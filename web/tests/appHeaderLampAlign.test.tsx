// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// Header reads the route and the learner's progress; both are stubbed so it
// can be rendered without a router or provider.
vi.mock("next/navigation", () => ({ usePathname: () => "/courses/dsa/arrays" }));
vi.mock("@/components/providers/ProgressProvider", () => ({
  useProgress: () => ({ visitedCount: 3, totalCount: 104 }),
}));

import { Header } from "@/components/layout/Header";

/**
 * The lamp must centre on the wordmark, not on the row the wordmark sits in.
 *
 * The wordmark and the course label share an items-baseline row so their
 * baselines stay level, and the wordmark is text-base (rem, so 13–16px across
 * the root steps in globals.css) while the label is a fixed 13px. In a
 * baseline row the text lines up at the top of the line, and a 26px lamp
 * makes that line taller than the text's own line box. A self-center lamp
 * then sits (26 − line height) / 2 below the wordmark: measured 3.25px at the
 * 13px root and 1px at the 16px root. Centring the whole row instead levels
 * the lamp but pulls the two baselines 1.25px apart at the 16px root, where
 * the wordmark and label differ in size.
 *
 * The fix is structural, so this guards the structure: the lamp shares a
 * centred flex group with the wordmark, and that group sits inside the
 * baseline row beside the label.
 */
describe("app header lamp alignment", () => {
  const html = renderToStaticMarkup(<Header onOpenSearch={() => {}} showLessonsMenu showProgress />);
  const doc = new DOMParser().parseFromString(html, "text/html");
  const link = doc.querySelector("a.lamp-link");
  const lamp = link?.querySelector("svg.lamp");
  const classes = (el: Element | null | undefined) =>
    (el?.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);

  it("renders the home link with its lamp", () => {
    expect(link, "home link").not.toBeNull();
    expect(lamp, "lamp in the home link").not.toBeNull();
  });

  it("centres the lamp in a group with the wordmark, not on the baseline row", () => {
    const group = lamp?.parentElement;
    expect(classes(group)).toEqual(expect.arrayContaining(["flex", "items-center"]));
    expect(group?.textContent, "the wordmark shares the lamp's group").toContain("leetExpert");
    expect(classes(lamp), "a self-centred lamp would centre on the whole row").not.toContain("self-center");
  });

  it("keeps the wordmark and the course label on one baseline row", () => {
    const row = lamp?.parentElement?.parentElement;
    expect(classes(row)).toContain("items-baseline");
    // The course label is the row's last child, beside the lamp's group.
    expect(row?.lastElementChild).not.toBe(lamp?.parentElement);
    expect(classes(row?.lastElementChild)).toContain("text-muted");
  });
});
