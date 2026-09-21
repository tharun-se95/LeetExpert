import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { STOP } from "@/components/landing/landingClasses";
import { LandingStory } from "@/components/landing/LandingStory";
import { TypedText } from "@/components/landing/TypedText";
import { pagingIntent } from "@/components/landing/useSectionPaging";
import { activeSectionIndex } from "@/components/landing/useSectionReveal";
import { curriculumStats } from "@/lib/landing/content";
import { heatYear } from "@/lib/landing/heat";
import { featureData } from "@/lib/landing/productData";
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

  it("draws the boxes once, as the page backdrop, and nothing steps it aside", () => {
    // Aceternity's Background Boxes as one canvas replaced the evolving
    // structures on 2026-09-21; it sits behind the whole page, at every width.
    expect(story).not.toContain("LandingBackdrop");
    const home = read("components", "landing", "HomePage.tsx");
    expect(home).toContain("<LandingBackdrop colours={flashColours()} />");
    const backdrop = read("components", "landing", "LandingBackdrop.tsx");
    // Fixed behind the desk's paper, inert and hidden from assistive tech.
    expect(backdrop).toMatch(
      /<canvas[^>]*aria-hidden[^>]*className="landing-boxes pointer-events-none fixed inset-0 -z-1 /,
    );
    // Colour goes through tokens, and the app's animation library is `motion`.
    expect(backdrop).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(backdrop).not.toContain("framer-motion");
    // The pointer is read on window (content covers the layer); touch and
    // reduced motion keep the grid still.
    expect(backdrop).toContain('window.addEventListener("pointermove", onMove)');
    expect(backdrop).toContain('e.pointerType === "touch"');
    expect(backdrop).toContain("prefers-reduced-motion: reduce");
    // Frames run only while a flash is live, so an idle page runs none.
    expect(backdrop).toMatch(/if \(flashes\.size > 0\) frame = requestAnimationFrame\(draw\)/);
    // It watches nothing of the page: no scroll, no sections, no observer.
    expect(backdrop).not.toContain("IntersectionObserver");
    expect(backdrop).not.toContain("data-scroll-section");
    expect(backdrop).not.toMatch(/addEventListener\("scroll"/);
    // The stops that used to ask it to step aside no longer do.
    for (const file of ["LandingOutro.tsx", "LandingFooter.tsx", "LandingStory.tsx", "FeatureSection.tsx"]) {
      expect(read("components", "landing", file), file).not.toContain("data-backdrop-off");
    }
    const css = read("app", "globals.css");
    expect(css).not.toContain("landing-backdrop");
    expect(css).not.toContain("backdrop-sway");
    expect(css).toMatch(/\.landing-boxes \{\s*color: var\(--boxes-line\);/);
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
    // Pricing, learners and questions: one slide since 2026-09-19.
    expect(outro.match(/<section data-scroll-section className=\{STOP\}>/g)).toHaveLength(1);
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
