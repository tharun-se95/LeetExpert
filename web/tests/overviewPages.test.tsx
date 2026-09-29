import { beforeAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import CourseOverviewPage from "@/app/courses/dsa/page";
import OverviewPage, {
  dynamicParams,
  generateStaticParams,
} from "@/app/courses/dsa/overviews/[slug]/page";
import { isOverviewPath } from "@/components/layout/AppShell";
import { STAGES } from "@/lib/course/manifest";
import {
  OVERVIEWS,
  overviewHref,
  overviewSrc,
  type Overview,
} from "@/lib/course/overviews";
import { indexableRoutes } from "@/lib/seo/site";
import { getFamilyTheme } from "@/lib/visual/familyTheme";

/**
 * Stage overviews on the course hub (#41; spec
 * docs/superpowers/specs/2026-09-29-overview-pages-on-hub-design.md).
 *
 * build.py `LESSONS` is the one declaration; the ledger's overviews table, the
 * committed `overviews.generated.json`, the hub cards, the static params and the
 * built files under `public/artifacts/` must all agree with it.
 */
const WEB = join(__dirname, "..");

function python(args: string[]): string {
  const run = spawnSync("python3", [join(WEB, "lesson-artifacts", "build.py"), ...args], {
    cwd: WEB,
    encoding: "utf8",
  });
  expect(run.status, run.stderr).toBe(0);
  return run.stdout;
}

// Read before the build script below rewrites the committed JSON, so drift is seen, not repaired.
const committed: readonly Overview[] = OVERVIEWS;
const declared = JSON.parse(python(["--overviews"])) as Overview[];
const ledger = JSON.parse(
  readFileSync(join(WEB, "lesson-artifacts", "ledger.json"), "utf8"),
) as { overviews: Record<string, unknown> };

beforeAll(() => {
  // What `prebuild` does: builds the pages and copies them to public/artifacts.
  const run = spawnSync("node", [join(WEB, "scripts", "build-overviews.mjs")], {
    cwd: WEB,
    encoding: "utf8",
  });
  expect(run.status, run.stdout + run.stderr).toBe(0);
}, 120_000);

const hub = renderToStaticMarkup(<CourseOverviewPage />);

/** The markup of one stage's section on the hub. */
function stageSection(stage: number): string {
  const start = hub.indexOf(`id="stage-${stage}"`);
  expect(start, `stage ${stage} section`).toBeGreaterThan(-1);
  const next = hub.indexOf('id="stage-', start + 1);
  return hub.slice(start, next === -1 ? undefined : next);
}

describe("overview declarations", () => {
  it("build.py declares at least one overview, each with a real stage and family", () => {
    expect(declared.length).toBeGreaterThan(0);
    for (const o of declared) {
      expect(STAGES.map((s) => s.number), o.slug).toContain(o.stage);
      expect(getFamilyTheme(o.family).id, o.slug).toBe(o.family);
      expect(o.summary.length, o.slug).toBeGreaterThan(20);
    }
  });

  it("the committed overviews.generated.json matches build.py (run scripts/build-overviews.mjs)", () => {
    expect(committed).toEqual(declared);
  });

  it("the ledger's overviews table lists exactly the declared overviews", () => {
    expect(Object.keys(ledger.overviews).sort()).toEqual(
      declared.map((o) => `overviews/${o.slug}`).sort(),
    );
  });
});

describe("hub cards", () => {
  it.each(declared.map((o) => [o.slug, o] as const))(
    "%s has a card in its stage's section, linking to its route",
    (slug, o) => {
      const section = stageSection(o.stage);
      const tag = new RegExp(`<a[^>]*data-overview-card="${slug}"[^>]*>`).exec(section)?.[0];
      expect(tag, "card anchor in the stage section").toBeDefined();
      expect(tag).toContain(`href="${overviewHref(slug)}"`);
      expect(section).toContain(o.title);
      // The card is in no other stage's section.
      for (const s of STAGES) {
        if (s.number !== o.stage) expect(stageSection(s.number)).not.toContain(overviewHref(slug));
      }
    },
  );

  it("every overview card on the hub is a declared overview", () => {
    const slugs = [...hub.matchAll(/data-overview-card="([^"]+)"/g)].map((m) => m[1]);
    expect(slugs.sort()).toEqual(declared.map((o) => o.slug).sort());
  });

  it("card colour is scoped to the card, never a hardcoded palette value", () => {
    for (const o of declared) {
      const card = hub.slice(hub.indexOf(`data-overview-card="${o.slug}"`)).split("</a>")[0]!;
      expect(card).toContain("--accent");
      expect(card).not.toMatch(/(emerald|red|green|blue|slate)-\d{3}/);
      expect(card).not.toContain("font-semibold");
    }
  });
});

describe("overview route", () => {
  it("is static: every declared slug is a param, unknown slugs 404, and no session is read", () => {
    expect(generateStaticParams()).toEqual(declared.map((o) => ({ slug: o.slug })));
    expect(dynamicParams).toBe(false);
    const source = readFileSync(
      join(WEB, "src", "app", "courses", "dsa", "overviews", "[slug]", "page.tsx"),
      "utf8",
    );
    expect(source).not.toMatch(/next\/headers|@\/lib\/auth|cookies\(|headers\(/);
  });

  it.each(declared.map((o) => [o.slug, o] as const))(
    "%s: every hub card href resolves to a static param",
    (slug) => {
      const hrefs = [...hub.matchAll(/href="(\/courses\/dsa\/overviews\/[^"]+)"/g)].map((m) => m[1]);
      const params = generateStaticParams().map((p) => overviewHref(p.slug));
      expect(hrefs).toContain(overviewHref(slug));
      for (const h of hrefs) expect(params).toContain(h);
    },
  );

  it.each(declared.map((o) => [o.slug, o] as const))(
    "%s: the page frames the built file, which exists and is that overview",
    async (slug, o) => {
      const html = renderToStaticMarkup(await OverviewPage({ params: Promise.resolve({ slug }) }));
      expect(html).toContain(`src="${overviewSrc(slug)}?embed=1"`);
      expect(html).toContain(o.title);

      const file = join(WEB, "public", overviewSrc(slug));
      expect(existsSync(file), file).toBe(true);
      const built = readFileSync(file, "utf8");
      expect(built).toContain(`<title>${o.title}</title>`);
      // The page loads its faces and motion.js by relative path; they must sit beside it.
      for (const rel of built.matchAll(/(?:href|src)="(\.\.\/[^"]+)"/g)) {
        const target = join(WEB, "public", "artifacts", "overviews", rel[1]!);
        expect(existsSync(target), rel[1]).toBe(true);
      }
    },
  );

  it("the app shell holds the viewport on overview routes only", () => {
    expect(isOverviewPath("/courses/dsa/overviews/linear-structures")).toBe(true);
    expect(isOverviewPath("/courses/dsa/overviews/linear-structures/")).toBe(true);
    expect(isOverviewPath("/courses/dsa/overviews")).toBe(false);
    expect(isOverviewPath("/courses/dsa/arrays/overviews")).toBe(false);
  });

  it("the sitemap lists every overview", () => {
    const routes = indexableRoutes();
    for (const o of declared) expect(routes).toContain(overviewHref(o.slug));
  });
});
