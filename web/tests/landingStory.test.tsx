import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { EvolvingStructure } from "@/components/landing/EvolvingStructure";
import { LandingStory } from "@/components/landing/LandingStory";
import { TypedText } from "@/components/landing/TypedText";
import { pagingIntent } from "@/components/landing/useSectionPaging";
import { activeSectionIndex } from "@/components/landing/useSectionReveal";
import { curriculumStats } from "@/lib/landing/content";
import {
  ALL_EDGES,
  BUCKETS,
  CELL,
  CROSS_LINKS,
  HASH_ROW_Y,
  LAYOUTS,
  STAGE_EDGES,
  STRUCTURE_VALUES,
  VIEW_H,
  VIEW_W,
  clampStage,
  cornerFor,
} from "@/lib/landing/structureLayouts";
import {
  FAQ,
  HERO,
  PRICING,
  WHY,
  argumentDuration,
  argumentLengths,
  argumentStage,
  inside,
  segmentProgress,
  typedLength,
  typingDuration,
} from "@/lib/landing/story";

const src = join(__dirname, "..", "src");
const read = (...p: string[]) => readFileSync(join(src, ...p), "utf8");
const values = STRUCTURE_VALUES;
const pairKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);
const edgeValues = (edges: readonly (readonly [number, number])[]) =>
  new Set(edges.map(([a, b]) => pairKey(values[a]!, values[b]!)));

/** The head of the `@media ... {` block that encloses `index`, or null. */
function enclosingMedia(css: string, index: number): string | null {
  let depth = 0;
  for (let i = index; i >= 0; i--) {
    if (css[i] === "}") depth++;
    else if (css[i] === "{") {
      if (depth === 0) {
        const head = css.slice(css.lastIndexOf("\n", i) + 1, i).trim();
        if (head.startsWith("@media")) return head;
      } else depth--;
    }
  }
  return null;
}

/** Parent and depth (by value) of every value when inserted into a BST in array order. */
function insertBst(order: readonly number[]) {
  type Node = { value: number; depth: number; left?: Node; right?: Node };
  const root: Node = { value: order[0]!, depth: 0 };
  const parent = new Map<number, number>();
  const depth = new Map<number, number>([[root.value, 0]]);
  for (const value of order.slice(1)) {
    let at = root;
    for (;;) {
      const side = value < at.value ? "left" : "right";
      const next = at[side];
      if (!next) {
        at[side] = { value, depth: at.depth + 1 };
        parent.set(value, at.value);
        depth.set(value, at.depth + 1);
        break;
      }
      at = next;
    }
  }
  return { parent, depth };
}

