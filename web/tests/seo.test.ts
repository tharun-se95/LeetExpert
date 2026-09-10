import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  SITE_ORIGIN,
  absoluteUrl,
  canonicalFor,
  indexableRoutes,
} from "../src/lib/seo/site";
import sitemap from "../src/app/sitemap";
import robots from "../src/app/robots";
import {
  MODULES,
  allProblemSlugs,
  findProblemBySlug,
} from "../src/lib/course/manifest";
import { lessonHref, moduleHref, problemHref } from "../src/lib/course/nav";

const APP = join(__dirname, "..", "src", "app");
const read = (...p: string[]) => readFileSync(join(APP, ...p), "utf8");

describe("indexableRoutes", () => {
  const routes = indexableRoutes();

  it("includes the home page", () => {
    expect(routes).toContain("/");
  });

  it("includes the DSA course hub and the problems hub", () => {
    expect(routes).toContain("/courses/dsa");
    expect(routes).toContain("/courses/dsa/problems");
  });

  it("includes a page for every module in the manifest", () => {
    for (const mod of MODULES) {
      expect(routes).toContain(moduleHref(mod.slug));
    }
  });

  it("includes a page for every problem in the manifest", () => {
    for (const slug of allProblemSlugs()) {
      expect(routes).toContain(problemHref(slug));
    }
  });

  it("includes every concept and practice lesson", () => {
    for (const mod of MODULES) {
      for (const lesson of mod.lessons) {
        if (lesson.type === "problem") continue;
        expect(routes).toContain(lessonHref(mod.slug, lesson.slug));
      }
    }
  });

  // A problem lesson's course URL permanentRedirects to /courses/dsa/problems/
  // [slug] (see courses/dsa/[module]/[lesson]/page.tsx). A sitemap must list
  // canonical 200 URLs — listing the redirect source wastes crawl budget and
  // tells Google the wrong URL is the destination.
  it("excludes problem lessons' course URLs, which permanently redirect", () => {
    for (const mod of MODULES) {
      for (const lesson of mod.lessons) {
        if (lesson.type !== "problem") continue;
        expect(routes).not.toContain(lessonHref(mod.slug, lesson.slug));
      }
    }
  });

  it("excludes /courses/dsa/marketing, which permanently redirects to /", () => {
    expect(routes).not.toContain("/courses/dsa/marketing");
  });

  // Every route under /courses/nextjs 404s via its layout while the course is
  // disabled (courses/nextjs/layout.tsx). Submitting 404s in a sitemap is a
  // reported error in Search Console and erodes trust in the whole file.
  it("excludes every /courses/nextjs route while that course 404s", () => {
    expect(routes.filter((r) => r.startsWith("/courses/nextjs"))).toEqual([]);
  });

  it("excludes API routes", () => {
    expect(routes.filter((r) => r.startsWith("/api"))).toEqual([]);
  });

  it("emits no duplicates", () => {
    expect(new Set(routes).size).toBe(routes.length);
  });

  it("emits root-relative paths with no trailing slash", () => {
    for (const route of routes) {
      expect(route.startsWith("/")).toBe(true);
      if (route !== "/") expect(route.endsWith("/")).toBe(false);
    }
  });
});

describe("absoluteUrl", () => {
  it("resolves a path against the production origin", () => {
    expect(absoluteUrl("/courses/dsa")).toBe(`${SITE_ORIGIN}/courses/dsa`);
  });

  it("maps the home page to the bare origin with no trailing slash", () => {
    expect(absoluteUrl("/")).toBe(SITE_ORIGIN);
  });

  it("uses the www host, matching the apex -> www 308 redirect in production", () => {
    expect(SITE_ORIGIN).toBe("https://www.leetexpert.com");
  });
});

