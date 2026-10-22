import { beforeAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  LESSON_ARTIFACTS,
  getLessonArtifact,
  isConceptLessonArtifactPath,
} from "../src/lib/course/lessonArtifacts";
import { getLesson } from "../src/lib/course/manifest";

const WEB = join(__dirname, "..");
const PUBLIC = join(WEB, "public");

beforeAll(() => {
  const run = spawnSync("node", [join(WEB, "scripts", "build-lesson-artifacts.mjs")], {
    cwd: WEB,
    encoding: "utf8",
  });
  expect(run.status, run.stdout + run.stderr).toBe(0);
}, 120_000);

describe("lesson artifacts registry", () => {
  it("every key names a real lesson in the course manifest", () => {
    for (const key of Object.keys(LESSON_ARTIFACTS)) {
      const [moduleSlug, lessonSlug] = key.split("/");
      const lesson = getLesson(moduleSlug!, lessonSlug!);
      expect(lesson, `${key} is not in the manifest`).toBeDefined();
    }
  });

  it("registers exactly 40 verified lessons", () => {
    expect(Object.keys(LESSON_ARTIFACTS).length).toBe(40);
  });

  it("every page exists under public/ and complies with the embed contract", () => {
    for (const [key, artifact] of Object.entries(LESSON_ARTIFACTS)) {
      const file = join(PUBLIC, artifact.src);
      expect(existsSync(file), `${key}: missing ${artifact.src}`).toBe(true);
      const html = readFileSync(file, "utf8");
      // The embed contract the frame relies on: same-origin messages carrying theme and code
      expect(html).toContain("source!=='leetexpert'");
      expect(html).toContain("embed");
      expect(artifact.src.startsWith("/lessons/")).toBe(true);
    }
  });

  it("looks a lesson up by module and slug, and returns null for unknown", () => {
    expect(getLessonArtifact("binary-trees", "diameter-of-binary-tree")?.src).toContain("diameter-of-binary-tree");
    expect(getLessonArtifact("binary-trees", "maximum-depth-of-binary-tree")).toBeNull();
  });

  it("isConceptLessonArtifactPath accurately identifies concept lessons with artifacts", () => {
    expect(isConceptLessonArtifactPath("/courses/dsa/arrays/contiguous-memory")).toBe(true);
    expect(isConceptLessonArtifactPath("/courses/dsa/big-o/why-efficiency-matters")).toBe(true);
    expect(isConceptLessonArtifactPath("/courses/dsa/getting-started/course-introduction")).toBe(true);

    // Problem paths must return false (handled by isIdePath)
    expect(isConceptLessonArtifactPath("/courses/dsa/problems/two-sum")).toBe(false);
    expect(isConceptLessonArtifactPath("/courses/dsa/problems/reverse-linked-list")).toBe(false);

    // Overviews, maps, hub must return false
    expect(isConceptLessonArtifactPath("/courses/dsa/overviews/linear-structures")).toBe(false);
    expect(isConceptLessonArtifactPath("/courses/dsa/arrays/concept-map")).toBe(false);
    expect(isConceptLessonArtifactPath("/courses/dsa")).toBe(false);

    // Concept lesson without an artifact yet returns false
    expect(isConceptLessonArtifactPath("/courses/dsa/sliding-window/sliding-window-fundamentals")).toBe(false);
  });
});