describe("evolving structure data", () => {
  it("places all seven values inside the drawing at every stage", () => {
    expect(LAYOUTS).toHaveLength(4);
    for (const layout of LAYOUTS) {
      expect(layout).toHaveLength(values.length);
      for (const { x, y } of layout) {
        expect(x).toBeGreaterThan(0);
        expect(x).toBeLessThan(VIEW_W);
        expect(y).toBeGreaterThan(0);
        expect(y).toBeLessThan(VIEW_H);
      }
    }
  });

  it("files every value in bucket value % buckets, chained in array order", () => {
    const hash = LAYOUTS[1]!;
    values.forEach((v, i) => expect(hash[i]!.y).toBe(HASH_ROW_Y(v % BUCKETS)));
    const links = edgeValues(STAGE_EDGES[1]!);
    for (let b = 0; b < BUCKETS; b++) {
      const chain = values.map((v, i) => ({ v, i })).filter(({ v }) => v % BUCKETS === b);
      for (let k = 1; k < chain.length; k++) {
        expect(hash[chain[k]!.i]!.x).toBeGreaterThan(hash[chain[k - 1]!.i]!.x);
        expect(links.has(pairKey(chain[k - 1]!.v, chain[k]!.v))).toBe(true);
      }
    }
  });

  it("draws the BST that inserting the values in order actually builds", () => {
    const { parent, depth } = insertBst(values);
    const expected = new Set([...parent].map(([child, p]) => pairKey(child, p)));
    expect(edgeValues(STAGE_EDGES[2]!)).toEqual(expected);

    const tree = LAYOUTS[2]!;
    const leftToRight = values.map((v, i) => ({ v, x: tree[i]!.x })).sort((a, b) => a.x - b.x);
    expect(leftToRight.map(({ v }) => v)).toEqual([...values].sort((a, b) => a - b));
    values.forEach((v, i) =>
      values.forEach((w, j) => {
        if (depth.get(v)! > depth.get(w)!) expect(tree[i]!.y).toBeGreaterThan(tree[j]!.y);
      }),
    );
  });

  it("makes the graph the tree plus cross links that close cycles", () => {
    const tree = edgeValues(STAGE_EDGES[2]!);
    const graph = edgeValues(STAGE_EDGES[3]!);
    for (const edge of tree) expect(graph.has(edge)).toBe(true);
    for (const [a, b] of CROSS_LINKS) expect(graph.has(pairKey(a, b))).toBe(true);

    // Connected, and more edges than a tree on the same nodes can have.
    const adjacent = new Map<number, number[]>(values.map((v) => [v, []]));
    for (const key of graph) {
      const [a, b] = key.split("-").map(Number) as [number, number];
      adjacent.get(a)!.push(b);
      adjacent.get(b)!.push(a);
    }
    const seen = new Set([values[0]!]);
    const queue = [values[0]!];
    while (queue.length) for (const n of adjacent.get(queue.shift()!)!) if (!seen.has(n) && seen.add(n)) queue.push(n);
    expect(seen.size).toBe(values.length);
    expect(graph.size).toBeGreaterThan(values.length - 1);
  });

  it("keeps each edge as one element across the stages that draw it", () => {
    // One element per edge is what lets a tree edge stay put as the tree becomes a graph.
    const keys = ALL_EDGES.map(({ edge: [a, b] }) => pairKey(values[a]!, values[b]!));
    expect(new Set(keys).size).toBe(keys.length);
    const crossKeys = new Set(CROSS_LINKS.map(([a, b]) => pairKey(a, b)));
    const treeKeys = edgeValues(STAGE_EDGES[2]!);
    for (const { edge: [a, b], stages } of ALL_EDGES) {
      const key = pairKey(values[a]!, values[b]!);
      if (crossKeys.has(key)) expect(stages).toEqual([3]);
      else if (treeKeys.has(key)) expect(stages).toEqual([2, 3]);
      else expect(stages).toEqual([1]);
    }
  });

  it("rests only on whole stages: square cells in slots, circles as nodes", () => {
    expect([clampStage(-1), clampStage(1.4), clampStage(9)]).toEqual([0, 1, 3]);
    expect(cornerFor(0)).toBe(cornerFor(1));
    expect(cornerFor(2)).toBe(CELL / 2);
    expect(cornerFor(3)).toBe(CELL / 2);
    expect(cornerFor(1)).toBeLessThan(cornerFor(2));
  });

  it("names its stage for screen readers and shows exactly that stage's edges", () => {
    const at = (stage: number) => renderToStaticMarkup(<EvolvingStructure stage={stage} />);
    expect(at(0)).toMatch(/role="img"[^>]*aria-label="[^"]*as an array\."/);
    expect(at(1)).toContain(`as a hash table with ${BUCKETS} buckets.`);
    expect(at(2)).toContain("as a binary search tree.");
    expect(at(3)).toContain("as a graph.");
    expect(at(2).match(/<rect/g)).toHaveLength(values.length);
    [0, 1, 2, 3].forEach((stage) =>
      expect(at(stage).match(/data-shown="true"/g) ?? [], `stage ${stage}`).toHaveLength(STAGE_EDGES[stage]!.length),
    );
  });
});

