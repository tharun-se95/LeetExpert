import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { TRANSLUCENT_PAPER } from "@/components/layout/headerChrome";

const src = join(__dirname, "..", "src");
const read = (...p: string[]) => readFileSync(join(src, ...p), "utf8");

const html = renderToStaticMarkup(<LandingHeader onOpenSearch={() => {}} />);
const headerTag = html.match(/<header[^>]*>/)![0];
type Props = { children?: ReactNode; onClick?: unknown };

/** First element in the tree (depth-first, through children) matching `hit`. */
function findElement(
  node: ReactNode,
  hit: (el: ReactElement<Props>) => boolean,
): ReactElement<Props> | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElement(child, hit);
      if (found) return found;
    }
    return undefined;
  }
  if (!isValidElement<Props>(node)) return undefined;
  if (hit(node)) return node;
  return findElement(node.props.children, hit);
}

describe("LandingHeader", () => {
  it("carries no lessons or practice links", () => {
    expect(html).not.toMatch(/href="\/courses\/dsa"/);
    expect(html).not.toMatch(/href="\/courses\/dsa\/problems"/);
  });

  it("stays pinned: clear over the paper at rest, a translucent paper once scrolled", () => {
    expect(headerTag).toMatch(/\bsticky\b/);
    expect(headerTag).toMatch(/\btop-0\b/);
    expect(headerTag).toMatch(/\bz-30\b/);
    expect(headerTag).toMatch(/\bborder-b\b/);
    // At the top the page paper shows through.
    expect(headerTag).not.toMatch(/\bbg-/);
    expect(headerTag).not.toMatch(/\bshadow-/);
    expect(headerTag).not.toMatch(/\bbackdrop-/);

    const scrolled = renderToStaticMarkup(<LandingHeader onOpenSearch={() => {}} scrolled />).match(/<header[^>]*>/)![0];
    // The shared translucent paper (headerChrome.ts), 90% like the app chrome:
    // at 80% muted text fell to 3.85:1 over a dark block passing beneath.
    for (const c of TRANSLUCENT_PAPER.split(" ")) expect(scrolled, c).toContain(c);
    expect(scrolled).not.toMatch(/\bbg-background\/80\b/);
    expect(read("components", "landing", "LandingHeader.tsx")).toMatch(/\bTRANSLUCENT_PAPER\b/);
    // The shared edge-shadow token, as the app's sticky header uses (CLAUDE.md §4).
    expect(scrolled).toMatch(/\bshadow-edge-bottom\b/);
    // Same padding either way, so nothing below jumps when it changes.
    expect(scrolled.match(/\bpy-\d+\b/)?.[0]).toBe(headerTag.match(/\bpy-\d+\b/)?.[0]);
  });

  it("hands the search button the shell's opener", () => {
    const onOpenSearch = vi.fn();
    const button = findElement(LandingHeader({ onOpenSearch }), (el) => el.type === "button");
    expect(button, "search button").toBeDefined();
    expect(button!.props.onClick).toBe(onOpenSearch);
  });

  it("shows the wordmark on phones from 360px, sr-only below that, never removed", () => {
    // Owner, 2026-09-24: a phone visit never saw the name. It is visible from
    // 360px (measured to fit beside the nav there) and stays the link's
    // accessible name below, since the lamp is aria-hidden.
    const home = html.match(/<a[^>]*href="\/"[^>]*>[\s\S]*?<\/a>/)![0];
    expect(home).toContain("leet");
    expect(home).toMatch(/max-\[360px\]:sr-only/);
    expect(home).not.toMatch(/max-sm:sr-only|:hidden/);
  });

  it("renders the theme toggle round even before it mounts", () => {
    // Server markup is ThemeToggle's pre-mount placeholder; if the className
    // skipped it, the round toggle would pop in square after hydration.
    const toggle = html.match(/<button[^>]*aria-label="Toggle theme"[^>]*>/)?.[0];
    expect(toggle, "theme toggle placeholder").toBeDefined();
    expect(toggle).toMatch(/\brounded-full\b/);
    expect(toggle).toMatch(/\bh-10\b/);
    expect(toggle).not.toMatch(/\bh-8\b/);
  });
});

describe("AppShell landing branch", () => {
  const shell = read("components", "layout", "AppShell.tsx");
  const main = shell.slice(shell.indexOf("<main"), shell.indexOf("</main>"));

  it("drops the app Header on the landing route", () => {
    expect(shell).toMatch(/const landing = isLandingPath\(pathname\)/);
    expect(shell).toMatch(/\{landing \? null : \(\s*<Header\b/);
  });

  it("renders one desk wrapper inside <main> for every route, LandingHeader inside it on /", () => {
    const wrapper = main.indexOf(`"desk relative isolate"`);
    const header = main.indexOf("<LandingHeader");
    const page = main.indexOf("<PageEnter", wrapper);
    expect(wrapper, "desk wrapper inside <main>").toBeGreaterThan(0);
    expect(header).toBeGreaterThan(wrapper);
    expect(page).toBeGreaterThan(header);
    // One page render inside the one wrapper, not a separate branch per route.
    expect(main.match(/<PageEnter/g)).toHaveLength(1);
    expect(main).toMatch(/<LandingHeader\s+onOpenSearch=\{\(\) => setSearchOpen\(true\)\}/);
  });

  it("keeps the app Header and the drawer outside the desk wrapper", () => {
    // They sit beside the scroller, not in it. The JSX element, not "<main>" in
    // a comment above it.
    const mainTag = shell.search(/<main\s+className=/);
    expect(mainTag).toBeGreaterThan(0);
    expect(shell.indexOf("<Header")).toBeGreaterThan(0);
    expect(shell.indexOf("<Header")).toBeLessThan(mainTag);
    expect(shell.indexOf("<Sidebar")).toBeLessThan(mainTag);
  });

  it("tells the header it is scrolled by observing the page top, not by listening for scroll", () => {
    // A landing page restored mid-scroll fires no scroll event.
    const sentinel = main.indexOf("ref={landingTop}");
    expect(sentinel, "sentinel inside the desk wrapper").toBeGreaterThan(main.indexOf('"desk relative isolate"'));
    expect(sentinel).toBeLessThan(main.indexOf("<LandingHeader"));
    expect(main).toMatch(/scrolled=\{landingScrolled\}/);
    expect(shell).toMatch(/new IntersectionObserver\(\s*\(\[entry\]\) => setLandingScrolled\(!\(entry\?\.isIntersecting \?\? true\)\)/);
    expect(shell).toMatch(/root: sentinel\.closest\("main"\)/);
  });
});
