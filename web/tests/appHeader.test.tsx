import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";

// Header reads the route and the learner's progress; both are stubbed so the
// nav can be rendered for a chosen pathname without a router or provider.
let pathname = "/courses/dsa/arrays";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
vi.mock("@/components/providers/ProgressProvider", () => ({
  useProgress: () => ({ visitedCount: 3, totalCount: 104 }),
}));

import { Header } from "@/components/layout/Header";
import { NAV_LINK_ACTIVE } from "@/components/layout/headerChrome";

const read = (...p: string[]) => readFileSync(join(__dirname, "..", "src", ...p), "utf8");
const header = read("components", "layout", "Header.tsx");

function navLinks(path: string) {
  pathname = path;
  const html = renderToStaticMarkup(<Header onOpenSearch={() => {}} showLessonsMenu showProgress />);
  return {
    lessons: html.match(/<a[^>]*href="\/courses\/dsa"[^>]*>/)![0],
    practice: html.match(/<a[^>]*href="\/courses\/dsa\/problems"[^>]*>/)![0],
  };
}

describe("app header", () => {
  it("shares its parts with the landing header, so the two cannot drift", () => {
    for (const file of [header, read("components", "landing", "LandingHeader.tsx")]) {
      expect(file).toMatch(/from "@\/components\/layout\/headerChrome"/);
      for (const name of ["LOGO_CHIP", "WORDMARK", "NAV_LINK", "ROUND_CONTROL"]) {
        expect(file).toContain(name);
      }
    }
  });

  it("is a hairline on the grainy desk, not a lifted bar", () => {
    const cls = header.match(/<header[^>]*className="([^"]*)"/)![1].split(/\s+/);
    for (const c of ["grain-paper", "bg-background", "border-b", "h-14"]) expect(cls).toContain(c);
    expect(cls.join(" ")).not.toMatch(/\bshadow-|\bbg-elevated\b/);
  });

  it("marks the active mode for assistive tech and with a steady underline", () => {
    for (const [path, on, off] of [
      ["/courses/dsa/arrays", "lessons", "practice"],
      ["/courses/dsa/problems", "practice", "lessons"],
    ] as const) {
      const links = navLinks(path);
      expect(links[on], `${path}: ${on}`).toContain('aria-current="page"');
      for (const c of NAV_LINK_ACTIVE.split(" ")) expect(links[on], `${path}: ${on} ${c}`).toContain(c);
      expect(links[off], `${path}: ${off}`).not.toContain("aria-current");
      expect(links[off], `${path}: ${off}`).not.toContain("decoration-2");
    }
  });

  it("drops the filled pill for the active mode", () => {
    expect(header).not.toMatch(/bg-pop font-semibold text-on-pop/);
  });

  it("renders the theme toggle round even before it mounts", () => {
    pathname = "/courses/dsa/arrays";
    const html = renderToStaticMarkup(<Header onOpenSearch={() => {}} showLessonsMenu showProgress />);
    const toggle = html.match(/<button[^>]*aria-label="Toggle theme"[^>]*>/)?.[0];
    expect(toggle, "theme toggle placeholder").toBeDefined();
    expect(toggle).toMatch(/\brounded-full\b/);
    expect(toggle).not.toMatch(/\bh-8\b/);
  });
});
