import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { buildCourseNav } from "@/lib/course/nav";
import { CourseNavPanel } from "@/components/layout/CourseNavPanel";
import { TRANSLUCENT_PAPER } from "@/components/layout/headerChrome";

const nav = buildCourseNav();
const modules = nav.flatMap((s) => s.modules);
const navModule = modules.find((m) => m.lessons.length > 1)!;
const other = modules.find(
  (m) => m.slug !== navModule.slug && m.lessons.length > 0,
)!;
const lesson = navModule.lessons[0]!;
const stage = nav.find((s) => s.modules.some((m) => m.slug === navModule.slug))!;

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

  it("labels the hub link Overview", () => {
    expect(html).toMatch(/<a[^>]*href="\/courses\/dsa"[^>]*>Overview<\/a>/);
    expect(html).not.toContain("All modules");
  });

  it("uses the level-2 tree treatment: stage label, indent, guide line", () => {
    // Both panels are the same tree, so a stage looks like a section and a
    // module row looks like a lesson row.
    const stageLabel = html.match(
      new RegExp(`<p[^>]*>${esc(nav[0]!.title)}</p>`),
    )![0];
    expect(stageLabel).toContain("text-[19px]");
    expect(stageLabel).toContain("font-bold");
    const row = html.match(
      new RegExp(`<a[^>]*href="${modules[0]!.href}"[^>]*>`),
    )![0];
    expect(row).toContain("border-l-2");
    expect(row).toContain("pl-3");
  });

  it("hangs each module guide line from its stage label's first letter", () => {
    // The rule level 2 must mirror (measured 22.75px for both).
    const title = esc(nav[0]!.title);
    const stagePad = html.match(
      new RegExp(`<p class="[^"]*\\bpx-(\\d+)\\b[^"]*">${title}</p>`),
    )?.[1];
    const rowsPl = html.match(
      new RegExp(`<p[^>]*>${title}</p><div class="[^"]*\\bpl-(\\d+)\\b`),
    )?.[1];
    expect(stagePad).toBeDefined();
    expect(rowsPl).toBe(stagePad);
  });

  it("names modules without a leading number", () => {
    // The stage headings already carry the curriculum's order.
    expect(html).not.toMatch(/tabular-nums[^"]*"[^>]*>\s*\d+\./);
    const row = html.match(
      new RegExp(`<a[^>]*href="${modules[0]!.href}"[^>]*>([\\s\\S]*?)</a>`),
    )![1];
    expect(row.replace(/<[^>]*>/g, "").trim()).not.toMatch(/^\d+\./);
  });

  it("marks a coming-soon module", () => {
    const soon = modules.find((m) => m.status === "coming-soon");
    if (soon) expect(html).toContain("soon");
  });
});

describe("CourseNavPanel level 2", () => {
  const html = render(
    {
      level: "module",
      navModule,
      stage: { number: stage.number, title: stage.title },
    },
    lesson.href,
  );

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

  it("labels the back row with the section, not a generic 'All modules'", () => {
    expect(html).toMatch(
      new RegExp(`<button[^>]*aria-label="Back to ${esc(stage.title)}"`),
    );
    // Label in name (WCAG 2.5.3): the visible text sits inside the aria-label.
    expect(html).toContain(esc(stage.title));
    expect(html).not.toMatch(
      /<button[^>]*>[\s\S]*?All modules[\s\S]*?<\/button>/,
    );
    expect(html).toContain(esc(navModule.title));
  });

  it("sets the section label larger than the rows, in ink", () => {
    const back = html.match(
      /<button[^>]*aria-label="Back to [^"]*"[^>]*>[\s\S]*?<\/button>/,
    )![0];
    // Prominence comes from size and weight, not colour: the label stays
    // --foreground. A family accent here would also have needed >=18.66px
    // bold to clear AA (accentUi is a 3:1 token, not 4.5:1).
    expect(back).toMatch(/text-\[19px\]/);
    expect(back).toContain("font-bold");
    expect(back).toContain("text-foreground");
    expect(back).not.toContain("text-accent");
    expect(back).not.toMatch(/style="[^"]*--accent:/);
  });

  it("stairsteps section > module > lesson by indent", () => {
    // Each level one step deeper, so the tree reads without rules or dots.
    const heading = html.match(/<div class="[^"]*border-b[^"]*"[^>]*>/)![0];
    // Deeper than a bare step: the section row above it starts after a caret.
    expect(heading).toContain("pl-6");
  });

  it("hangs the lesson guide line from the module title's first letter", () => {
    // Same rule as level 1, where the line sits under its stage label. The
    // lessons used level 1's pl-2 while the module header is pl-6, so the line
    // hung from the section label instead (measured 22.75px) and lesson text
    // (34.5px) landed on the module title (35.75px): siblings, not children.
    const headingPl = html.match(/<div class="[^"]*\bborder-b\b[^"]*\bpl-(\d+)\b/)?.[1];
    const rowsPl = html.match(/<div class="mt-2[^"]*\bpl-(\d+)\b/)?.[1];
    expect(headingPl).toBeDefined();
    expect(rowsPl).toBe(headingPl);
  });

  it("ranks the module title between the section label and the rows", () => {
    const heading = html.match(/<h2[^>]*>[\s\S]*?<\/h2>/)![0];
    expect(heading).toMatch(/text-\[15px\]/);
    expect(heading).toContain("font-bold");
  });

  it("draws one guide line instead of per-row dots", () => {
    // The rail is the marker now: every row owns a segment, and rows sit
    // flush so the line does not break between them.
    expect(html).not.toMatch(/h-2 w-2 rounded/);
    const rows = navModule.lessons.map(
      (l) => html.match(new RegExp(`<a[^>]*href="${l.href}"[^>]*>`))![0],
    );
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) expect(row).toContain("border-l-2");
  });

  it("paints a completed lesson's segment with the accent", () => {
    const withProgress = renderToStaticMarkup(
      <CourseNavPanel
        nav={nav}
        view={{
          level: "module",
          navModule,
          stage: { number: stage.number, title: stage.title },
        }}
        pathname="/courses/dsa"
        visited={new Set([lesson.id])}
        compact
        curriculumHref="/courses/dsa"
        onBack={() => {}}
      />,
    );
    const doneRow = withProgress.match(
      new RegExp(`<a[^>]*href="${lesson.href}"[^>]*>`),
    )![0];
    expect(doneRow).toContain("border-accent");
  });

  it("puts the count beside the module name, with no module number", () => {
    const heading = html.match(/<h2[\s\S]*?<\/h2>/)![0];
    expect(heading).toContain(`0/${navModule.lessons.length}`);
    expect(heading).not.toContain(`${navModule.number}.`);
  });

  it("marks the active lesson for assistive tech", () => {
    expect(html).toMatch(
      new RegExp(
        `aria-current="page"[^>]*href="${lesson.href}"|href="${lesson.href}"[^>]*aria-current="page"`,
      ),
    );
  });
});

