import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { buildCourseNav } from "@/lib/course/nav";
import { CourseNavPanel } from "@/components/layout/CourseNavPanel";

const nav = buildCourseNav();
const modules = nav.flatMap((s) => s.modules);
const navModule = modules.find((m) => m.lessons.length > 1)!;
const lesson = navModule.lessons[0]!;

/** Titles carry `&` ("Recursive & Hierarchical"), which React escapes. */
const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

const render = (pathname: string, activeFilter?: "lessons" | "practice") =>
  renderToStaticMarkup(
    <CourseNavPanel
      nav={nav}
      pathname={pathname}
      visited={new Set<string>()}
      compact
      curriculumHref="/courses/dsa"
      activeFilter={activeFilter}
    />,
  );

describe("CourseNavPanel single level", () => {
  const html = render("/courses/dsa");

  it("lists every stage heading and module", () => {
    for (const stage of nav) expect(html).toContain(esc(stage.title));
    for (const m of modules) expect(html).toContain(esc(m.shortTitle));
  });

  it("labels the hub link Overview in lessons mode", () => {
    expect(html).toMatch(/<a[^>]*href="\/courses\/dsa"[^>]*>Overview<\/a>/);
  });

  it("includes the mode switcher with Lessons and Practice tabs", () => {
    expect(html).toMatch(/role="tablist"/);
    expect(html).toContain("Lessons");
    expect(html).toContain("Practice");
  });

  it("names modules without a leading number", () => {
    expect(html).not.toMatch(/tabular-nums[^"]*"[^>]*>\s*\d+\./);
    const button = html.match(
      new RegExp(
        `<button[^>]*aria-label="[^"]*${esc(modules[0]!.title)}"[^>]*>([\\s\\S]*?)</button>`,
      ),
    )![1];
    expect(button.replace(/<[^>]*>/g, "").trim()).not.toMatch(/^\d+\./);
  });

  it("marks a coming-soon module", () => {
    const soon = modules.find((m) => m.status === "coming-soon");
    if (soon) expect(html).toContain("soon");
  });
});

describe("CourseNavPanel active module expansion", () => {
  const html = render(lesson.href);

  it("automatically expands the module the active route is inside", () => {
    // Shows the open module's lessons
    for (const l of navModule.lessons) expect(html).toContain(esc(l.title));
  });

  it("renders non-lesson destinations, outside the progress count", () => {
    const extras = navModule.extras ?? [];
    expect(extras.length).toBeGreaterThan(0);
    for (const e of extras) {
      expect(html).toContain(`href="${e.href}"`);
      expect(html).toContain(esc(e.title));
    }
  });

  it("draws guide lines for module rows", () => {
    const rows = navModule.lessons.map(
      (l) => html.match(new RegExp(`<a[^>]*href="${l.href}"[^>]*>`))![0],
    );
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) expect(row).toContain("border-l-2");
  });

  it("paints a completed lesson segment with accent", () => {
    const withProgress = renderToStaticMarkup(
      <CourseNavPanel
        nav={nav}
        pathname={lesson.href}
        visited={new Set([lesson.id])}
        compact
        curriculumHref="/courses/dsa"
      />,
    );
    const doneRow = withProgress.match(
      new RegExp(`<a[^>]*href="${lesson.href}"[^>]*>`),
    )![0];
    expect(doneRow).toContain("border-accent");
  });

  it("marks the active lesson for assistive tech", () => {
    expect(html).toMatch(
      new RegExp(
        `aria-current="page"[^>]*href="${lesson.href}"|href="${lesson.href}"[^>]*aria-current="page"`,
      ),
    );
  });
});

describe("CourseNavPanel practice mode filter", () => {
  const problemModule = modules.find((m) => (m.problems?.length ?? 0) > 0)!;
  const problem = problemModule.problems![0]!;
  const html = render(problem.href, "practice");

  it("switches overview link to practice problems overview", () => {
    expect(html).toContain('href="/courses/dsa/problems"');
    expect(html).toContain("All Practice Problems");
  });

  it("shows practice problems for the active module", () => {
    expect(html).toContain(esc(problem.title));
    expect(html).toContain(`href="${problem.href}"`);
  });

  it("filters out stages with 0 practice problems", () => {
    const stage0 = nav.find((s) => s.number === 0)!;
    // Stage 0 (Foundations) has 0 practice problems
    expect(html).not.toContain(esc(stage0.title));
  });
});
