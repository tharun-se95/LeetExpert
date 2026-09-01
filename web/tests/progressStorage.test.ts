// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

// This project's default vitest environment is "node" (see vitest.config.ts),
// which has no `localStorage` global — the brief's assumption that jsdom was
// already wired in didn't hold. The magic comment above scopes a jsdom
// environment (and its real `localStorage`) to just this file rather than
// switching every other test in the suite over to a browser-like DOM.

describe("progress storage key namespacing", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("legacy flat key is migrated into the namespaced key on first read", async () => {
    localStorage.setItem(
      "dsa-course-progress",
      JSON.stringify(["arrays/contiguous-memory"]),
    );
    const { migrateLegacyProgress } = await import(
      "../src/components/providers/progressStorage"
    );
    migrateLegacyProgress("dsa");
    const migrated = JSON.parse(
      localStorage.getItem("course-progress:dsa") ?? "[]",
    );
    expect(migrated).toEqual(["arrays/contiguous-memory"]);
  });

  it("does not overwrite an existing namespaced key with the legacy one", async () => {
    localStorage.setItem(
      "course-progress:dsa",
      JSON.stringify(["big-o/big-o-notation"]),
    );
    localStorage.setItem(
      "dsa-course-progress",
      JSON.stringify(["arrays/contiguous-memory"]),
    );
    const { migrateLegacyProgress } = await import(
      "../src/components/providers/progressStorage"
    );
    migrateLegacyProgress("dsa");
    const kept = JSON.parse(
      localStorage.getItem("course-progress:dsa") ?? "[]",
    );
    expect(kept).toEqual(["big-o/big-o-notation"]);
  });

  it("does nothing when there is no legacy key", async () => {
    const { migrateLegacyProgress } = await import(
      "../src/components/providers/progressStorage"
    );
    migrateLegacyProgress("dsa");
    expect(localStorage.getItem("course-progress:dsa")).toBeNull();
  });
});
