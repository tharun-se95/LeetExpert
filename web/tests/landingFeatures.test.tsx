import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { FeatureSection, type WindowContent } from "@/components/landing/FeatureSection";
import { featureWindows, type FeatureWindowData } from "@/components/landing/FeatureWindows";
import { LandingOutro } from "@/components/landing/LandingOutro";
import { LandingStory } from "@/components/landing/LandingStory";
import { parseSandboxSpec } from "@/components/sandbox/parseSpec";
import { CHEATSHEETS } from "@/lib/course/cheatsheets/registry";
import { getConceptMap } from "@/lib/course/conceptMaps/registry";
import { MODULES, groupedProblems } from "@/lib/course/manifest";
import { CURRICULUM, FIRST_LESSON, curriculumStats } from "@/lib/landing/content";
import { ALL_VERBS, featureSections, type VerbId } from "@/lib/landing/features";
import { FIND_PAIR_SPEC } from "@/lib/landing/findPairSandbox";
import { heatYear } from "@/lib/landing/heat";
import {
  DRAFT_FLAGGED_LINE,
  DRAFT_SNIPPET,
  METHOD_PAIR,
  METHOD_TARGET,
  METHOD_VALUES,
  findPair,
  findPairAddFirst,
  reviewDiagnosis,
  reviewThread,
} from "@/lib/landing/method";
import { LEARN_LESSON, MAP_MODULE, RECALL_MODULE, WATCH_MODULE, featureData } from "@/lib/landing/productData";
import { HEAT, HERO, PROOF, countsLine } from "@/lib/landing/story";
import { formatCall, matches, pretty } from "@/lib/sandbox/compare";
import { runJavaScript, runPython, type RunRequest } from "./referenceRunner";

/**
 * Understand, Build and Keep (owner, 2026-09-17): every feature in the app as
 * nine verbs, each window showing the real feature.
 * Spec: docs/superpowers/specs/2026-09-15-landing-product-page-design.md §12, §13
 */

const web = join(__dirname, "..");
const src = join(web, "src");
const read = (...p: string[]) => readFileSync(join(src, ...p), "utf8");
/** React's text escaping, so copy can be looked for in rendered markup. */
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

const data = featureData();
const features: FeatureWindowData = { ...data, heat: heatYear("2026-09-14") };
const sections = featureSections(data.counts);
const FAR = { understand: false, build: false, keep: false };
const NEAR = { understand: true, build: true, keep: true };
const bodyOf = (verb: VerbId, near = FAR) => renderToStaticMarkup(<>{featureWindows(features, near)[verb].body}</>);

describe("server-only landing data", () => {
  it("is imported by the server HomePage alone, never by a client module or content.ts", () => {
    // content.ts is imported by the client course nav; an fs import reachable
    // from it broke every route with "Can't resolve 'fs'".
    const importers: string[] = [];
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.tsx?$/.test(p) && readFileSync(p, "utf8").includes("@/lib/landing/productData")) importers.push(p);
      }
    };
    walk(src);
    expect(importers.map((p) => p.slice(src.length + 1))).toEqual([join("components", "landing", "HomePage.tsx")]);
    expect(read("components", "landing", "HomePage.tsx")).not.toMatch(/^"use client"/);
    expect(read("lib", "landing", "content.ts")).not.toMatch(/node:fs|from "fs"|lib\/course\/(load|media)"/);
  });
});

describe("hero", () => {
  const stats = curriculumStats();
  const html = renderToStaticMarkup(
    <LandingStory counts={stats} links={{ start: FIRST_LESSON, curriculum: CURRICULUM }} stages={[]} features={features} />,
  );
  const hero = html.split("<section")[1]!;

  it("names the product, links to the first lesson and the curriculum, and states the counts", () => {
    expect(hero).toContain(esc(HERO.kicker));
    expect(hero).toContain(esc(HERO.descriptor));
    expect(hero).toMatch(new RegExp(`<a[^>]*href="${FIRST_LESSON}"[^>]*>${HERO.start}`));
    expect(hero).toMatch(new RegExp(`<a[^>]*href="${CURRICULUM}"[^>]*>${HERO.explore}`));
    expect(hero).toContain(countsLine(stats));
    // The drawing that stood beside it is the page backdrop now (2026-09-19).
    expect(hero).not.toContain("<svg viewBox");
  });

  it("lists the nine verbs in section order, each linking to the verb it selects", () => {
    const nav = hero.match(/<nav aria-label="Features"[\s\S]*?<\/nav>/)?.[0] ?? "";
    const links = [...nav.matchAll(/<a[^>]*href="#([a-z]+)"[^>]*>([^<]+)<\/a>/g)].map((m) => [m[1], m[2]]);
    expect(links.map(([id]) => id)).toEqual([...ALL_VERBS]);
    expect(links.map(([, title]) => title)).toEqual(sections.flatMap((s) => s.verbs.map((v) => v.title)));
    for (const s of sections) expect(nav).toContain(`>${s.title}<`);
  });
});

