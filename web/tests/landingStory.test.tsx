import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { EvolvingStructure } from "@/components/landing/EvolvingStructure";
import { STOP } from "@/components/landing/landingClasses";
import { LandingStory } from "@/components/landing/LandingStory";
import { TypedText } from "@/components/landing/TypedText";
import { pagingIntent } from "@/components/landing/useSectionPaging";
import { activeSectionIndex } from "@/components/landing/useSectionReveal";
import { curriculumStats } from "@/lib/landing/content";
import {
  ALL_EDGES,
  ARRAY_CAPSULE,
  ARRAY_STAGE,
  BUCKETS,
  CLOUDS,
  CLOUD_FLOAT,
  CROSS_LINKS,
  FORMED_FLOAT,
  FORMED_MS,
  GRAPH_STAGE,
  HASH_ROW_Y,
  HASH_STAGE,
  LAYOUTS,
  LIST_STAGE,
  MATRIX_COLS,
  MATRIX_STAGE,
  MORPH_MS,
  STAGE_EDGES,
  STAGE_MODULES,
  STAGE_MS,
  STAGE_NAMES,
  STRUCTURE_VALUES,
  TREE_STAGE,
  VIEW_H,
  VIEW_W,
  backdropTarget,
  easeInOut,
  floatOffset,
  frameFor,
  mixFrames,
} from "@/lib/landing/structureLayouts";
import { heatYear } from "@/lib/landing/heat";
import { backdropColours, featureData } from "@/lib/landing/productData";
import { MODULES, moduleFamily } from "@/lib/course/manifest";
import { FAMILY_THEMES } from "@/lib/visual/familyTheme";
import { hexToRgb } from "@/lib/visual/palette";
import {
  FAQ,
  HERO,
  PRICING,
  clamp01,
  inside,
  segmentProgress,
  typedLength,
  typingDuration,
} from "@/lib/landing/story";

