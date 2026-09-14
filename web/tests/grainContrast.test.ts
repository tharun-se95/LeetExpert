import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The desk grain darkens or lightens individual pixels of --background by up
 * to --grain-opacity. Text sits directly on that desk (lesson headers,
 * breadcrumbs, the drawer, the app header), so every text ink must still
 * clear AA against the worst pixel: the one pushed toward the ink itself.
 * Recomputed from the tokens so a stronger grain or a new paper fails here.
 */
const css = readFileSync(join(__dirname, "..", "src", "app", "globals.css"), "utf8");
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

describe("text over the desk grain", () => {
  for (const [theme, t] of [
    ["light", light],
    ["dark", dark],
  ] as const) {
    it(`clears AA at the worst grain pixel in ${theme}`, () => {
      const paper = rgb(resolve(t, "background"));
      const opacity = Number(resolve(t, "grain-opacity"));
      expect(opacity).toBeGreaterThan(0);
      for (const ink of ["foreground", "muted", "mark", "accent", "good", "bad", "warn", "info"]) {
        const colour = rgb(resolve(t, ink));
        const grey = luminance(colour) < luminance(paper) ? 0 : 255;
        const worst = paper.map((p) => p * (1 - opacity) + grey * opacity);
        expect(contrast(colour, worst), `${theme} --${ink}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});