describe("Understand, Build and Keep", () => {
  it("keeps the owner's headings and verbs", () => {
    expect(sections.map((s) => [s.title, s.heading])).toEqual([
      ["Understand", "See it before you solve it."],
      ["Build", "The code is cheap now. Judgment isn't."],
      ["Keep", "Come back tomorrow."],
    ]);
    expect(sections.map((s) => s.verbs.map((v) => v.title))).toEqual([
      ["Watch", "Learn", "Map"],
      ["Code", "Review", "Optimize"],
      ["Practice", "Recall", "Burn"],
    ]);
    expect(sections.flatMap((s) => s.verbs.map((v) => v.id))).toEqual([...ALL_VERBS]);
  });

  it("shows each feature as the component alone, named for screen readers (owner, 2026-09-19)", () => {
    const windows = featureWindows(features, NEAR);
    for (const verb of ALL_VERBS) expect(windows[verb].label.length, verb).toBeGreaterThan(8);
    // The map, the problem list and the coach fill their slot; the rest sit centred in it.
    expect(ALL_VERBS.filter((v) => windows[v].fill)).toEqual(["map", "review", "practice"]);
    // Burn keeps the owner's credits line, under the tabs now.
    expect(windows.burn.note).toBe(HEAT.credits);
    // The kinds and "Today" footers went with the cards.
    const src = read("lib", "landing", "features.ts");
    expect(src).not.toMatch(/WindowKind|WINDOW_LABEL|today:/);
  });

  it("orders the story: hero, the three sections, then what's inside", () => {
    const story = read("components", "landing", "LandingStory.tsx");
    const order = ["<Hero ", "<FeatureSection", "<Inside "].map((s) => story.indexOf(s));
    expect(order.every((i) => i > 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(story).toContain("useActiveSection<HTMLDivElement>(5)");
    const html = renderToStaticMarkup(
      <LandingStory counts={curriculumStats()} links={{ start: "/s", curriculum: "/c" }} stages={[]} features={features} />,
    );
    expect([...html.matchAll(/<section[^>]*id="([a-z]+)"/g)].map((m) => m[1])).toEqual(["understand", "build", "keep"]);
  });

  it("renders a tab list with the first verb selected and all three components, only that one reachable", () => {
    const stub = Object.fromEntries(ALL_VERBS.map((v) => [v, { label: `${v} component`, body: <p>{v} body</p> }])) as Record<
      VerbId,
      WindowContent
    >;
    stub.watch = { ...stub.watch, link: { label: "Open the module", href: "/module" } };
    const section = sections[0]!;
    const html = renderToStaticMarkup(<FeatureSection section={section} started={false} windows={stub} />);
    const tabs = [...html.matchAll(/<button[^>]*role="tab"[^>]*>/g)].map((m) => m[0]);
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toMatch(/aria-selected="true"/);
    expect(tabs[0]).toMatch(/tabindex="0"/);
    for (const t of tabs.slice(1)) expect(t).toMatch(/aria-selected="false"[^>]*tabindex="-1"/);
    const panels = [...html.matchAll(/<div([^>]*role="tabpanel"[^>]*)><div[^>]*><p>(\w+) body/g)].map((m) => [
      m[2],
      /\binert=""/.test(m[1]!),
    ]);
    expect(panels).toEqual([
      ["watch", false],
      ["learn", true],
      ["map", true],
    ]);
    expect(html).toContain(esc(section.verbs[0]!.line));
    expect(html).toMatch(/<a[^>]*href="\/module"[^>]*>Open the module/);
  });

  it("selects a verb from the hero's link and lets arrows, Home and End move between verbs", () => {
    const section = read("components", "landing", "FeatureSection.tsx");
    expect(section).toContain('window.addEventListener("hashchange", pick)');
    expect(section).toContain("`#${v}` === window.location.hash");
    // Keyed on the ids: keyed on the verbs array (rebuilt every render) it
    // re-applied a stale #hash and undid the reader's own choice of verb.
    expect(section).toMatch(/\}, \[verbIds, choose\]\);/);
    for (const key of ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"]) expect(section).toContain(`${key}:`);
  });

  it("loads no heavy feature until its section is near", () => {
    for (const verb of ["watch", "learn", "map", "code", "review", "optimize", "practice", "recall"] as const) {
      expect(bodyOf(verb), verb).toMatch(/place-items-center[^>]*>(Video|Tracer|Concept map|Editor|Coach|Complexity stage|Practice|Cheatsheet)</);
    }
    const windows = read("components", "landing", "FeatureWindows.tsx");
    // Each heavy feature is its own chunk, not in the landing bundle.
    for (const mod of [
      "course/VideoPlayer",
      "viz/Viz",
      "sandbox/Sandbox",
      "landing/ReviewCoach",
      "explorers/BigOObservatory",
      "cheatsheet/Cheatsheet",
      "course/ConceptMindMap",
      "landing/PracticeWindow",
    ]) {
      expect(windows, mod).toContain(`dynamic(() => import("@/components/${mod}")`);
      expect(windows, mod).not.toMatch(new RegExp(`^import [^;]*"@/components/${mod}"`, "m"));
    }
  });
});

describe("Build: the worked problem", () => {
  it("has exactly one pair summing to the target", () => {
    const pairs: number[][] = [];
    for (let i = 0; i < METHOD_VALUES.length; i++)
      for (let j = i + 1; j < METHOD_VALUES.length; j++)
        if (METHOD_VALUES[i]! + METHOD_VALUES[j]! === METHOD_TARGET) pairs.push([METHOD_VALUES[i]!, METHOD_VALUES[j]!]);
    expect(pairs).toHaveLength(1);
    expect([...METHOD_PAIR].sort((a, b) => a - b)).toEqual(pairs[0]!.sort((a, b) => a - b));
  });

  it("shows Python that python3 runs: the solution finds the pair, the draft pairs a number with itself", () => {
    const run = (lines: readonly string[], nums: readonly number[]) => {
      const program = `${lines.join("\n")}\nimport json\nprint(json.dumps(find_pair(${JSON.stringify(nums)}, ${METHOD_TARGET})))\n`;
      const res = spawnSync("python3", ["-c", program], { encoding: "utf8" });
      expect(res.status, res.stderr).toBe(0);
      return JSON.parse(res.stdout) as unknown;
    };
    const reference = readFileSync(join(__dirname, "reference", "landing", "find-pair.py"), "utf8");
    expect(run(reference.trimEnd().split("\n"), METHOD_VALUES)).toEqual([...METHOD_PAIR]);
    expect(run(DRAFT_SNIPPET, METHOD_VALUES)).toEqual([...findPairAddFirst(METHOD_VALUES, METHOD_TARGET)!]);
    expect(findPairAddFirst(METHOD_VALUES, METHOD_TARGET)).not.toEqual(METHOD_PAIR);
    expect(DRAFT_SNIPPET[DRAFT_FLAGGED_LINE]).toMatch(/^\s+seen\.add\(n\)$/);
  });

  it("has the coach describe the draft with the app's own diagnosis, in a scripted thread", () => {
    const got = findPairAddFirst(METHOD_VALUES, METHOD_TARGET)!;
    const d = reviewDiagnosis();
    expect(d.prose).toBe(`${formatCall("find_pair", [METHOD_VALUES, METHOD_TARGET])} returned ${pretty(got)}; expected ${pretty(METHOD_PAIR)}.`);
    const thread = reviewThread();
    expect(thread.map((t) => t.kind)).toEqual(["diagnosis", "user", "assistant"]);
    expect(thread[0]).toMatchObject({ kind: "diagnosis", diagnosis: d });
    expect(thread[1]).toMatchObject({ content: `Why did it return ${pretty(got)}?` });
    // The reply is about this draft: its flagged line, and the number that
    // pairs with itself, which the draft really returns twice.
    expect(got[0]).toBe(got[1]);
    const reply = thread[2]!.kind === "assistant" ? thread[2]!.content : "";
    expect(reply).toContain(`\`${DRAFT_SNIPPET[DRAFT_FLAGGED_LINE]!.trim()}\``);
    expect(reply).toContain(`so ${got[0]} pairs with itself`);
    expect(METHOD_TARGET - got[0]).toBe(got[0]);
    // The coach only hints: it never writes the fix.
    expect(reply).not.toMatch(/```|def |return /);
  });

  it("shows the real coach panel with nothing to call: locked, no close or clear controls", () => {
    const coach = read("components", "landing", "ReviewCoach.tsx");
    expect(coach).toContain("<ScriptedCoachProvider thread={THREAD} lockedReason={COACH_LOCKED}>");
    expect(coach).toContain('<CoachPanel variant="showcase" />');
    const provider = read("components", "coach", "CoachProvider.tsx");
    const scripted = provider.slice(provider.indexOf("export function ScriptedCoachProvider"));
    expect(scripted).not.toMatch(/fetch\(/);
    const composer = read("components", "coach", "CoachComposer.tsx");
    expect(composer).toContain("lockedReason !== undefined");
    const panel = read("components", "coach", "CoachPanel.tsx");
    expect(panel).toMatch(/variant === "showcase" \? null/);
    expect(panel).toMatch(/thread\.length > 0 && variant !== "showcase"/);
  });

  it("lets the wheel scroll past the concept map instead of zooming it (owner, 2026-09-20)", () => {
    // The page scrolls feature by feature; a map that took the wheel stranded the reader on Map.
    expect(read("components", "landing", "FeatureWindows.tsx")).toContain("fill scrollThrough />");
    const map = read("components", "course", "ConceptMindMap.tsx");
    expect(map).toContain("zoomOnScroll={!scrollThrough}");
    expect(map).toContain("preventScrolling={!scrollThrough}");
  });

  it("shows the live editor, the tracer without its code and the complexity stage alone", () => {
    const windows = read("components", "landing", "FeatureWindows.tsx");
    expect(windows).toContain('<Sandbox source={FIND_PAIR_SOURCE} variant="card" embedded />');
    expect(windows).toContain("<Viz source={data.learn.viz} embedded code={false} />");
    expect(windows).toContain("<BigOObservatory />");
    expect(windows).not.toMatch(/InsightPanel|Try it/);
    // And no chrome around the heatmap.
    expect(windows).toMatch(/<HeatMap year=\{data\.heat\} lit=\{near\.keep\} className="border-0 bg-transparent p-0 shadow-none md:p-0" \/>/);
  });
});

describe("Build: the find_pair sandbox", () => {
  const spec = parseSandboxSpec(JSON.stringify(FIND_PAIR_SPEC))!;
  const request = (source: string, lang: "python" | "javascript"): RunRequest => ({
    source,
    fnName: FIND_PAIR_SPEC.fn[lang],
    cls: null,
    cases: [...FIND_PAIR_SPEC.cases],
    arg: 0,
    check: "return",
    shape: {},
    returns: "value",
  });
  const refs = {
    python: readFileSync(join(__dirname, "reference", "landing", "find-pair.py"), "utf8"),
    javascript: readFileSync(join(__dirname, "reference", "landing", "find-pair.js"), "utf8"),
  };
  const passing = async (source: string, lang: "python" | "javascript") => {
    const outcomes = lang === "python" ? runPython(request(source, lang)) : await runJavaScript(request(source, lang));
    return outcomes.map((o, i) => !o.error && matches(o.ret, FIND_PAIR_SPEC.cases[i]!.expect, "exact"));
  };

  it("parses as a sandbox", () => {
    expect(spec).not.toBeNull();
    expect(spec.cases).toHaveLength(FIND_PAIR_SPEC.cases.length);
  });

  it("proves every expectation with reference solutions in both runtimes", async () => {
    for (const lang of ["python", "javascript"] as const) {
      expect(await passing(refs[lang], lang), lang).toEqual(FIND_PAIR_SPEC.cases.map(() => true));
    }
    // The references agree with the page's own findPair.
    for (const c of FIND_PAIR_SPEC.cases) {
      const [nums, target] = c.args;
      expect(findPair(nums, target), JSON.stringify(c.args)).toEqual(c.expect);
    }
  });

  it("fails the untouched starter and the draft Review shows, in both runtimes", async () => {
    const draftJs = "function findPair(nums, target) {\n  const seen = new Set();\n  for (const n of nums) {\n    seen.add(n);\n    if (seen.has(target - n)) return [target - n, n];\n  }\n  return null;\n}\n";
    for (const lang of ["python", "javascript"] as const) {
      const starter = await passing(FIND_PAIR_SPEC.starter[lang], lang).catch(() => [false]);
      expect(starter.every(Boolean), `${lang} starter`).toBe(false);
      const draft = await passing(lang === "python" ? `${DRAFT_SNIPPET.join("\n")}\n` : draftJs, lang);
      expect(draft.every(Boolean), `${lang} draft`).toBe(false);
    }
  });
});

describe("feature data", () => {
  it("counts what ships", () => {
    expect(data.counts.problems).toBe(MODULES.flatMap((m) => m.lessons).filter((l) => l.type === "problem").length);
    expect(data.counts.cheatsheets).toBe(Object.keys(CHEATSHEETS).length);
  });

  it("reads each window's lesson, media, tracer and cheatsheet from the course", () => {
    // Watch plays the Arrays module's HyperFrames intro (owner, 2026-09-19).
    expect(WATCH_MODULE).toBe("arrays");
    expect(data.watch.video).toBe(`/media/${WATCH_MODULE}/intro.mp4`);
    expect(existsSync(join(web, "public", data.watch.video))).toBe(true);
    const md = readFileSync(join(web, "..", "courses", "dsa", LEARN_LESSON.module, `${LEARN_LESSON.lesson}.md`), "utf8");
    expect(data.learn.viz).toBe(md.split("```viz\n")[1]!.split("\n```")[0]);
    expect(data.recall.sheet.moduleSlug).toBe(RECALL_MODULE);
  });

  it("shows the real concept map and the full problem list, with no screenshots left behind", () => {
    expect(data.map.root).toBe(getConceptMap(MAP_MODULE));
    expect(data.practice.groups).toEqual(groupedProblems());
    expect(data.practice.groups.flatMap((g) => g.problems)).toHaveLength(data.counts.problems);
    // §13 replaced the captures with the components; nothing may still point at them.
    for (const gone of ["public/landing/map-light.png", "public/landing/practice-dark.png", "scripts/capture-landing-shots.mjs"])
      expect(existsSync(join(web, gone)), gone).toBe(false);
    expect(read("app", "globals.css")).not.toContain("landing-shot");
    expect(readFileSync(join(web, "package.json"), "utf8")).not.toContain("playwright-core");
  });

  it("renames the heatmap Burn, labels it an example, and lights it when Keep is near", () => {
    expect(HEAT.title).toBe("Burn");
    // The credits line sits under the tabs; the window is the heatmap alone.
    expect(featureWindows(features, FAR).burn.note).toBe(HEAT.credits);
    const far = bodyOf("burn");
    expect(far).toMatch(/aria-label="An example year/);
    expect(far).not.toMatch(/<svg[^>]*data-lit/);
    expect(bodyOf("burn", { ...FAR, keep: true })).toMatch(/<svg[^>]*data-lit/);
  });
});

describe("learners: placeholder social proof", () => {
  it("flags every example, attributes quotes to no invented person, and tags each one on the page", () => {
    for (const item of [...PROOF.stats, ...PROOF.quotes]) expect(item.placeholder).toBe(true);
    for (const quote of PROOF.quotes) expect(quote.name).toBe("Name Surname");
    const html = renderToStaticMarkup(<LandingOutro firstLessonHref="/first" />);
    const section = html.split("<section").find((s) => s.includes(esc(PROOF.title)))!;
    const tags = 1 + PROOF.stats.length + PROOF.quotes.length;
    expect(section.match(/data-placeholder=/g)).toHaveLength(tags);
    expect(section).toContain(esc(PROOF.note));
    expect(html.match(/data-placeholder=/g)).toHaveLength(tags);
  });
});
