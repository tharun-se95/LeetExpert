import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildCorpus, sandboxIdsOutputPath } from "../src/lib/coach/buildCorpus";
import { allLessonIds } from "../src/lib/course/manifest";
import { isKnownLessonId, isKnownSandboxId } from "../src/lib/progress/knownIds";

describe("progress id registries", () => {
  it("the generated sandbox id list matches a fresh corpus build", () => {
    const written = JSON.parse(readFileSync(sandboxIdsOutputPath(), "utf8")) as string[];
    expect(written).toEqual(Object.keys(buildCorpus()).sort());
  }, 20000);

  it("accepts real ids and rejects typos, other courses and the landing sandbox", () => {
    expect(isKnownSandboxId("find-min-rotated")).toBe(true);
    expect(isKnownSandboxId("find-minimum-in-rotated-sorted-array")).toBe(false);
    expect(isKnownSandboxId("landing-find-pair")).toBe(false);
    const lesson = allLessonIds()[0]!;
    expect(isKnownLessonId("dsa", lesson)).toBe(true);
    expect(isKnownLessonId("dsa", `${lesson}x`)).toBe(false);
    expect(isKnownLessonId("nextjs", lesson)).toBe(false);
  });
});
