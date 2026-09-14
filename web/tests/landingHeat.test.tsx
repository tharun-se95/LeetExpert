import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { HEAT_NOSCRIPT, HeatMap, heatSummary } from "@/components/landing/HeatMap";
import { HEAT_THRESHOLDS, HEAT_WEEKS, exampleCounts, heatLevel, heatYear, type HeatDay } from "@/lib/landing/heat";
import { HEAT } from "@/lib/landing/story";

const src = join(__dirname, "..", "src");
const read = (...p: string[]) => readFileSync(join(src, ...p), "utf8");
const END = "2026-09-14";
const year = heatYear(END);
const days = year.weeks.flat().filter((d): d is HeatDay => d !== null);

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

describe("example heat year", () => {
  it("lays out 52 Sunday-first weeks ending exactly on the end date", () => {
    expect(year.weeks).toHaveLength(HEAT_WEEKS);
    for (const week of year.weeks) expect(week).toHaveLength(7);
    // 2026-09-14 is a Monday, so the last column holds Sunday and Monday.
    const endWeekday = new Date(`${END}T00:00:00Z`).getUTCDay();
    expect(endWeekday).toBe(1);
    expect(days).toHaveLength((HEAT_WEEKS - 1) * 7 + endWeekday + 1);
    expect(days.at(-1)!.date).toBe(END);
    expect(new Date(`${days[0]!.date}T00:00:00Z`).getUTCDay()).toBe(0);
    // Consecutive days, and nulls only after the end.
    for (let i = 1; i < days.length; i++) {
      const gap = Date.parse(`${days[i]!.date}T00:00:00Z`) - Date.parse(`${days[i - 1]!.date}T00:00:00Z`);
      expect(gap).toBe(86_400_000);
    }
    const flat = year.weeks.flat();
    expect(flat.slice(days.length).every((d) => d === null)).toBe(true);
  });

  it("levels each day by the thresholds", () => {
    expect([0, 1, 2, 3, 5, 6, 9, 10, 40].map(heatLevel)).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4]);
    expect(HEAT_THRESHOLDS).toEqual([1, 3, 6, 10]);
    for (const day of days) expect(day.level).toBe(heatLevel(day.count));
    // Every legend level actually appears, so the legend describes the drawing.
    expect(new Set(days.map((d) => d.level))).toEqual(new Set([0, 1, 2, 3, 4]));
  });

  it("computes the numbers it prints", () => {
    expect(year.activeDays).toBe(days.filter((d) => d.count > 0).length);
    let best = 0;
    for (let i = 0; i < days.length; i++) {
      let j = i;
      while (j < days.length && days[j]!.count > 0) j++;
      best = Math.max(best, j - i);
    }
    expect(year.longestStreak).toBe(best);
  });

  it("labels months where a new month's first week begins", () => {
    const monthOfWeek = (w: number) => new Date(`${year.weeks[w]![0]!.date}T00:00:00Z`).getUTCMonth();
    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (const { week, label } of year.months) expect(label).toBe(names[monthOfWeek(week)]);
    for (let w = 1; w < HEAT_WEEKS; w++) {
      if (monthOfWeek(w) !== monthOfWeek(w - 1)) expect(year.months.some((m) => m.week === w)).toBe(true);
    }
    for (let k = 1; k < year.months.length; k++) {
      expect(year.months[k]!.week - year.months[k - 1]!.week).toBeGreaterThan(2);
    }
  });

  it("is the same year every time, and warmer at the end than the start", () => {
    expect(heatYear(END)).toEqual(year);
    const counts = exampleCounts(365, 20260914);
    const active = (from: number, to: number) => counts.slice(from, to).filter((c) => c > 0).length;
    expect(active(265, 365)).toBeGreaterThan(active(0, 100));
    expect(() => heatYear("14/09/2026")).toThrow(/YYYY-MM-DD/);
  });
});

