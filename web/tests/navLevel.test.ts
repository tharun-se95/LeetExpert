import { describe, expect, it } from "vitest";
import { buildCourseNav } from "@/lib/course/nav";
import { activeModuleSlug, resolveNavView } from "@/lib/course/navLevel";

const stages = buildCourseNav();
const modules = stages.flatMap((s) => s.modules);
const withLessons = modules.find((m) => m.lessons.length > 0)!;

describe("activeModuleSlug", () => {
  it("matches a module page and a lesson under it", () => {
    expect(activeModuleSlug(stages, withLessons.href)).toBe(withLessons.slug);
    expect(activeModuleSlug(stages, withLessons.lessons[0]!.href)).toBe(
      withLessons.slug,
    );
  });

  it("returns null off the course", () => {
    expect(activeModuleSlug(stages, "/courses/dsa")).toBeNull();
    expect(activeModuleSlug(stages, "/")).toBeNull();
  });
});

describe("resolveNavView", () => {
  it("opens the module the route is inside", () => {
    const view = resolveNavView({
      stages,
      pathname: withLessons.lessons[0]!.href,
    });
    expect(view).toEqual({ level: "module", navModule: withLessons });
  });

  it("shows the module list on the hub", () => {
    expect(resolveNavView({ stages, pathname: "/courses/dsa" })).toEqual({
      level: "modules",
    });
  });

  it("shows the module list while the back override is set", () => {
    expect(
      resolveNavView({
        stages,
        pathname: withLessons.lessons[0]!.href,
        backToModules: true,
      }),
    ).toEqual({ level: "modules" });
  });

  it("never opens an empty level 2 for a module with no lessons", () => {
    const empty = { ...withLessons, lessons: [] };
    const onlyEmpty = [{ number: 1, title: "Stage", modules: [empty] }];
    expect(resolveNavView({ stages: onlyEmpty, pathname: empty.href })).toEqual({
      level: "modules",
    });
  });
});
