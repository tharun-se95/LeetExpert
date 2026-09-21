import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { LandingStory } from "@/components/landing/LandingStory";
import { MODULES, STAGES } from "@/lib/course/manifest";
import { curriculumStats, stageCards } from "@/lib/landing/content";
import { heatYear } from "@/lib/landing/heat";
import { featureData } from "@/lib/landing/productData";
import { RISE_STAGGER_MS, stageMeta } from "@/lib/landing/story";

const src = join(__dirname, "..", "src");
const read = (...p: string[]) => readFileSync(join(src, ...p), "utf8");
const cards = stageCards();
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/'/g, "&#x27;");

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

describe("what's inside: stage cards", () => {
  it("has one card per stage, counted from the manifest", () => {
    expect(cards.map((c) => c.number)).toEqual(STAGES.map((s) => s.number));
    for (const card of cards) {
      const stage = STAGES.find((s) => s.number === card.number)!;
      const inStage = MODULES.filter((m) => m.stage === card.number);
      expect(card.title).toBe(stage.title);
      expect(card.description).toBe(stage.description);
      expect(card.modules).toBe(inStage.length);
      expect(card.lessons).toBe(inStage.flatMap((m) => m.lessons).length);
    }
    // Together the stages are the whole course the counts line states.
    const stats = curriculumStats();
    expect(cards.reduce((n, c) => n + c.modules, 0)).toBe(stats.modules);
    expect(cards.reduce((n, c) => n + c.lessons, 0)).toBe(stats.lessons);
  });

  it("links each card to its stage on the curriculum hub, which carries that anchor", () => {
    expect(read("app", "courses", "dsa", "page.tsx")).toMatch(/id=\{`stage-\$\{stage\.number\}`\}/);
    for (const card of cards) expect(card.href).toBe(`/courses/dsa#stage-${card.number}`);
  });

  it("keeps the section's first line clear of the sticky header when it outgrows the screen", () => {
    const story = read("components", "landing", "LandingStory.tsx");
    const inside = story.slice(story.indexOf("function Inside("));
    expect(inside).toMatch(/<p className=\{cn\(KICKER, "mt-8"\)\}>\{chapter\.kicker\}<\/p>/);
  });

  it("pluralises the counts", () => {
    expect(stageMeta({ modules: 1, lessons: 1 })).toBe("1 module · 1 lesson");
    expect(stageMeta({ modules: 3, lessons: 21 })).toBe("3 modules · 21 lessons");
  });

  it("renders every card as one link with its stage, title, description and counts", () => {
    const html = renderToStaticMarkup(
      <LandingStory
        counts={{ modules: 1, lessons: 1, problems: 1 }}
        links={{ start: "/start", curriculum: "/curriculum" }}
        stages={cards}
        features={{ ...featureData(), heat: heatYear("2026-09-14") }}
      />,
    );
    for (const card of cards) {
      const link = html.match(new RegExp(`<a[^>]*href="/courses/dsa#stage-${card.number}"[^>]*>([\\s\\S]*?)</a>`))?.[1] ?? "";
      // renderToStaticMarkup joins "Stage " and the number with no separator comment.
      expect(link, `card for stage ${card.number}`).toMatch(new RegExp(`>Stage (<!-- -->)?${card.number}<`));
      expect(link).toContain(esc(card.title));
      expect(link).toContain(esc(card.description));
      expect(link).toContain(stageMeta(card));
    }
    // Stage cards are the story's only list items that rise in.
    expect(html.match(/<li class="rise-in"/g)).toHaveLength(cards.length);
    expect(html).toContain(`transition-delay:${RISE_STAGGER_MS}ms`);
    // Not lit on the server: the cards rise in when the section arrives.
    expect(html).not.toMatch(/<ol[^>]*data-lit/);
  });

  it("rises in on arrival, and is already in place under reduced motion or without scripts", () => {
    const css = read("app", "globals.css");
    expect(css).toMatch(/\.rise-in\s*\{[^}]*opacity:\s*0;[^}]*transform:\s*translateY/);
    expect(css).toMatch(/\[data-lit\] \.rise-in\s*\{[^}]*opacity:\s*1;[^}]*transform:\s*none;/);
    const still = [...css.matchAll(/\.rise-in\s*\{[^}]*opacity:\s*1;[^}]*transition:\s*none;/g)];
    expect(still.some((m) => enclosingMedia(css, m.index!) === "@media (prefers-reduced-motion: reduce)")).toBe(true);
    expect(read("components", "landing", "LandingStory.tsx")).toContain(
      ".rise-in{opacity:1!important;transform:none!important}",
    );
    expect(css).not.toMatch(/\.stage-card\b/);
  });
});
