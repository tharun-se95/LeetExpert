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
import { NAV_LINK_ACTIVE, TRANSLUCENT_PAPER } from "@/components/layout/headerChrome";

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
      for (const name of ["LOGO_LAMP_SIZE", "WORDMARK", "NAV_LINK", "ROUND_CONTROL"]) {
        expect(file).toContain(name);
      }
    }
  });

  it("overlays the page as translucent paper with the edge shadow", () => {
    // Lesson and module pages scroll under it (spec 2026-09-15): the page grain
    // shows through, blurred. 90% keeps muted text AA over a dark code block
    // passing beneath (grainContrast.test.ts); an opaque grain layer could not.
    const cls = header.match(/<header[^>]*className="([^"]*)"/)![1].split(/\s+/);
    for (const c of ["absolute", "top-0", "h-14", "border-b", "shadow-edge-bottom", ...TRANSLUCENT_PAPER.split(" ")]) {
      expect(cls, c).toContain(c);
    }
    expect(cls).not.toContain("grain-paper");
    expect(cls).not.toContain("sticky");
  });

  it("moves scroll-relative offsets below the overlaying header", () => {
    // The page scroller now starts under the 3.5rem header, so anything placed
    // from its top shifts down by that much or hides behind the header.
    expect(read("components", "md", "TableOfContents.tsx")).toMatch(/sticky top-38 max-h-\[calc\(100vh-10\.5rem\)\]/);
    expect(read("components", "md", "Markdown.tsx")).toContain("prose-headings:scroll-mt-38");
    expect(read("app", "courses", "nextjs", "[module]", "[chapter]", "[lesson]", "page.tsx")).toContain('className="sticky top-34"');
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

  it("keeps a link name at every width — the wordmark is sr-only below sm, never removed", () => {
    // With the lessons menu present the wordmark gives up its room below sm so
    // the header fits a phone. The lamp beside it is aria-hidden, so the
    // wordmark is the home link's only accessible name: it has to leave the
    // layout (sr-only) without leaving the accessibility tree (hidden).
    pathname = "/courses/dsa/arrays";
    const html = renderToStaticMarkup(<Header onOpenSearch={() => {}} showLessonsMenu showProgress />);
    const home = html.match(/<a[^>]*href="\/"[^>]*>[\s\S]*?<\/a>/)?.[0];
    expect(home, "home link").toBeDefined();
    expect(home).toMatch(/leet[\s\S]*Expert/);
    expect(home).toMatch(/max-sm:sr-only/);
    expect(home).not.toMatch(/max-sm:hidden/);
  });
});