describe("CourseNavPanel header row", () => {
  const renderWith = (
    view: Parameters<typeof CourseNavPanel>[0]["view"],
    pathname: string,
    onClose?: () => void,
    scrolled?: boolean,
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
        onClose={onClose}
        scrolled={scrolled}
      />,
    );
  const moduleView = {
    level: "module" as const,
    navModule,
    stage: { number: stage.number, title: stage.title },
  };
  /** The pinned row: a sticky div whose last child is the close button. */
  const pinnedRow = (html: string) =>
    html.match(
      /<div class="[^"]*\bsticky\b[^"]*">[\s\S]*?aria-label="Close lessons drawer"[\s\S]*?<\/button><\/div>/,
    )?.[0];

  it("puts the back row and the close button in one pinned row inside a module", () => {
    const html = renderWith(moduleView, lesson.href, () => {});
    const row = pinnedRow(html);
    expect(row, "sticky header row").toBeDefined();
    expect(row).toMatch(/\btop-0\b/);
    expect(row).toMatch(new RegExp(`aria-label="Back to ${esc(stage.title)}"`));
    expect(row!.indexOf("Back to")).toBeLessThan(row!.indexOf("Close lessons drawer"));
    // The way out comes before the rows, so tabbing in does not cost a module's lessons.
    expect(html.indexOf("Close lessons drawer")).toBeLessThan(html.indexOf(`href="${lesson.href}"`));
  });

  it("holds only the close button at the top level", () => {
    const html = renderWith({ level: "modules" }, "/courses/dsa", () => {});
    const row = pinnedRow(html);
    expect(row, "sticky header row").toBeDefined();
    expect(row).not.toContain("Back to");
    expect(row!.match(/<button/g)).toHaveLength(1);
    expect(html.indexOf("Close lessons drawer")).toBeLessThan(html.indexOf(">Overview<"));
  });

  /** The pinned row's classes, from a level-1 render. */
  const rowClasses = (scrolled?: boolean) =>
    pinnedRow(renderWith({ level: "modules" }, "/courses/dsa", () => {}, scrolled))!
      .match(/<div class="([^"]*)"/)![1]
      .split(/\s+/);

  it("keeps the pinned row flat paper at rest, like the rail behind it", () => {
    // Translucent at rest, 90% paper read as a lighter strip against the rail
    // (owner, 2026-09-15).
    const cls = rowClasses();
    expect(cls).toContain("bg-background");
    expect(cls.join(" ")).not.toMatch(/\bbackdrop-|\bbg-background\/|\bshadow-|\bborder-b\b/);
  });

  it("turns the pinned row translucent once rows scroll under it", () => {
    const cls = rowClasses(true);
    for (const c of TRANSLUCENT_PAPER.split(" ")) expect(cls, c).toContain(c);
    // No shadow (owner, 2026-09-15) and no border-b: the module heading below
    // is the first ruled div (see level 2).
    expect(cls.join(" ")).not.toMatch(/\bshadow-|\bborder-b\b/);
  });

  it("learns 'scrolled' from a sentinel observed against the nav, not a scroll listener", () => {
    // A drawer restored mid-scroll fires no scroll event, so a listener would
    // leave the row flat over rows it is covering.
    const tree = readFileSync(join(__dirname, "..", "src", "components", "layout", "CourseNavTree.tsx"), "utf8");
    expect(tree).toMatch(/new IntersectionObserver\(/);
    expect(tree).toMatch(/root: scrollRef\.current/);
    expect(tree).not.toMatch(/addEventListener\("scroll"/);
    expect(tree).toMatch(/scrolled=\{scrolled\}/);
  });

  it("gives the close button the opener's inverted fill, not plain ROUND_CONTROL chrome", () => {
    // The floating opener (FloatingLessonsButton) and this button are the
    // drawer's open/close pair; both carry .floating-invert (owner, 2026-09-23).
    const html = renderWith({ level: "modules" }, "/courses/dsa", () => {});
    const button = html.match(/<button[^>]*aria-label="Close lessons drawer"[^>]*>/)![0];
    expect(button).toContain("floating-invert");
  });

  it("renders no close button and no pinned row without onClose (the mobile sheet has its own)", () => {
    for (const html of [
      renderWith(moduleView, lesson.href),
      renderWith({ level: "modules" }, "/courses/dsa"),
    ]) {
      expect(html).not.toContain("Close lessons drawer");
      expect(html).not.toMatch(/\bsticky\b/);
    }
  });
});
