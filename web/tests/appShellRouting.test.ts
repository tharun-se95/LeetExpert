import { describe, it, expect } from "vitest";
import {
  isIdePath,
  isLandingPath,
  isSignInPath,
  isPricingPath,
  activeThemeFor,
  isConceptMapPath,
} from "../src/components/layout/AppShell";
import { activeCourseSlugFor } from "../src/lib/courses/activeCourse";

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

describe("isSignInPath (owner, 2026-09-24: no lessons drawer on /sign-in)", () => {
  it("matches the sign-in page, with or without a trailing segment", () => {
    expect(isSignInPath("/sign-in")).toBe(true);
    expect(isSignInPath("/sign-in/")).toBe(true);
  });

  it("does not match a course page or a lookalike path", () => {
    expect(isSignInPath("/courses/dsa")).toBe(false);
    expect(isSignInPath("/sign-inx")).toBe(false);
  });

  it("gates the course nav in AppShell", async () => {
    const { readFileSync } = await import("node:fs");
    const shell = readFileSync(new URL("../src/components/layout/AppShell.tsx", import.meta.url), "utf8");
    expect(shell).toMatch(/const showCourseNav =\s*!landing && !isSignInPath\(pathname\)/);
  });
});

describe("isPricingPath", () => {
  it("matches the pricing page, with or without trailing slash or segment", () => {
    expect(isPricingPath("/pricing")).toBe(true);
    expect(isPricingPath("/pricing/")).toBe(true);
  });

  it("does not match unrelated pages", () => {
    expect(isPricingPath("/")).toBe(false);
    expect(isPricingPath("/courses/dsa")).toBe(false);
  });
});

describe("isLandingPath", () => {
  it("matches the catalog root", () => {
    expect(isLandingPath("/")).toBe(true);
  });

  it("does not match /courses/dsa/marketing (that route redirects to / and never reaches this check)", () => {
    expect(isLandingPath("/courses/dsa/marketing")).toBe(false);
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

describe("isConceptMapPath", () => {
  it("matches a module's concept map page", () => {
    expect(isConceptMapPath("/courses/dsa/binary-trees/concept-map")).toBe(true);
  });

  it("matches with a trailing slash", () => {
    expect(isConceptMapPath("/courses/dsa/binary-trees/concept-map/")).toBe(true);
  });

  it("does not match the module page", () => {
    expect(isConceptMapPath("/courses/dsa/binary-trees")).toBe(false);
  });

  it("does not match a lesson that merely starts the same way", () => {
    expect(isConceptMapPath("/courses/dsa/binary-trees/concept-map-notes")).toBe(
      false,
    );
  });

  it("does not match a deeper route under it", () => {
    expect(
      isConceptMapPath("/courses/dsa/binary-trees/concept-map/extra"),
    ).toBe(false);
  });
});
