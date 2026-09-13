import { describe, expect, it } from "vitest";
import { buildCourseNav } from "@/lib/course/nav";
import { activeModuleSlug, resolveNavView } from "@/lib/course/navLevel";

const stages = buildCourseNav();
const modules = stages.flatMap((s) => s.modules);
const withLessons = modules.find((m) => m.lessons.length > 0)!;
const withExtras = modules.find((m) => (m.extras ?? []).length > 0)!;

/** The section a module sits in — what the level-2 back row is labelled with. */
const stageOf = (slug: string) => {
  const stage = stages.find((s) => s.modules.some((m) => m.slug === slug))!;
  return { number: stage.number, title: stage.title };
};

describe("activeModuleSlug", () => {
  it("matches a module page and a lesson under it", () => {
    expect(activeModuleSlug(stages, withLessons.href)).toBe(withLessons.slug);
    expect(activeModuleSlug(stages, withLessons.lessons[0]!.href)).toBe(
      withLessons.slug,
    );
  });

  it("matches a module's extra destination, e.g. its concept map", () => {
    // Without this, opening a concept map drops the nav back to the module
    // list and the link the reader just followed disappears.
    expect(activeModuleSlug(stages, withExtras.extras![0]!.href)).toBe(
      withExtras.slug,
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
    expect(view).toEqual({
      level: "module",
      navModule: withLessons,
      stage: stageOf(withLessons.slug),
    });
  });

  it("keeps the module open on one of its extras", () => {
    expect(
      resolveNavView({ stages, pathname: withExtras.extras![0]!.href }),
    ).toEqual({
      level: "module",
      navModule: withExtras,
      stage: stageOf(withExtras.slug),
    });
  });

  it("names the section the open module belongs to", () => {
    // The back row reads "< Foundations", not a generic "All modules", so it
    // has to carry the stage the module was reached through.
    const view = resolveNavView({ stages, pathname: withLessons.href });
    expect(view).toMatchObject({ stage: stageOf(withLessons.slug) });
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

  it("opens a module whose href is aliased to its first lesson", () => {
    // The Next.js course shape: a module with no overview page of its own.
    // Its own nav is not mounted on those routes today, so this is the only
    // guarantee that shape keeps resolving to level 2.
    const aliased = { ...withLessons, href: withLessons.lessons[0]!.href };
    const aliasedStages = [{ number: 1, title: "Stage", modules: [aliased] }];
    expect(
      resolveNavView({ stages: aliasedStages, pathname: aliased.href }),
    ).toEqual({
      level: "module",
      navModule: aliased,
      stage: { number: 1, title: "Stage" },
    });
  });

  it("never opens an empty level 2 for a module with no lessons", () => {
    const empty = { ...withLessons, lessons: [] };
    const onlyEmpty = [{ number: 1, title: "Stage", modules: [empty] }];
    expect(resolveNavView({ stages: onlyEmpty, pathname: empty.href })).toEqual({
      level: "modules",
    });
  });
});