describe("sitemap", () => {
  const entries = sitemap();

  it("has one entry per indexable route", () => {
    expect(entries.length).toBe(indexableRoutes().length);
  });

  it("lists only absolute URLs on the production origin", () => {
    for (const entry of entries) {
      expect(entry.url.startsWith(`${SITE_ORIGIN}`)).toBe(true);
    }
  });

  it("lists every URL exactly once", () => {
    const urls = entries.map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("gives every entry a lastModified date", () => {
    for (const entry of entries) {
      expect(entry.lastModified).toBeInstanceOf(Date);
    }
  });

  it("ranks the home page above any lesson page", () => {
    const home = entries.find((e) => e.url === SITE_ORIGIN);
    const lesson = entries.find((e) =>
      e.url.startsWith(`${SITE_ORIGIN}/courses/dsa/`),
    );
    expect(home?.priority).toBeGreaterThan(lesson?.priority ?? 1);
  });
});

describe("robots", () => {
  const rules = robots();

  it("allows crawling the site for all user agents", () => {
    const rule = Array.isArray(rules.rules) ? rules.rules[0] : rules.rules;
    expect(rule?.userAgent).toBe("*");
    expect(rule?.allow).toBe("/");
  });

  it("keeps crawlers out of the API routes", () => {
    const rule = Array.isArray(rules.rules) ? rules.rules[0] : rules.rules;
    const disallow = rule?.disallow;
    const list = Array.isArray(disallow) ? disallow : [disallow];
    expect(list).toContain("/api/");
  });

  it("declares the sitemap by absolute URL so crawlers can discover it", () => {
    expect(rules.sitemap).toBe(`${SITE_ORIGIN}/sitemap.xml`);
  });

  it("declares the canonical host", () => {
    expect(rules.host).toBe(SITE_ORIGIN);
  });
});

describe("canonicalFor", () => {
  it("returns the path so Next resolves it against metadataBase", () => {
    expect(canonicalFor("/courses/dsa/big-o")).toEqual({
      canonical: "/courses/dsa/big-o",
    });
  });
});

// Source-level guards: a canonical tag only ships if the page actually asks
// for one. These fail loudly if a future edit drops the call, which no
// runtime assertion in this suite would catch.
describe("every indexable page declares a canonical URL", () => {
  const pages: [string, string[]][] = [
    ["home", ["page.tsx"]],
    ["dsa course hub", ["courses", "dsa", "page.tsx"]],
    ["dsa module", ["courses", "dsa", "[module]", "page.tsx"]],
    ["dsa lesson", ["courses", "dsa", "[module]", "[lesson]", "page.tsx"]],
    ["problems hub", ["courses", "dsa", "problems", "page.tsx"]],
    ["problem", ["courses", "dsa", "problems", "[slug]", "page.tsx"]],
  ];

  for (const [label, path] of pages) {
    it(`${label} page calls canonicalFor`, () => {
      expect(read(...path)).toContain("canonicalFor");
    });
  }
});

// A description only ships if the page derives one. These 220 pages are the
// bulk of the site's search surface; without this guard a refactor could drop
// them all and every other test would still pass.
describe("content pages derive a meta description from their own prose", () => {
  const pages: [string, string[]][] = [
    ["dsa lesson", ["courses", "dsa", "[module]", "[lesson]", "page.tsx"]],
    ["problem", ["courses", "dsa", "problems", "[slug]", "page.tsx"]],
  ];

  for (const [label, path] of pages) {
    it(`${label} page calls metaDescription`, () => {
      expect(read(...path)).toContain("metaDescription");
    });
  }
});

// Structured data is invisible in the UI, so nothing but a guard like this
// notices when a refactor drops it.
describe("structured data is emitted where it belongs", () => {
  const SRC = join(__dirname, "..", "src");
  const readSrc = (...p: string[]) =>
    readFileSync(join(SRC, ...p), "utf8");

  it("the root layout declares the Organization and WebSite entities", () => {
    const layout = readSrc("app", "layout.tsx");
    expect(layout).toContain("organizationLd");
    expect(layout).toContain("websiteLd");
  });

  it("the DSA hub declares the Course", () => {
    expect(readSrc("app", "courses", "dsa", "page.tsx")).toContain("courseLd");
  });

  it("Breadcrumbs emits the list it renders, from the same items", () => {
    const crumbs = readSrc("components", "layout", "Breadcrumbs.tsx");
    expect(crumbs).toContain("breadcrumbLd");
    expect(crumbs).toContain("items.map");
  });

  it("lesson and problem pages declare a LearningResource", () => {
    expect(
      readSrc("app", "courses", "dsa", "[module]", "[lesson]", "page.tsx"),
    ).toContain("learningResourceLd");
    expect(
      readSrc("app", "courses", "dsa", "problems", "[slug]", "page.tsx"),
    ).toContain("learningResourceLd");
  });
});

describe("root layout", () => {
  it("derives metadataBase from the shared origin instead of a second literal", () => {
    const layout = read("layout.tsx");
    expect(layout).toContain("SITE_ORIGIN");
    expect(layout).not.toContain('new URL("https://www.leetexpert.com")');
  });
});

// The strongest guarantee we can make offline that the sitemap contains no
// 404s: every DSA lesson and problem URL it lists must have a markdown file
// backing it. loadLesson() throws on a missing file, so a drift here would
// also break `next build` — this catches it in the fast test suite instead.
describe("every DSA content URL in the sitemap is backed by a real file", () => {
  const COURSES_ROOT = join(__dirname, "..", "..", "courses");
  const lessonFile = (moduleSlug: string, lessonSlug: string) =>
    join(COURSES_ROOT, "dsa", moduleSlug, `${lessonSlug}.md`);

  it("resolves a file for every lesson route", () => {
    const missing = indexableRoutes()
      .map((r) => /^\/courses\/dsa\/([^/]+)\/([^/]+)$/.exec(r))
      .filter((m): m is RegExpExecArray => m !== null)
      .filter(([, mod]) => mod !== "problems")
      .filter(([, mod, lesson]) => !existsSync(lessonFile(mod, lesson)));
    expect(missing.map((m) => m[0])).toEqual([]);
  });

  it("resolves a file for every problem route", () => {
    const missing = allProblemSlugs().filter((slug) => {
      const hit = findProblemBySlug(slug);
      return !hit || !existsSync(lessonFile(hit.module.slug, hit.lesson.slug));
    });
    expect(missing).toEqual([]);
  });
});