describe("typing", () => {
  it("types whole words: clamps, only grows, and always cuts at the end of a word", () => {
    const text = "Agents write the code. You decide \u{1F600}ok.";
    expect(typedLength(text, -1)).toBe(0);
    expect(typedLength(text, 0)).toBe(0);
    expect(typedLength(text, 2)).toBe(text.length);
    expect(typedLength(text, 1)).toBe(text.length);
    const seen = new Set<string>();
    let last = 0;
    for (let p = 0; p <= 1.0001; p += 0.005) {
      const n = typedLength(text, p);
      expect(n).toBeGreaterThanOrEqual(last);
      // Never mid-word: the typed slice ends at the text's end or before a space.
      if (n > 0 && n < text.length) expect(text[n]).toBe(" ");
      seen.add(text.slice(0, n));
      last = n;
    }
    // Every word boundary appears, one word at a time: "", "Agents", "Agents write", ...
    const words = text.split(" ");
    expect(seen).toEqual(new Set(["", ...words.map((_, i) => words.slice(0, i + 1).join(" "))]));
    expect(typedLength("   ", 0.5)).toBe(3);
  });

  it("finishes each string before the next one starts", () => {
    expect(segmentProgress([2, 3], 0)).toEqual([0, 0]);
    expect(segmentProgress([2, 3], 0.4)).toEqual([1, 0]);
    expect(segmentProgress([2, 3], 0.7)).toEqual([1, 0.5]);
    expect(segmentProgress([2, 3], 1)).toEqual([1, 1]);
  });

  it("types long sections faster per character, within a floor and a ceiling", () => {
    expect(typingDuration(10)).toBe(700);
    expect(typingDuration(100)).toBe(1200);
    expect(typingDuration(5000)).toBe(2400);
    for (let n = 0; n < 400; n += 10) expect(typingDuration(n + 10)).toBeGreaterThanOrEqual(typingDuration(n));
  });

  it("keeps the whole text for screen readers and hides only the visual layer", () => {
    const html = renderToStaticMarkup(<TypedText text="Hello there world" progress={0.4} />);
    expect(html).toContain('<span class="sr-only">Hello there world</span>');
    expect(html).toMatch(
      /<span aria-hidden="true">Hello<span class="typed-caret"><\/span><span data-typed-rest="true" class="text-transparent"> there world<\/span><\/span>/,
    );
    const done = renderToStaticMarkup(<TypedText text="Hello there world" progress={1} />);
    expect(done).not.toContain("typed-caret");
    expect(done).not.toContain("data-typed-rest");
  });

  it("stops the caret blinking under prefers-reduced-motion", () => {
    const css = read("app", "globals.css");
    expect(css).toMatch(/\.typed-caret\s*\{[^}]*animation:\s*typed-caret-blink/);
    const still = [...css.matchAll(/\.typed-caret\s*\{[^}]*animation:\s*none/g)];
    expect(still.some((m) => enclosingMedia(css, m.index!) === "@media (prefers-reduced-motion: reduce)")).toBe(true);
  });

  it("reveals the typed layers when scripts never run", () => {
    expect(read("components", "landing", "LandingStory.tsx")).toContain(
      'NOSCRIPT_REVEAL = "[data-typed-rest]{color:inherit!important}"',
    );
  });
});

