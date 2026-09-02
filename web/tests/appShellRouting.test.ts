import { describe, it, expect } from "vitest";
import {
  isIdePath,
  isLandingPath,
  activeThemeFor,
  activeCourseSlugFor,
} from "../src/components/layout/AppShell";

describe("isIdePath", () => {
  it("matches a DSA problem page", () => {
    expect(isIdePath("/courses/dsa/problems/two-sum")).toBe(true);
  });

  it("matches a DSA problem page with a trailing slash", () => {
    expect(isIdePath("/courses/dsa/problems/two-sum/")).toBe(true);
  });

  it("does not match the problems list page", () => {
    expect(isIdePath("/courses/dsa/problems")).toBe(false);
  });

  it("does not match a concept lesson page", () => {
    expect(isIdePath("/courses/dsa/hash-tables/hashing-fundamentals")).toBe(
      false,
    );
  });

  it("does not match the pre-migration /problems/[slug] shape", () => {
    // Regression: this exact miss shipped once already — isIdePath was
    // never updated when the route moved from /problems/[slug] to
    // /courses/dsa/problems/[slug], silently breaking the IDE layout on
    // every problem page until a final-review pass caught it.
    expect(isIdePath("/problems/two-sum")).toBe(false);
  });
});

describe("isLandingPath", () => {
  it("matches the catalog root", () => {
    expect(isLandingPath("/")).toBe(true);
  });

  it("matches DSA's marketing page", () => {
    expect(isLandingPath("/courses/dsa/marketing")).toBe(true);
  });

  it("does not match the module list page", () => {
    expect(isLandingPath("/courses/dsa")).toBe(false);
  });

  it("does not match a lesson page", () => {
    expect(isLandingPath("/courses/dsa/hash-tables/hashing-fundamentals")).toBe(
      false,
    );
  });
});

describe("activeThemeFor", () => {
  it("resolves a module page's family", () => {
    expect(activeThemeFor("/courses/dsa/hash-tables/hashing-fundamentals")).toBe(
      "linear-traversal",
    );
  });

  it("resolves a problem page's family via its owning module", () => {
    expect(activeThemeFor("/courses/dsa/problems/two-sum")).toBe(
      "linear-traversal",
    );
  });

  it("does not mistake 'problems' for a module slug", () => {
    // Regression guard for the negative-lookahead fix: the module regex
    // must not match /courses/dsa/problems/... and try to look up a
    // "problems" module (which doesn't exist).
    expect(activeThemeFor("/courses/dsa/problems")).toBeNull();
  });

  it("returns null for the catalog root", () => {
    expect(activeThemeFor("/")).toBeNull();
  });

  it("returns null for an unknown problem slug", () => {
    expect(activeThemeFor("/courses/dsa/problems/not-a-real-problem")).toBeNull();
  });
});

describe("activeCourseSlugFor", () => {
  it("resolves the course slug from a courses/<slug>/... path", () => {
    expect(activeCourseSlugFor("/courses/dsa/hash-tables")).toBe("dsa");
  });

  it("defaults to dsa on the catalog root", () => {
    expect(activeCourseSlugFor("/")).toBe("dsa");
  });
});
