import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { STOP } from "@/components/landing/landingClasses";
import { LandingStory } from "@/components/landing/LandingStory";
import { activeSectionIndex } from "@/components/landing/useSectionReveal";
import { curriculumStats } from "@/lib/landing/content";
import { heatYear } from "@/lib/landing/heat";
import { featureData } from "@/lib/landing/productData";
import { FAQ, HERO, PRICING, inside } from "@/lib/landing/story";

const src = join(__dirname, "..", "src");
const read = (...p: string[]) => readFileSync(join(src, ...p), "utf8");

describe("scrolling (owner, 2026-09-23: a regular landing page scroll)", () => {
  const story = read("components", "landing", "LandingStory.tsx");
  const outro = read("components", "landing", "LandingOutro.tsx");
  const feature = read("components", "landing", "FeatureSection.tsx");
  const css = read("app", "globals.css");

  it("leaves the wheel, the snap points and the typing to the browser", () => {
    for (const gone of ["useSectionPaging.ts", "TypedText.tsx", "LandingBackdrop.tsx"]) {
      expect(existsSync(join(src, "components", "landing", gone)), gone).toBe(false);
    }
    for (const gone of ["wheelGesture.ts", "boxesGrid.ts"]) {
      expect(existsSync(join(src, "lib", "landing", gone)), gone).toBe(false);
    }
    const shell = read("components", "layout", "AppShell.tsx");
    const main = shell.slice(shell.indexOf("<main"), shell.indexOf("</main>"));
    expect(main).not.toMatch(/\bsnap-(y|start|mandatory|proximity)\b/);
    expect(STOP).not.toMatch(/\bsnap-|\bmin-h-dvh\b/);
    for (const [name, text] of [["LandingStory", story], ["LandingOutro", outro], ["FeatureSection", feature]] as const) {
      expect(text, name).not.toMatch(/snap-start|data-scroll-steps|useTypedText|TypedText|addEventListener\("(wheel|scroll)"/);
    }
    expect(css).not.toMatch(/typed-caret|\.landing-boxes|--boxes-|\.ring-veil/);
  });

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

  it("finds the arrived sections by observing the middle band, not by listening for scroll", () => {
    // Which sections have arrived only decides what loads and when the stage
    // cards rise; a page that returns already scrolled fires no scroll event.
    const hook = read("components", "landing", "useSectionReveal.ts");
    expect(hook).toMatch(/new IntersectionObserver\(/);
    expect(hook).toMatch(/rootMargin: MIDDLE_BAND/);
    expect(hook).toMatch(/root: document\.querySelector\("main"\)/);
    expect(hook).not.toMatch(/addEventListener\("scroll"|requestAnimationFrame/);
    expect(story).toContain("useActiveSection<HTMLDivElement>(5)");
  });

  it("pops cards and text in once as they arrive, timed rather than scrubbed by the scroll", () => {
    // Owner, 2026-09-23: "the animations of the cards should pop, no scroll fade in".
    const hook = read("components", "landing", "usePopIn.ts");
    expect(hook).toMatch(/new IntersectionObserver\(/);
    expect(hook).toContain('dataset.pop = "armed"');
    expect(hook).toContain('dataset.pop = "in"');
    expect(hook).toContain("observer.unobserve(entry.target)");
    // Only what is below the fold is armed, and reduced motion arms nothing.
    expect(hook).toMatch(/getBoundingClientRect\(\)\.top > fold/);
    expect(hook).toContain("prefers-reduced-motion: reduce");
    expect(story).toMatch(/usePopIn\(\);/);
    expect(feature).toMatch(/className=\{cn\("landing-stage landing-pop /);
    expect(css).toMatch(/\[data-pop="in"\] \{\s*animation: landing-pop /);
    expect(css).toMatch(/\.landing-stage\[data-pop="in"\] \{\s*animation-name: landing-pop-card;/);
    // Nothing pops or fades on a scroll timeline.
    const supports = css.slice(css.indexOf("@supports (animation-timeline: view())"));
    const block = supports.slice(0, supports.indexOf("\n}\n") + 2);
    expect(block).not.toMatch(/landing-card3d|landing-pop|landing-reveal|landing-hero-copy/);
    for (const cls of [".landing-mark > svg path", ".landing-hl::before", ".landing-deco", ".landing-hero-floor"]) {
      expect(block, cls).toContain(cls);
    }
    // Outside it the cards rest tilted and floating.
    const rest = css.slice(0, css.indexOf("@supports (animation-timeline: view())"));
    expect(rest).toMatch(/\.landing-card3d \{\s*transform: rotateX\(5deg\) rotateY\(-9deg\);/);
  });

  it("stills every landing animation under prefers-reduced-motion", () => {
    const reduced = css.slice(css.lastIndexOf("@media (prefers-reduced-motion: reduce) {\n  .hero-floor-drift"));
    const block = reduced.slice(0, reduced.indexOf("}\n}") + 3);
    for (const cls of [".hero-floor-drift", ".hero-block", ".hero-word", ".landing-float", '[data-pop="in"]', ".landing-deco", ".landing-hero-floor"]) {
      expect(block, cls).toContain(cls);
    }
    expect(block).toContain("animation: none;");
  });

  it("gives each section one data-scroll-section, and every feature a row of its own", () => {
    expect(story.match(/data-scroll-section/g)).toHaveLength(2);
    expect(feature.match(/data-scroll-section/g)).toHaveLength(1);
    expect(outro.match(/data-scroll-section/g)).toHaveLength(1);
    expect(feature).toMatch(/id=\{verb\.id\}/);
    expect(feature).not.toMatch(/role="tab(list|panel)?"|inert=/);
  });
});

describe("hero (owner, 2026-09-23: full 3D, never behind the copy)", () => {
  const story = read("components", "landing", "LandingStory.tsx");
  const floor = read("components", "landing", "HeroFloor.tsx");
  const css = read("app", "globals.css");
  const html = renderToStaticMarkup(
    <LandingStory
      counts={{ modules: 1, lessons: 1, problems: 1 }}
      links={{ start: "/start", curriculum: "/curriculum" }}
      stages={[]}
      features={{ ...featureData(), heat: heatYear("2026-09-14") }}
    />,
  );

  it("names the headline in plain sentences, one per line, and hides the animated words", () => {
    expect(HERO.lines).toEqual(["Agents write the code.", "You decide if it's right."]);
    const h1 = html.match(/<h1([^>]*)>([\s\S]*?)<\/h1>/)!;
    expect(h1[1]).toContain(`aria-label="${HERO.title.replace("'", "&#x27;")}"`);
    const lines = [...h1[2]!.matchAll(/<span aria-hidden="true" class="block">([\s\S]*?)<\/span>(?=<span aria-hidden="true" class="block">|$)/g)];
    expect(lines).toHaveLength(2);
    const text = (fragment: string) => fragment.replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'");
    expect(lines.map((m) => text(m[1]!).replace(/\s+/g, " ").trim())).toEqual([...HERO.lines]);
  });

  it("stands the data structures on a 3D floor, drawn as solid blocks in one preserve-3d context", () => {
    expect(story).toContain("<HeroFloor />");
    expect(floor).toMatch(/aria-hidden className="landing-hero-floor absolute inset-0"/);
    const blocks = html.match(/class="hero-block"/g) ?? [];
    expect(blocks.length).toBeGreaterThanOrEqual(12);
    // Every block has its top and four sides.
    expect(html.match(/<span class="t"><\/span>/g)).toHaveLength(blocks.length);
    expect(css).toMatch(/\.hero-floor-camera \{[^}]*transform-style: preserve-3d;[^}]*transform: rotateX\(\d+deg\) rotateZ\(-?\d+deg\);/);
    // Colour through tokens: the floor's own, or a family accent from the family table.
    expect(floor).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(floor).toContain("getFamilyTheme(block.family).accentUi");
    for (const token of ["--floor-line", "--floor-line-major", "--floor-block", "--floor-edge", "--floor-shade"]) {
      expect(css.match(new RegExp(`${token}:`, "g")) ?? [], token).toHaveLength(2);
    }
  });

  it("keeps the floor below the copy at every window height, fading in from its top edge", () => {
    expect(css).toMatch(/\.hero-floor \{[^}]*inset: auto 0 0;\s*height: var\(--hero-floor-h\);/);
    // Its top band is fully clear, and the copy is padded by the floor's height
    // less exactly that band, so nothing the floor draws is behind the copy.
    expect(css).toMatch(/mask-image: linear-gradient\(to bottom, transparent 0, transparent var\(--hero-floor-fade\),/);
    expect(story).toMatch(/landing-hero-copy [^"]*\bpb-\[calc\(var\(--hero-floor-h\)-var\(--hero-floor-fade\)\)\]/);
    // Its content's height, not the viewport's: forced full-screen it left a
    // band of empty paper between the buttons and the floor.
    expect(story).not.toMatch(/min-h-\[calc\(100dvh/);
    // The copy and the verb strip sit above it; the strip is solid paper.
    expect(story).toMatch(/className="landing-hero-copy relative z-10 /);
    expect(story).toMatch(/absolute inset-x-0 bottom-0 z-20 [^"]*\bbg-background\b/);
  });

  it("links each of the nine verbs to its own row", () => {
    for (const verb of ["watch", "learn", "map", "code", "review", "optimize", "practice", "recall", "burn"]) {
      expect(html, verb).toContain(`href="#${verb}"`);
      expect(html, verb).toContain(`id="${verb}"`);
    }
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
    // The canvas backdrop, the wheel paging and the typing gave way to the
    // hero's 3D floor and a native scroll (2026-09-23).
    "LandingBackdrop",
    "TypedText",
    "useSectionPaging",
  ];

  it("is built from the story, outro and footer, with server data from content, heat and productData", () => {
    const imports = [...home.matchAll(/from "([^"]+)"/g)].map((m) => m[1]);
    expect(imports.sort()).toEqual(
      [
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