describe("snapping", () => {
  const story = read("components", "landing", "LandingStory.tsx");
  const outro = read("components", "landing", "LandingOutro.tsx");

  it("makes active the section under the viewport's middle line", () => {
    const boxes = [
      { top: -800, bottom: 0 },
      { top: 0, bottom: 800 },
      { top: 800, bottom: 1600 },
    ];
    expect(activeSectionIndex(boxes, 400)).toBe(1);
    expect(activeSectionIndex(boxes, 0)).toBe(1);
    expect(activeSectionIndex(boxes, 800)).toBe(2);
    expect(activeSectionIndex(boxes, 2000)).toBe(-1);
  });

  it("turns one wheel gesture into one stop, and never skips part of a tall section", () => {
    const base = { sectionTop: 0, sectionBottom: 1000, viewport: 1000 };
    expect(pagingIntent({ ...base, deltaY: 120 })).toBe("down");
    expect(pagingIntent({ ...base, deltaY: -3 })).toBe("up");
    // Swallowing a gesture's momentum tail is wheelGesture's job now, and is
    // covered in landingPaging.test.ts: pagingIntent only names the direction.
    // A section taller than the viewport scrolls natively until its edge.
    expect(pagingIntent({ ...base, sectionBottom: 1400, deltaY: 100 })).toBe("native");
    expect(pagingIntent({ ...base, sectionTop: -400, sectionBottom: 1000, deltaY: 100 })).toBe("down");
    expect(pagingIntent({ ...base, sectionTop: -400, sectionBottom: 1000, deltaY: -100 })).toBe("native");
    expect(pagingIntent({ ...base, sectionTop: 0, sectionBottom: 1400, deltaY: -100 })).toBe("up");
  });

  it("sets the headline one sentence per line, typed line by line", () => {
    expect(HERO.lines).toEqual(["Agents write the code.", "You decide if it's right."]);
    expect(HERO.title).toBe(HERO.lines.join(" "));
    const html = renderToStaticMarkup(
      <LandingStory counts={{ modules: 1, lessons: 1, problems: 1 }} topics={[]} />,
    );
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)![1]!;
    const lines = [...h1.matchAll(/<span class="block text-balance"><span><span class="sr-only">([^<]*)<\/span>/g)].map((m) =>
      m[1]!.replace(/&#x27;/g, "'"),
    );
    expect(lines).toEqual([...HERO.lines]);
  });

  it("sizes the headline so its longer line fits the column (measured: 14.675em)", () => {
    const h1 = story.match(/<h1 className="([^"]+)"/)![1]!;
    // lg:text-6xl (3.75rem) made the line 55rem in a 49rem column.
    expect(h1).not.toMatch(/\btext-6xl\b/);
    expect(h1).toMatch(/\blg:text-4xl\b/);
    expect(h1).toMatch(/\bxl:text-5xl\b/);
  });

  it("keeps the inline mobile drawings clear of the sticky header", () => {
    const inline = [...story.matchAll(/<EvolvingStructure[^>]*className="([^"]*\blg:hidden\b[^"]*)"/g)].map((m) => m[1]!);
    expect(inline).toHaveLength(2);
    for (const cls of inline) expect(cls).toMatch(/\bmt-8\b/);
  });

  it("pages the wheel on the landing story and centres the pinned drawing in a viewport-tall box", () => {
    expect(story).toMatch(/useSectionPaging\(\);/);
    expect(story).toMatch(/className="sticky top-0 flex h-dvh items-center"/);
  });

  it("snaps only the landing page, mandatory from lg", () => {
    const shell = read("components", "layout", "AppShell.tsx");
    const main = shell.slice(shell.indexOf("<main"), shell.indexOf("</main>"));
    expect(main).toContain('landing && "snap-y snap-proximity lg:snap-mandatory"');
    // One desk wrapper for every route; only on / is it a snap stop.
    expect(main).toMatch(
      /"paper-grain relative",\s*fillMain \? "flex min-h-0 flex-1 flex-col" : "min-h-full",\s*landing && "snap-start",/,
    );
  });

  it("makes the argument, what's inside, pricing and questions full-height stops, but not the hero", () => {
    const hero = story.match(/<section data-scroll-section className="([^"]+)"/)?.[1] ?? "";
    expect(hero).not.toMatch(/\bsnap-start\b/);
    const stop = story.match(/const STOP = "([^"]+)"/)?.[1] ?? "";
    expect(stop).toMatch(/\bsnap-start\b/);
    expect(stop).toMatch(/\bmin-h-dvh\b/);
    // The argument and what's inside; the four chapters are one stop now.
    expect(story.match(/<section data-scroll-section className=\{STOP\}\s*\/?>/g)).toHaveLength(2);
    expect(story.match(/data-scroll-section/g)).toHaveLength(3);
    expect(story).toContain("useActiveSection<HTMLDivElement>(3)");
    const outroSection = outro.match(/const SECTION = "([^"]+)"/)?.[1] ?? "";
    expect(outroSection).toMatch(/\bsnap-start\b/);
    expect(outroSection).toMatch(/\bmin-h-dvh\b/);
    // Pricing, credits and questions.
    expect(outro.match(/<section data-scroll-section className=\{SECTION\}>/g)).toHaveLength(3);
  });

  it("finds the active section by observing the middle band, not by listening for scroll", () => {
    // A page that returns already scrolled fires no scroll event; an observer
    // still reports where the page is.
    const hook = read("components", "landing", "useSectionReveal.ts");
    expect(hook).toMatch(/new IntersectionObserver\(/);
    expect(hook).toMatch(/rootMargin: MIDDLE_BAND/);
    expect(hook).toMatch(/root: document\.querySelector\("main"\)/);
    expect(hook).not.toMatch(/addEventListener\("scroll"/);
  });

  it("animates on arrival, not on scroll position", () => {
    for (const [name, text] of [["LandingStory", story], ["LandingOutro", outro]] as const) {
      expect(text, name).toMatch(/useActiveSection/);
      expect(text, name).toMatch(/useRevealProgress/);
      expect(text, name).toMatch(/ref=\{root\}/);
      expect(text, name).not.toMatch(/useScrollProgress|sectionProgress|ref=\{refs\[/);
    }
    const structure = read("components", "landing", "EvolvingStructure.tsx");
    expect(structure).toContain('from "motion/react"');
    expect(structure).toMatch(/initial=\{false\}/);
    expect(existsSync(join(src, "components", "landing", "useScrollProgress.ts"))).toBe(false);
  });
});

describe("landing copy", () => {
  const stats = curriculumStats();
  const course = inside(stats);
  const text = [WHY.title, ...WHY.points.flatMap((p) => [p.title, p.body])].join("\n");

  it("states numbers that are computed, not typed in", () => {
    // Recomputed here independently of story.ts's helpers.
    const n = 1_000_000;
    const pairs = (n * (n - 1)) / 2;
    expect(text).toContain(`about ${Math.round(pairs / 1_000_000_000)} billion pair checks`);
    expect(text).toContain(`${(100 * 100).toLocaleString("en-US")} steps on a hundred items`);
    expect(n * n).toBe(1e12);
    expect(text).toContain("and a trillion on a million");
    // A correct number typed by hand renders the same text, so check the copy
    // still derives it (CLAUDE.md: every number computed, never typed in).
    const copy = read("lib", "landing", "story.ts");
    expect(copy).toContain("${Math.round(pairCount(MILLION) / 1e9)} billion pair checks");
    expect(copy).toContain("${spellCount(nestedSteps(100))} steps on a hundred items");
    expect(copy).toContain("${spellCount(nestedSteps(MILLION))} on a million");
  });

  it("counts the course from the manifest", () => {
    expect(course.body.join(" ")).toContain(
      `${stats.modules} modules · ${stats.lessons} lessons · ${stats.problems} problems`,
    );
  });

  it("makes the argument in four short points, one screen", () => {
    expect(WHY.points).toHaveLength(4);
    for (const { title, body } of WHY.points) {
      // One line of claim, one line of evidence: long enough to say something, short enough to scan.
      expect(title.length, title).toBeLessThanOrEqual(32);
      expect(body.length, body).toBeLessThanOrEqual(120);
    }
  });

  it("types the heading, then each point's title and body, in order", () => {
    expect(argumentLengths()).toEqual([
      WHY.title.length,
      ...WHY.points.flatMap((p) => [p.title.length, p.body.length]),
    ]);
    // Each point gets longer than the structure's 0.9s morph.
    expect(argumentDuration() / WHY.points.length).toBeGreaterThan(900);
  });

  it("moves the structure one stage per point as each title starts typing", () => {
    const lengths = argumentLengths();
    const at = (p: number) => argumentStage(segmentProgress(lengths, p));
    expect(at(0)).toBe(0);
    // Before the first title starts (still on the heading), stage 0.
    expect(at(WHY.title.length / lengths.reduce((a, b) => a + b, 0) / 2)).toBe(0);
    expect(at(1)).toBe(WHY.points.length - 1);
    const stages: number[] = [];
    for (let p = 0; p <= 1.0001; p += 0.01) stages.push(at(p));
    for (let k = 1; k < stages.length; k++) expect(stages[k]! - stages[k - 1]!).toBeGreaterThanOrEqual(0);
    expect(new Set(stages)).toEqual(new Set([0, 1, 2, 3]));
    // The switch lands exactly where point i's title begins — not its body,
    // which would leave the drawing a line behind the text.
    const total = lengths.reduce((a, b) => a + b, 0);
    const startOf = (segment: number) => lengths.slice(0, segment).reduce((a, b) => a + b, 0);
    for (let i = 1; i < WHY.points.length; i++) {
      const titleStart = startOf(1 + 2 * i);
      expect(at((titleStart - 0.5) / total), `just before point ${i}'s title`).toBe(i - 1);
      expect(at((titleStart + 0.5) / total), `just after point ${i}'s title starts`).toBe(i);
    }
    expect(course.stage).toBe(3);
  });

  it("carries the owner's pricing line and no prices", () => {
    expect(PRICING.title).toBe("Start free. Pay as you learn.");
    const pricing = [PRICING.title, PRICING.body, PRICING.cta].join(" ");
    expect(pricing).not.toMatch(/[$€£₹]\s*\d|\d+\s*(usd|eur|inr|gbp)\b|\/\s*mo\b|per month/i);
  });

  it("carries the thesis and the four arguments the owner chose", () => {
    expect(HERO.title).toBe("Agents write the code. You decide if it's right.");
    // The headline carries the thesis; the lede must name what the course is.
    expect(HERO.lede).toBe(
      "Learning data structures and algorithms is for the part of the job that doesn't get automated.",
    );
    expect(HERO.lede).toMatch(/data structures and algorithms/);
    // The four arguments, problem-solving mindset first.
    expect(WHY.points[0]!.title).toBe("Problem solving is the job.");
    expect(text).toMatch(/Frame it before you prompt/);
    expect(text).toMatch(/Review what it costs/);
    expect(text).toMatch(/Interviews still ask/);
    expect(FAQ).toHaveLength(3);
  });
});

describe("landing page", () => {
  const home = read("components", "landing", "HomePage.tsx");
  const REMOVED = [
    "LandingViz",
    "LandingSandbox",
    "ApproachRail",
    "WaitlistForm",
    "FamilySpotlight",
    "ContinueAndSticky",
    "HeroStructureArt",
    "IdeWalkthrough",
    "WhoNotPractical",
  ];

  it("is built from the story, outro and footer only — no viz or code blocks", () => {
    const imports = [...home.matchAll(/from "([^"]+)"/g)].map((m) => m[1]);
    expect(imports.sort()).toEqual(
      [
        "@/components/landing/LandingFooter",
        "@/components/landing/LandingOutro",
        "@/components/landing/LandingStory",
        "@/lib/landing/content",
        "@/lib/landing/heat",
      ].sort(),
    );
  });

  it("leaves no trace of the removed sections", () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(tsx?|css)$/.test(p)) files.push(readFileSync(p, "utf8"));
      }
    };
    walk(src);
    const all = files.join("\n");
    for (const name of REMOVED) {
      expect(existsSync(join(src, "components", "landing", `${name}.tsx`)), `${name}.tsx deleted`).toBe(false);
      expect(all, `${name} referenced`).not.toMatch(new RegExp(`\\b${name}\\b`));
    }
  });

  it("has no buttons in the story or outro — one plain link is the only call to action", () => {
    for (const file of ["LandingStory.tsx", "LandingOutro.tsx"]) {
      expect(read("components", "landing", file)).not.toMatch(/<button\b/);
    }
  });

  it("shares one centred container with the landing header", () => {
    const header = read("components", "landing", "LandingHeader.tsx");
    for (const [name, text, count] of [
      ["HomePage", home, 1],
      ["LandingHeader", header, 1],
    ] as const) {
      const containers = [...text.matchAll(/className="([^"]*\bmx-auto\b[^"]*)"/g)]
        .map((m) => m[1]!)
        .filter((c) => /\bmax-w-landing\b/.test(c));
      expect(containers, `${name} max-w-landing containers`).toHaveLength(count);
      for (const c of containers) expect(c, `${name} gutters`).toMatch(/\bpx-6\b.*\bmd:px-16\b/);
    }
  });
});
