import { describe, it, expect } from "vitest";
import {
  buildNextjsCourseNav,
  nextjsLessonIdFromPathname,
} from "../src/app/courses/nextjs/nav";
import { allLessonIds, MODULES } from "../src/app/courses/nextjs/manifest";
import { courseLessonIdFromPathname } from "../src/lib/courses/lessonId";

describe("buildNextjsCourseNav", () => {
  const nav = buildNextjsCourseNav();

  it("has one nav stage per course module", () => {
    expect(nav).toHaveLength(MODULES.length);
  });

  it("has one nav module per chapter, and one nav lesson per lesson", () => {
    const navModuleCount = nav.reduce((sum, stage) => sum + stage.modules.length, 0);
    const chapterCount = MODULES.reduce((sum, m) => sum + m.chapters.length, 0);
    expect(navModuleCount).toBe(chapterCount);

    const navLessonCount = nav.reduce(
      (sum, stage) =>
        sum + stage.modules.reduce((s, m) => s + m.lessons.length, 0),
      0,
    );
    expect(navLessonCount).toBe(allLessonIds().length);
  });

  it("every lesson id matches allLessonIds()'s module/chapter/lesson format", () => {
    const navIds = nav.flatMap((stage) =>
      stage.modules.flatMap((m) => m.lessons.map((l) => l.id)),
    );
    expect(new Set(navIds)).toEqual(new Set(allLessonIds()));
  });

  it("every lesson href points at the real lesson page", () => {
    for (const stage of nav) {
      for (const navModule of stage.modules) {
        for (const lesson of navModule.lessons) {
          expect(lesson.href).toBe(`/courses/nextjs/${lesson.id}`);
        }
      }
    }
  });
});

describe("nextjsLessonIdFromPathname", () => {
  const [firstId] = allLessonIds();

  it("resolves a real lesson path to its module/chapter/lesson id", () => {
    expect(nextjsLessonIdFromPathname(`/courses/nextjs/${firstId}`)).toBe(
      firstId,
    );
  });

  it("resolves with a trailing slash", () => {
    expect(nextjsLessonIdFromPathname(`/courses/nextjs/${firstId}/`)).toBe(
      firstId,
    );
  });

  it("returns null for the curriculum root", () => {
    expect(nextjsLessonIdFromPathname("/courses/nextjs")).toBeNull();
  });

  it("returns null for a made-up lesson triple", () => {
    expect(
      nextjsLessonIdFromPathname("/courses/nextjs/not-real/not-real/not-real"),
    ).toBeNull();
  });

  it("returns null for a DSA path", () => {
    expect(nextjsLessonIdFromPathname("/courses/dsa/hash-tables")).toBeNull();
  });
});

describe("courseLessonIdFromPathname dispatcher", () => {
  const [firstNextjsId] = allLessonIds();

  it("resolves a Next.js lesson path", () => {
    expect(courseLessonIdFromPathname(`/courses/nextjs/${firstNextjsId}`)).toBe(
      firstNextjsId,
    );
  });

  it("resolves a DSA lesson path", () => {
    expect(courseLessonIdFromPathname("/courses/dsa/hash-tables/hashing-fundamentals")).toBe(
      "hash-tables/hashing-fundamentals",
    );
  });

  it("returns null for a non-lesson path", () => {
    expect(courseLessonIdFromPathname("/")).toBeNull();
  });
});
