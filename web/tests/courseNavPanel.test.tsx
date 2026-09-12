import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { buildCourseNav } from "@/lib/course/nav";
import { CourseNavPanel } from "@/components/layout/CourseNavPanel";

const nav = buildCourseNav();
const modules = nav.flatMap((s) => s.modules);
const navModule = modules.find((m) => m.lessons.length > 1)!;
const other = modules.find(
  (m) => m.slug !== navModule.slug && m.lessons.length > 0,
)!;
const lesson = navModule.lessons[0]!;

/** Titles carry `&` ("Recursive & Hierarchical"), which React escapes. */
const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

const render = (
  view: Parameters<typeof CourseNavPanel>[0]["view"],
  pathname: string,
) =>
  renderToStaticMarkup(
    <CourseNavPanel
      nav={nav}
      view={view}
      pathname={pathname}
      visited={new Set<string>()}
      compact
      curriculumHref="/courses/dsa"
      onBack={() => {}}
    />,
  );

describe("CourseNavPanel level 1", () => {
  const html = render({ level: "modules" }, "/courses/dsa");

  it("lists every stage heading and module, and no lesson titles", () => {
    for (const stage of nav) expect(html).toContain(esc(stage.title));
    for (const m of modules) expect(html).toContain(esc(m.shortTitle));
    expect(html).not.toContain(`href="${lesson.href}"`);
  });

  it("marks a coming-soon module", () => {
    const soon = modules.find((m) => m.status === "coming-soon");
    if (soon) expect(html).toContain("soon");
  });
});

describe("CourseNavPanel level 2", () => {
  const html = render({ level: "module", navModule }, lesson.href);

  it("shows only the open module's lessons and extras", () => {
    for (const l of navModule.lessons) expect(html).toContain(esc(l.title));
    // Match hrefs, not titles: a module's short title can appear inside
    // another module's lesson titles ("… (Linked Lists module)"). The module
    // href alone is too weak a guard — a lesson href is one segment deeper,
    // so leaking every module's lessons would slip past it.
    expect(html).not.toContain(`href="${other.href}"`);
    expect(html).not.toContain(`href="${other.lessons[0]!.href}"`);
    const rendered = (html.match(/href="\/courses\/dsa\/[^"]+\/[^"]+"/g) ?? [])
      .map((h) => h.slice('href="'.length, -1))
      .sort();
    const expected = [
      ...navModule.lessons.map((l) => l.href),
      ...(navModule.extras ?? []).map((e) => e.href),
    ].sort();
    expect(rendered).toEqual(expected);
  });

  it("renders non-lesson destinations, outside the progress count", () => {
    // Every module carries a Concept map extra. It gets no completion dot and
    // must not inflate the x/y count, which is lessons only.
    const extras = navModule.extras ?? [];
    expect(extras.length).toBeGreaterThan(0);
    for (const e of extras) {
      expect(html).toContain(`href="${e.href}"`);
      expect(html).toContain(esc(e.title));
    }
    expect(html).toContain(`0/${navModule.lessons.length}`);
  });

  it("offers a back control and names the module", () => {
    expect(html).toMatch(/<button[^>]*>[\s\S]*?All modules[\s\S]*?<\/button>/);
    expect(html).toContain(esc(navModule.title));
  });

  it("marks the active lesson for assistive tech", () => {
    expect(html).toMatch(
      new RegExp(
        `aria-current="page"[^>]*href="${lesson.href}"|href="${lesson.href}"[^>]*aria-current="page"`,
      ),
    );
  });
});
