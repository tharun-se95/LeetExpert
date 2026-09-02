import { describe, it, expect } from "vitest";
import {
  MODULES,
  allLessonIds,
  totalLessonCount,
  getModule,
  getChapter,
  getLesson,
} from "../src/app/courses/nextjs/manifest";

describe("Next.js course manifest structure", () => {
  it("has exactly 8 modules, 22 chapters, 62 lessons per the Phase 1 curriculum", () => {
    expect(MODULES).toHaveLength(8);
    const chapterCount = MODULES.reduce((sum, m) => sum + m.chapters.length, 0);
    expect(chapterCount).toBe(22);
    expect(totalLessonCount()).toBe(62);
  });

  it("every lesson id is unique", () => {
    const ids = allLessonIds();
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every module/chapter/lesson slug is unique within its parent", () => {
    const moduleSlugs = MODULES.map((m) => m.slug);
    expect(new Set(moduleSlugs).size).toBe(moduleSlugs.length);
    for (const mod of MODULES) {
      const chapterSlugs = mod.chapters.map((c) => c.slug);
      expect(new Set(chapterSlugs).size).toBe(chapterSlugs.length);
      for (const chapter of mod.chapters) {
        const lessonSlugs = chapter.lessons.map((l) => l.slug);
        expect(new Set(lessonSlugs).size).toBe(lessonSlugs.length);
      }
    }
  });

  it("module numbers are sequential starting at 1", () => {
    const numbers = MODULES.map((m) => m.number);
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("every lesson has a non-empty scope statement", () => {
    for (const mod of MODULES) {
      for (const chapter of mod.chapters) {
        for (const lesson of chapter.lessons) {
          expect(lesson.scope.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("every lesson with a practice format has a non-empty practice scenario, and vice versa", () => {
    for (const mod of MODULES) {
      for (const chapter of mod.chapters) {
        for (const lesson of chapter.lessons) {
          if (lesson.practiceFormat === null) {
            expect(lesson.practiceScenario).toBe("");
          } else {
            expect(lesson.practiceScenario.length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it("getModule resolves a real module", () => {
    const mod = getModule("rsc-architecture-hydration");
    expect(mod?.title).toBe("The RSC Architecture & Hydration Mental Model");
  });

  it("getModule returns undefined for an unknown slug", () => {
    expect(getModule("not-a-real-module")).toBeUndefined();
  });

  it("getChapter resolves a real chapter", () => {
    const hit = getChapter(
      "rsc-architecture-hydration",
      "hydration-mechanics-and-diagnostics",
    );
    expect(hit?.chapter.title).toBe("Hydration Mechanics & Diagnostics");
  });

  it("getLesson resolves a real lesson with correct practice format", () => {
    const hit = getLesson(
      "rsc-architecture-hydration",
      "hydration-mechanics-and-diagnostics",
      "resolving-hydration-mismatches",
    );
    expect(hit?.lesson.title).toBe("Resolving Hydration Mismatches");
    expect(hit?.lesson.practiceFormat).toBe("trace");
    expect(hit?.lesson.depth).toBe("essential");
  });

  it("getLesson returns undefined when the lesson doesn't exist under that chapter", () => {
    expect(
      getLesson("rsc-architecture-hydration", "hydration-mechanics-and-diagnostics", "not-real"),
    ).toBeUndefined();
  });

  it("Module 7's FAANG/Enterprise vs Startup split landed as two dedicated lessons, both canvas-defense or sandbox per the accepted recommendation", () => {
    const hit = getChapter("system-design-and-scale", "specialized-career-tracks");
    expect(hit?.chapter.lessons).toHaveLength(2);
    const [enterprise, startup] = hit!.chapter.lessons;
    expect(enterprise.slug).toBe("enterprise-track-distributed-self-hosting");
    expect(enterprise.practiceFormat).toBe("canvas-defense");
    expect(startup.slug).toBe("startup-track-rapid-tooling");
    expect(startup.practiceFormat).toBe("sandbox");
  });
});
