import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Text sits directly on the desk (lesson headers, breadcrumbs, the drawer, the
 * app header) and on the problem panes' --elevated paper, so every text ink
 * must clear AA on both. Recomputed from the tokens so a new paper or ink
 * fails here.
 */
// Comments are stripped first: a comment that happens to read `--token: …;`
// would otherwise redefine that token here, since the last match wins.
const css = readFileSync(join(__dirname, "..", "src", "app", "globals.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);
const split = css.indexOf("\n.dark {");
const tokens = (block: string) =>
  Object.fromEntries(
    [...block.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
  );
const light = tokens(css.slice(0, split));
const dark = { ...light, ...tokens(css.slice(split, css.indexOf("\n}", split))) };

function resolve(t: Record<string, string>, name: string, depth = 0): string {
  const value = t[name];
  expect(value, `--${name}`).toBeDefined();
  const ref = value.match(/^var\(--([a-z0-9-]+)\)$/);
  return ref && depth < 10 ? resolve(t, ref[1], depth + 1) : value;
}

function rgb(value: string): number[] {
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join("") : hex[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }
  const fn = value.match(/^rgba?\(([^)]*)\)$/);
  expect(fn, `colour ${value}`).not.toBeNull();
  return fn![1].split(/[\s,/]+/).slice(0, 3).map(Number);
}

const luminance = (c: number[]) =>
  c
    .map((x) => x / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
    .reduce((sum, x, i) => sum + x * [0.2126, 0.7152, 0.0722][i], 0);

const contrast = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("text on the desk and the problem panes", () => {
  for (const [theme, t] of [
    ["light", light],
    ["dark", dark],
  ] as const) {
    it(`clears AA on --background and --elevated in ${theme}`, () => {
      for (const surface of ["background", "elevated"]) {
        const paper = rgb(resolve(t, surface));
        for (const ink of ["foreground", "muted", "mark", "accent", "good", "bad", "warn", "info"]) {
          expect(contrast(rgb(resolve(t, ink)), paper), `${theme} --${ink} on --${surface}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    });
  }
});

describe("the landing's dark cards resolve every token again", () => {
  // A token :root defines by reference (--foreground: var(--press-ink)) is
  // computed at :root and inherited already resolved, so .dark on a subtree
  // leaves it light unless the subtree declares it again. Everything the dark
  // block does not set itself must be declared in .navy-card.
  it("declares each by-reference token the dark block leaves alone", () => {
    const names = (block: string) => [...block.matchAll(/^\s+--([a-z0-9-]+):\s*([^;]+);/gm)].map((m) => [m[1], m[2]]);
    const rootBlock = css.slice(css.indexOf(":root {"), css.indexOf("\n}", css.indexOf(":root {")));
    const darkBlock = css.slice(split, css.indexOf("\n}", split));
    const cardBlock = css.slice(css.indexOf(".navy-card {"), css.indexOf("\n}", css.indexOf(".navy-card {")));
    const setByDark = new Set(names(darkBlock).map(([n]) => n));
    const inCard = new Set(names(cardBlock).map(([n]) => n));
    const missing = names(rootBlock)
      .filter(([n, v]) => v.includes("var(") && !setByDark.has(n) && !/^(press|hue)-/.test(n))
      .map(([n]) => n)
      .filter((n) => !inCard.has(n));
    expect(missing, "tokens missing from .navy-card").toEqual([]);
  });
});

describe("text on the landing's dark cards", () => {
  // .navy-card carries .dark, so its text takes the dark theme's inks even in
  // the light theme, where the card is painted --card-navy and its inner
  // surfaces take the navy ladder the light-theme rule declares. Those inks
  // must hold AA on every step of it.
  const rule = css.slice(css.indexOf(":root:not(.dark) .navy-card {"));
  const ladder = (name: string) => rule.slice(0, rule.indexOf("}")).match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`))?.[1];

  it("clears AA on the navy ladder with the dark theme's inks", () => {
    const steps = { "card-navy": resolve(light, "card-navy"), elevated: ladder("elevated"), surface: ladder("surface") };
    // The rule remaps --muted for the card (the dark theme's is 3.97:1 on the lifted step).
    const inks = { ...dark, muted: ladder("muted") ?? dark.muted };
    for (const [step, hex] of Object.entries(steps)) {
      expect(hex, `--${step}`).toBeDefined();
      for (const ink of ["foreground", "muted", "mark", "accent", "good", "bad", "warn", "info"]) {
        expect(contrast(rgb(resolve(inks, ink)), rgb(hex!)), `card --${ink} on ${step}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("keeps the ladder visible: each step is told apart from the card by 1.2:1 or more", () => {
    const navy = rgb(resolve(light, "card-navy"));
    for (const step of ["elevated", "surface"]) {
      expect(contrast(rgb(ladder(step)!), navy), `${step} against the card`).toBeGreaterThanOrEqual(1.2);
    }
  });
});

describe("text over the translucent chrome", () => {
  // TRANSLUCENT_PAPER (headerChrome.ts) is page paper at an opacity over
  // whatever scrolls beneath. The darkest real content is a code block
  // (--code-editor); --elevated and the page itself bound it on the other side.
  const chrome = readFileSync(join(__dirname, "..", "src", "components", "layout", "headerChrome.ts"), "utf8");
  const percent = chrome.match(/TRANSLUCENT_PAPER\s*=\s*"bg-background\/(\d+) /)?.[1];

  for (const [theme, t] of [
    ["light", light],
    ["dark", dark],
  ] as const) {
    it(`keeps header text AA over any content beneath in ${theme}`, () => {
      expect(percent, "TRANSLUCENT_PAPER opacity").toBeDefined();
      const alpha = Number(percent) / 100;
      const paper = rgb(resolve(t, "background"));
      for (const under of ["code-editor", "elevated", "background"]) {
        const beneath = rgb(resolve(t, under));
        const mix = paper.map((p, i) => alpha * p + (1 - alpha) * beneath[i]);
        for (const ink of ["foreground", "muted"]) {
          expect(contrast(rgb(resolve(t, ink)), mix), `${theme} --${ink} over --${under}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    });
  }
});

describe("lines on the card", () => {
  // Callout rules and every other *-line sit on --elevated. A stroke only needs 3:1.
  for (const [theme, t] of [
    ["light", light],
    ["dark", dark],
  ] as const) {
    it(`every line clears 3:1 on --elevated in ${theme}`, () => {
      const paper = rgb(resolve(t, "elevated"));
      for (const line of ["good-line", "bad-line", "warn-line", "info-line", "insight-line", "advice-line"]) {
        expect(contrast(rgb(resolve(t, line)), paper), `${theme} --${line} on --elevated`).toBeGreaterThanOrEqual(3);
      }
    });
  }
});
