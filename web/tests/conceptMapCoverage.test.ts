import { describe, it, expect } from "vitest";
import { MODULES } from "../src/lib/course/manifest";
import { getConceptMap } from "../src/lib/course/conceptMaps/registry";
import { buildCourseNav, conceptMapHref } from "../src/lib/course/nav";
import { indexableRoutes } from "../src/lib/seo/site";

/**
 * The sidebar links every module to its concept map unconditionally — it does
 * not import the registry to check, because that would pull all 24 maps into
 * the client bundle. This file is what makes that safe: a module without a map
 * must fail CI here rather than ship a nav link to a 404.
 */
describe("concept map coverage", () => {
  it.each(MODULES.map((m) => m.slug))("%s has a concept map", (slug) => {
    expect(getConceptMap(slug)).toBeDefined();
  });

  it("every module exposes exactly one concept map nav entry", () => {
    const modules = buildCourseNav().flatMap((s) => s.modules);
    expect(modules).toHaveLength(MODULES.length);
    for (const m of modules) {
      const extras = m.extras ?? [];
      expect(extras.map((e) => e.href)).toEqual([conceptMapHref(m.slug)]);
    }
  });

  it("keeps concept maps out of the lesson counts", () => {
    // The x/y figure in the sidebar counts `lessons`; an extra must never
    // land there, or every module's completion figure shifts.
    for (const m of buildCourseNav().flatMap((s) => s.modules)) {
      const hrefs = m.lessons.map((l) => l.href);
      expect(hrefs).not.toContain(conceptMapHref(m.slug));
    }
  });

  it("lists each concept map page in the sitemap", () => {
    const routes = indexableRoutes();
    for (const m of MODULES) {
      expect(routes).toContain(conceptMapHref(m.slug));
    }
  });
});