const src = join(__dirname, "..", "src");
const read = (...p: string[]) => readFileSync(join(src, ...p), "utf8");
const values = STRUCTURE_VALUES;
/** Six distinct inks, one per stage, so a frame's colour says which stage it wears. */
const INKS = STAGE_NAMES.map((_, i) => hexToRgb(`#${(0x10 + i * 0x20).toString(16).padStart(2, "0")}8040`));
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
  it("draws the six structures in the order the page moves through them", () => {
    expect(STAGE_NAMES).toEqual(["array", "linked list", "hash table", "binary search tree", "matrix", "graph"]);
    expect([ARRAY_STAGE, LIST_STAGE, HASH_STAGE, TREE_STAGE, MATRIX_STAGE, GRAPH_STAGE]).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("places all nine points inside the drawing in every structure and every cloud", () => {
    expect(LAYOUTS).toHaveLength(STAGE_NAMES.length);
    expect(CLOUDS).toHaveLength(STAGE_NAMES.length);
    for (const layout of [...LAYOUTS, ...CLOUDS]) {
      expect(layout).toHaveLength(values.length);
      for (const { x, y } of layout) {
        // The float can carry a cloud point CLOUD_FLOAT further; it must still land inside.
        expect(x - CLOUD_FLOAT).toBeGreaterThan(0);
        expect(x + CLOUD_FLOAT).toBeLessThan(VIEW_W);
        expect(y - CLOUD_FLOAT).toBeGreaterThan(0);
        expect(y + CLOUD_FLOAT).toBeLessThan(VIEW_H);
      }
    }
  });

  it("scatters a different cloud before each structure", () => {
    const keys = CLOUDS.map((cloud) => cloud.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" "));
    expect(new Set(keys).size).toBe(CLOUDS.length);
  });

  it("draws the array as one tight row inside its capsule", () => {
    const row = LAYOUTS[ARRAY_STAGE]!;
    const list = LAYOUTS[LIST_STAGE]!;
    for (let i = 1; i < values.length; i++) {
      expect(row[i]!.y).toBe(row[0]!.y);
      // Tighter than the list: contiguous, not linked.
      expect(row[i]!.x - row[i - 1]!.x).toBeLessThan(list[i]!.x - list[i - 1]!.x);
    }
    for (const { x, y } of row) {
      expect(x).toBeGreaterThan(ARRAY_CAPSULE.x);
      expect(x).toBeLessThan(ARRAY_CAPSULE.x + ARRAY_CAPSULE.width);
      expect(y).toBeGreaterThan(ARRAY_CAPSULE.y);
      expect(y).toBeLessThan(ARRAY_CAPSULE.y + ARRAY_CAPSULE.height);
    }
  });

  it("links the list in array order, left to right", () => {
    const list = LAYOUTS[LIST_STAGE]!;
    for (let i = 1; i < values.length; i++) expect(list[i]!.x).toBeGreaterThan(list[i - 1]!.x);
    const expected = new Set(values.slice(1).map((v, i) => pairKey(values[i]!, v)));
    expect(edgeValues(STAGE_EDGES[LIST_STAGE]!)).toEqual(expected);
  });

  it("files every value in bucket value % buckets, chained in array order", () => {
    const hash = LAYOUTS[HASH_STAGE]!;
    values.forEach((v, i) => expect(hash[i]!.y).toBe(HASH_ROW_Y(v % BUCKETS)));
    const links = edgeValues(STAGE_EDGES[HASH_STAGE]!);
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
    expect(edgeValues(STAGE_EDGES[TREE_STAGE]!)).toEqual(expected);

    const tree = LAYOUTS[TREE_STAGE]!;
    const leftToRight = values.map((v, i) => ({ v, x: tree[i]!.x })).sort((a, b) => a.x - b.x);
    expect(leftToRight.map(({ v }) => v)).toEqual([...values].sort((a, b) => a - b));
    values.forEach((v, i) =>
      values.forEach((w, j) => {
        if (depth.get(v)! > depth.get(w)!) expect(tree[i]!.y).toBeGreaterThan(tree[j]!.y);
      }),
    );
  });

  it("fills a square matrix row by row and joins each cell to its right and lower neighbours", () => {
    expect(MATRIX_COLS * MATRIX_COLS).toBe(values.length);
    const grid = LAYOUTS[MATRIX_STAGE]!;
    const at = (i: number) => ({ row: Math.floor(i / MATRIX_COLS), col: i % MATRIX_COLS });
    values.forEach((_, i) =>
      values.forEach((_, j) => {
        if (at(i).row === at(j).row) expect(grid[i]!.y).toBe(grid[j]!.y);
        if (at(i).col === at(j).col) expect(grid[i]!.x).toBe(grid[j]!.x);
      }),
    );
    const expected = new Set<string>();
    values.forEach((_, i) =>
      values.forEach((_, j) => {
        const [a, b] = [at(i), at(j)];
        if ((a.row === b.row && b.col === a.col + 1) || (a.col === b.col && b.row === a.row + 1))
          expected.add(pairKey(values[i]!, values[j]!));
      }),
    );
    expect(edgeValues(STAGE_EDGES[MATRIX_STAGE]!)).toEqual(expected);
  });

  it("makes the graph the tree plus cross links that close cycles", () => {
    const tree = edgeValues(STAGE_EDGES[TREE_STAGE]!);
    const graph = edgeValues(STAGE_EDGES[GRAPH_STAGE]!);
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

  it("keeps each edge as one element, drawn in exactly the stages whose structure has it", () => {
    // One element per edge is what lets a tree edge stay put as the tree becomes a graph.
    const keys = ALL_EDGES.map(({ edge: [a, b] }) => pairKey(values[a]!, values[b]!));
    expect(new Set(keys).size).toBe(keys.length);
    const perStage = STAGE_EDGES.map(edgeValues);
    for (const { edge: [a, b], stages } of ALL_EDGES) {
      const key = pairKey(values[a]!, values[b]!);
      expect(stages).toEqual(perStage.flatMap((set, stage) => (set.has(key) ? [stage] : [])));
    }
  });

  it("runs its own loop: gather, hold, scatter, float, then the next structure, forever", () => {
    // The first structure gathers from the moment the loop starts.
    expect(backdropTarget(0)).toEqual({ kind: "structure", stage: ARRAY_STAGE });
    expect(backdropTarget(FORMED_MS - 1)).toEqual({ kind: "structure", stage: ARRAY_STAGE });
    // Then it scatters into the cloud the next structure gathers from.
    expect(backdropTarget(FORMED_MS)).toEqual({ kind: "cloud", cloud: LIST_STAGE });
    expect(backdropTarget(STAGE_MS - 1)).toEqual({ kind: "cloud", cloud: LIST_STAGE });
    expect(backdropTarget(STAGE_MS)).toEqual({ kind: "structure", stage: LIST_STAGE });
    // Every structure in page order, and round again after the graph.
    const order = STAGE_NAMES.map((_, k) => backdropTarget(k * STAGE_MS));
    expect(order).toEqual(STAGE_NAMES.map((_, stage) => ({ kind: "structure", stage })));
    expect(backdropTarget(STAGE_NAMES.length * STAGE_MS)).toEqual({ kind: "structure", stage: ARRAY_STAGE });
    expect(backdropTarget((STAGE_NAMES.length - 1) * STAGE_MS + FORMED_MS)).toEqual({ kind: "cloud", cloud: 0 });
    // Each glide lands before the phase ends: the hold and the float are real rests.
    expect(FORMED_MS).toBeGreaterThan(MORPH_MS);
    expect(STAGE_MS - FORMED_MS).toBeGreaterThan(MORPH_MS);
  });

  it("frames a structure with its own edges and extras, a cloud with none", () => {
    STAGE_NAMES.forEach((_, stage) => {
      const frame = frameFor({ kind: "structure", stage }, INKS);
      expect(frame.points).toBe(LAYOUTS[stage]);
      expect(frame.colour).toBe(INKS[stage]);
      expect(frame.edges.filter((e) => e === 1)).toHaveLength(STAGE_EDGES[stage]!.length);
      expect(frame.capsule).toBe(stage === ARRAY_STAGE ? 1 : 0);
      expect(frame.spine).toBe(stage === HASH_STAGE ? 1 : 0);
      expect(frame.float).toBe(FORMED_FLOAT);
    });
    const cloud = frameFor({ kind: "cloud", cloud: 2 }, INKS);
    expect(cloud.points).toBe(CLOUDS[2]);
    // A cloud already wears the ink of the structure it gathers into.
    expect(cloud.colour).toBe(INKS[2]);
    expect(cloud.edges.every((e) => e === 0)).toBe(true);
    expect([cloud.capsule, cloud.spine, cloud.float]).toEqual([0, 0, CLOUD_FLOAT]);
  });

  it("glides from one frame to the next and lands exactly on it", () => {
    const from = frameFor({ kind: "cloud", cloud: 0 }, INKS);
    const to = frameFor({ kind: "structure", stage: TREE_STAGE }, INKS);
    expect(mixFrames(from, to, 0)).toEqual(from);
    expect(mixFrames(from, to, 1)).toEqual({ ...to, points: to.points.map((p) => ({ ...p })) });
    const half = mixFrames(from, to, 0.5);
    expect(half.points[0]!.x).toBeCloseTo((from.points[0]!.x + to.points[0]!.x) / 2);
    half.colour.forEach((c, i) => expect(c).toBeCloseTo((from.colour[i]! + to.colour[i]!) / 2));
    expect([easeInOut(-1), easeInOut(0), easeInOut(0.5), easeInOut(1), easeInOut(2)]).toEqual([0, 0, 0.5, 1, 1]);
    // Slow in, slow out.
    expect(easeInOut(0.1)).toBeLessThan(0.1);
    expect(easeInOut(0.9)).toBeGreaterThan(0.9);
  });

  it("floats every point on its own bounded path", () => {
    const paths = values.map((_, i) => [0, 1, 2, 3].map((s) => floatOffset(i, s * 1.7)));
    for (const path of paths)
      for (const { x, y } of path) {
        expect(Math.abs(x)).toBeLessThanOrEqual(1);
        expect(Math.abs(y)).toBeLessThanOrEqual(1);
      }
    expect(new Set(paths.map((p) => JSON.stringify(p))).size).toBe(values.length);
  });

  it("draws points and lines only — no values, no labels — hidden from assistive tech", () => {
    const html = renderToStaticMarkup(<EvolvingStructure colours={backdropColours()} />);
    expect(html).toMatch(/^<svg[^>]*aria-hidden="true"/);
    expect(html).not.toContain('role="img"');
    expect(html).not.toContain("<text");
    expect(html.match(/<circle/g)).toHaveLength(values.length);
    // It opens on the first cloud, every link still undrawn.
    expect(html.match(/data-edge/g)).toHaveLength(ALL_EDGES.length);
    expect(html.match(/stroke-dashoffset:1;opacity:0/g)).toHaveLength(ALL_EDGES.length);
    CLOUDS[0]!.forEach(({ x }) => expect(html).toContain(`cx="${x}"`));
    // The server paints the ink the loop starts from: the first structure's.
    expect(html).toContain(`--backdrop-ink:${backdropColours()[0]}`);
  });

  it("paints each structure in the family colour of the module that teaches it", () => {
    const slugs = new Set(MODULES.map((m) => m.slug));
    for (const slug of STAGE_MODULES) expect(slugs.has(slug), slug).toBe(true);
    const expected = STAGE_MODULES.map((slug) => FAMILY_THEMES.find((t) => t.id === moduleFamily(slug))!.accentUi);
    expect(backdropColours()).toEqual(expected);
    expect(STAGE_MODULES).toHaveLength(STAGE_NAMES.length);
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

  it("clamps progress, reading a zero-duration run as finished so its loop stops", () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(0.25)).toBe(0.25);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(1 / 0)).toBe(1);
    expect(clamp01(0 / 0)).toBe(0);
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
      '"[data-typed-rest]{color:inherit!important}.rise-in{opacity:1!important;transform:none!important}"',
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
      <LandingStory
        counts={{ modules: 1, lessons: 1, problems: 1 }}
        links={{ start: "/start", curriculum: "/curriculum" }}
        stages={[]}
        features={{ ...featureData(), heat: heatYear("2026-09-14") }}
      />,
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

  it("draws the structure once, as the page backdrop, on its own clock", () => {
    // It stood beside the hero until 2026-09-19; it is the whole page's backdrop now.
    expect(story).not.toContain("<EvolvingStructure");
    const home = read("components", "landing", "HomePage.tsx");
    expect(home).toContain("<LandingBackdrop colours={backdropColours()} />");
    const backdrop = read("components", "landing", "LandingBackdrop.tsx");
    const drawing = read("components", "landing", "EvolvingStructure.tsx");
    expect(backdrop).toContain("<EvolvingStructure colours={colours} ");
    // Independent of scroll (owner, 2026-09-20): the drawing watches nothing,
    // and the backdrop watches only the stops that ask it to step aside.
    expect(drawing).not.toContain("IntersectionObserver");
    for (const text of [backdrop, drawing]) {
      expect(text).not.toContain("data-scroll-section");
      expect(text).not.toMatch(/addEventListener\("scroll"/);
    }
    expect(backdrop).toMatch(/querySelectorAll<HTMLElement>\("\[data-backdrop-off\]"\)/);
    expect(backdrop).toMatch(/aria-hidden[^>]*className="landing-backdrop pointer-events-none fixed inset-y-0 right-0/);
    const css = read("app", "globals.css");
    expect(css).toMatch(/opacity: var\(--backdrop-opacity\);\s*filter: blur\(var\(--backdrop-blur\)\);\s*perspective: \d+px;/);
    expect(css).toMatch(/\.landing-backdrop\[data-off\] \{\s*opacity: 0;/);
    expect(css).toMatch(/\.landing-backdrop-drawing \{\s*animation: backdrop-sway /);
    // The sway stops under reduced motion, like every landing animation.
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.landing-backdrop-drawing \{\s*animation: none;/);
  });

  it("keeps the backdrop in the free space beside the text, never under it", () => {
    // Owner, 2026-09-20: "use the empty space, don't disturb the text".
    const backdrop = read("components", "landing", "LandingBackdrop.tsx");
    // Hidden below xl, where the text spans the screen.
    expect(backdrop).toMatch(/className="landing-backdrop [^"]*\bhidden\b[^"]*\bxl:flex\b/);
    // It starts right of the text column: the container's content edge plus
    // the widest text measure the story uses, plus a gap.
    const left = read("app", "globals.css").match(
      /\.landing-backdrop \{[^}]*left: calc\(max\(4rem, \(100vw - var\(--container-landing\)\) \/ 2 \+ 4rem\) \+ (\d+)rem\);/,
    );
    expect(left, "the zone's left edge").not.toBeNull();
    const measures = [...story.matchAll(/max-w-(\w+)/g)].map((m) => m[1]!);
    const REM: Record<string, number> = { xl: 36, "2xl": 42, "3xl": 48 };
    for (const m of measures) expect(m === "full" || m in REM, `max-w-${m} is wider than the zone allows`).toBe(true);
    // max-w-full only caps the verbs strip, which sizes to its content (w-fit).
    expect(story).toMatch(/w-fit max-w-full/);
    const widest = Math.max(...measures.filter((m) => m in REM).map((m) => REM[m]!));
    expect(Number(left![1])).toBeGreaterThanOrEqual(widest + 2);
    // Stops whose right side carries text ask it to step aside.
    expect(outro).toMatch(/<section data-scroll-section data-backdrop-off /);
    expect(read("components", "landing", "LandingFooter.tsx")).toMatch(/<footer data-backdrop-off /);
  });

  it("pages the wheel on the landing story", () => {
    expect(story).toMatch(/useSectionPaging\(\);/);
  });

  it("snaps only the landing page, mandatory from lg", () => {
    const shell = read("components", "layout", "AppShell.tsx");
    const main = shell.slice(shell.indexOf("<main"), shell.indexOf("</main>"));
    expect(main).toContain('landing && "snap-y snap-proximity lg:snap-mandatory"');
    // One desk wrapper for every route; only on / is it a snap stop.
    expect(main).toMatch(
      /"relative isolate",\s*fillMain \? "flex min-h-0 flex-1 flex-col" : "min-h-full",\s*landing && "snap-start",/,
    );
  });

  it("makes every section after the hero a full-height stop, but not the hero", () => {
    const hero = story.match(/<section\s+data-scroll-section\s+className="([^"]+)"/)?.[1] ?? "";
    expect(hero).toMatch(/\bmin-h-\[calc\(100dvh-6rem\)\]/);
    expect(hero).not.toMatch(/\bsnap-start\b/);
    expect(STOP).toMatch(/\bsnap-start\b/);
    expect(STOP).toMatch(/\bmin-h-dvh\b/);
    // What's inside; Understand, Build and Keep are FeatureSections, each one stop.
    expect(story.match(/<section data-scroll-section className=\{STOP\}\s*\/?>/g)).toHaveLength(1);
    expect(story.match(/data-scroll-section/g)).toHaveLength(2);
    expect(story).toContain("useActiveSection<HTMLDivElement>(5)");
    const feature = read("components", "landing", "FeatureSection.tsx");
    expect(feature.match(/data-scroll-section/g)).toHaveLength(1);
    // A stop below lg; from lg one screen per feature (owner, 2026-09-20).
    expect(feature).toMatch(/data-scroll-section\s+data-scroll-steps=\{count\}\s+id=\{section\.id\}[\s\S]*?className=\{cn\(STOP, STEPPED\)\}/);
    // Pricing, learners and questions: one slide since 2026-09-19; its text
    // runs to the right edge, so the backdrop steps aside for it.
    expect(outro.match(/<section data-scroll-section data-backdrop-off className=\{STOP\}>/g)).toHaveLength(1);
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
      expect(text, name).toMatch(/useTypedText/);
      expect(text, name).toMatch(/ref=\{root\}/);
      expect(text, name).not.toMatch(/useScrollProgress|sectionProgress|ref=\{refs\[/);
    }
    const structure = read("components", "landing", "EvolvingStructure.tsx");
    // The backdrop runs on its own frame clock, not on arrival or scroll.
    expect(structure).toMatch(/requestAnimationFrame\(tick\)/);
    expect(structure).toMatch(/backdropTarget\(elapsed\)/);
    expect(existsSync(join(src, "components", "landing", "useScrollProgress.ts"))).toBe(false);
  });
});

describe("landing copy", () => {
  const stats = curriculumStats();
  const course = inside(stats);

  it("counts the course from the manifest", () => {
    expect(course.body.join(" ")).toContain(
      `${stats.modules} modules · ${stats.lessons} lessons · ${stats.problems} problems`,
    );
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
    // The six-habit screen answers "why learn this if AI writes code", so the
    // FAQ no longer asks it; who it's for and interviews are asked instead.
    expect(FAQ.map((f) => f.q)).toEqual([
      "Who is it for?",
      "Does it help with interviews?",
      "Which languages?",
      "Do I need a CS degree?",
    ]);
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
    // Folded into Understand, Build and Keep (2026-09-17).
    "MethodSteps",
    "ProductShowcase",
    // The section clips gave way to the page backdrop (2026-09-19).
    "SectionClip",
  ];

  it("is built from the backdrop, story, outro and footer, with server data from content, heat and productData", () => {
    const imports = [...home.matchAll(/from "([^"]+)"/g)].map((m) => m[1]);
    expect(imports.sort()).toEqual(
      [
        "@/components/landing/LandingBackdrop",
        "@/components/landing/LandingFooter",
        "@/components/landing/LandingOutro",
        "@/components/landing/LandingStory",
        "@/lib/landing/content",
        "@/lib/landing/heat",
        "@/lib/landing/productData",
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
