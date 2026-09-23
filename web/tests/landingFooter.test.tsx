import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { WORDMARK_NOSCRIPT } from "@/components/landing/FooterWordmark";
import { MODULES } from "@/lib/course/manifest";
import { TOPIC_CHIPS } from "@/lib/landing/content";
import { CONNECT_LINKS } from "@/lib/landing/footer";

const src = join(__dirname, "..", "src");
const html = renderToStaticMarkup(<LandingFooter year={2031} />);
const hrefs = [...html.matchAll(/<a[^>]*href="([^"]+)"/g)].map((m) => m[1]!);

/** Whether an in-app path is served: a page file, or a manifest module / lesson. */
function resolves(path: string): boolean {
  if (path === "/") return existsSync(join(src, "app", "page.tsx"));
  const parts = path.split("/").filter(Boolean);
  if (parts[0] !== "courses" || parts[1] !== "dsa") return false;
  if (parts.length === 2) return existsSync(join(src, "app", "courses", "dsa", "page.tsx"));
  if (parts[2] === "problems" && parts.length === 3) {
    return existsSync(join(src, "app", "courses", "dsa", "problems", "page.tsx"));
  }
  const courseModule = MODULES.find((m) => m.slug === parts[2]);
  if (!courseModule) return false;
  if (parts.length === 3) return true;
  return parts.length === 4 && courseModule.lessons.some((l) => l.slug === parts[3]);
}

describe("landing footer", () => {
  it("links only to pages that exist", () => {
    const internal = hrefs.filter((h) => h.startsWith("/"));
    expect(internal.length).toBeGreaterThan(0);
    for (const href of internal) expect(resolves(href), href).toBe(true);
    // The resolver itself must reject a page that doesn't exist.
    expect(resolves("/courses/dsa/not-a-module")).toBe(false);
    expect(resolves("/privacy")).toBe(false);
  });

  it("carries every topic and the course's own routes", () => {
    for (const { href } of TOPIC_CHIPS) expect(hrefs).toContain(href);
    expect(hrefs).toContain("/courses/dsa");
    expect(hrefs).toContain("/courses/dsa/problems");
  });

  it("invents no outbound links: every external or mail link comes from CONNECT_LINKS", () => {
    const outbound = hrefs.filter((h) => !h.startsWith("/"));
    expect(outbound.sort()).toEqual(CONNECT_LINKS.map((l) => l.href).sort());
    for (const { href } of CONNECT_LINKS) expect(href).toMatch(/^(https:\/\/|mailto:)/);
    if (CONNECT_LINKS.length === 0) expect(html).not.toContain('aria-label="Connect"');
  });

  it("links no legal pages, because none exist", () => {
    expect(html).not.toMatch(/privacy|terms|cookie|legal/i);
  });

  it("prints the year it is given, which HomePage computes", () => {
    expect(html).toContain("© 2031 leetExpert");
    expect(readFileSync(join(src, "components", "landing", "HomePage.tsx"), "utf8")).toMatch(
      /<LandingFooter year=\{new Date\(\)\.getFullYear\(\)\} \/>/,
    );
  });

  it("keeps the oversized wordmark decorative, and visible without scripts", () => {
    const wordmark = html.match(/<div aria-hidden="true" class="@container[^"]*">[\s\S]*?<\/p><\/div>/)?.[0] ?? "";
    expect(wordmark, "aria-hidden wordmark block").not.toBe("");
    const letters = [...wordmark.matchAll(/data-wordmark-letter="true"[^>]*>([^<])</g)].map((m) => m[1]).join("");
    expect(letters).toBe("leetExpert");
    expect(WORDMARK_NOSCRIPT).toBe("[data-wordmark-letter]{opacity:1!important;transform:none!important}");
    expect(wordmark).toContain(WORDMARK_NOSCRIPT);
  });

  it("ends the page with no snap stop left over (the page scrolls natively, 2026-09-23)", () => {
    expect(html).not.toMatch(/\bsnap-/);
  });
});