describe("heat map", () => {
  const dark = renderToStaticMarkup(<HeatMap year={year} lit={false} />);
  const lit = renderToStaticMarkup(<HeatMap year={year} lit />);

  it("draws one square per day, filled by its level", () => {
    const rects = [...dark.matchAll(/<rect[^>]*data-date="([^"]+)"[^>]*data-level="(\d)"[^>]*class="heat-cell fill-heat-(\d)"/g)];
    expect(rects).toHaveLength(days.length);
    rects.forEach(([, date, level, fill], i) => {
      expect(date).toBe(days[i]!.date);
      expect(level).toBe(String(days[i]!.level));
      expect(fill).toBe(level);
    });
  });

  it("stays dark until its section arrives, then lights", () => {
    expect(dark).not.toContain("data-lit");
    expect(lit).toMatch(/<svg[^>]*data-lit="true"/);
  });

  it("describes itself from the same numbers it prints", () => {
    const summary = heatSummary(year);
    expect(summary).toBe(`An example year: ${year.activeDays} days practised, longest streak ${year.longestStreak} days`);
    expect(dark).toMatch(new RegExp(`role="img"[^>]*aria-label="${summary}\\."`));
    expect(dark).toContain(`<p>${summary}</p>`);
  });

  it("shows every square without scripts", () => {
    expect(HEAT_NOSCRIPT).toBe(".heat-cell{opacity:1!important}");
    expect(dark).toContain(`<noscript><style>${HEAT_NOSCRIPT}</style></noscript>`);
  });
});

describe("credits section", () => {
  const css = read("app", "globals.css");

  it("presents the heatmap as a feature, with the owner's credits line and no credit amounts", () => {
    expect(HEAT.kicker).toBe("Feature");
    expect(HEAT.title).toBe("Heatmap");
    expect(HEAT.credits).toBe("Earn credits for consistent heat.");
    expect([HEAT.title, HEAT.body, HEAT.credits].join(" ")).not.toMatch(/\d/);
    const outro = read("components", "landing", "LandingOutro.tsx");
    // The credits line types after the heading and body.
    expect(outro).toContain("[HEAT.title.length, HEAT.body.length, HEAT.credits.length]");
    expect(outro).toMatch(/<TypedText text=\{HEAT\.credits\} progress=\{credits \?\? 0\} \/>/);
  });

  it("sits between pricing and the questions, as its own snap stop", () => {
    const outro = read("components", "landing", "LandingOutro.tsx");
    expect(outro).toContain("useActiveSection<HTMLDivElement>(3)");
    const order = ["<Pricing started={started[0]", "<HeatmapFeature started={started[1]", "<Questions started={started[2]"].map((s) =>
      outro.indexOf(s),
    );
    expect(order.every((i) => i > 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(outro.match(/<section data-scroll-section className=\{SECTION\}>/g)).toHaveLength(3);
  });

  it("defines the heat ramp as tokens in both themes", () => {
    const split = css.indexOf("\n.dark {");
    const root = css.slice(0, split);
    const darkBlock = css.slice(split, css.indexOf("\n}", split));
    for (let level = 0; level <= 4; level++) {
      expect(root, `:root --heat-${level}`).toMatch(new RegExp(`--heat-${level}:\\s*#[0-9a-f]{6};`, "i"));
      expect(darkBlock, `.dark --heat-${level}`).toMatch(new RegExp(`--heat-${level}:\\s*#[0-9a-f]{6};`, "i"));
      expect(css).toContain(`--color-heat-${level}: var(--heat-${level});`);
    }
  });

  it("fades the year in, and shows it lit under prefers-reduced-motion", () => {
    expect(css).toMatch(/\.heat-cell\s*\{[^}]*opacity:\s*0;[^}]*transition:/);
    expect(css).toMatch(/\[data-lit\] \.heat-cell\s*\{[^}]*opacity:\s*1;/);
    const still = [...css.matchAll(/\.heat-cell\s*\{[^}]*opacity:\s*1;[^}]*transition:\s*none;/g)];
    expect(still.some((m) => enclosingMedia(css, m.index!) === "@media (prefers-reduced-motion: reduce)")).toBe(true);
  });
});
