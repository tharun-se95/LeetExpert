import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { contrastRatio } from "./helpers/contrast";

/**
 * The brand lamp: one soft-glowing green dot is the whole logo, and the only
 * non-steel ink allowed in chrome.
 *
 * Spec: docs/superpowers/specs/2026-09-13-lamp-logo-design.md
 */

const WEB = join(__dirname, "..");
const SRC = join(WEB, "src");
const css = readFileSync(join(SRC, "app", "globals.css"), "utf8");
// Same slicing as design-tokens.test.ts: the first :root up to the first
// .dark is the light palette, the first .dark onward is dark. globals.css
// has later :root/.dark blocks too — the lamp tokens must live in the FIRST
// of each or every reader of this convention sees the wrong theme.
const root = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
const dark = css.slice(css.indexOf(".dark"));

function hexVar(block: string, name: string): string {
  const m = block.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})\\b`));
  if (!m?.[1]) throw new Error(`--${name} has no 6-digit hex in this block`);
  return m[1].toLowerCase();
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|css)$/.test(entry)) out.push(full);
  }
  return out;
}

describe("brand lamp tokens", () => {
  it("the lamp clears the 3:1 non-text floor on every surface, both themes", () => {
    // A logo is a meaningful graphic (WCAG 1.4.11), so the floor is 3:1, not
    // the 4.5:1 text floor — and it is checked against every surface token,
    // not just the header it happens to sit on today.
    const themes = [
      {
        theme: "light",
        lamp: hexVar(root, "press-lamp"),
        surfaces: {
          elevated: hexVar(root, "elevated"),
          paper: hexVar(root, "press-paper"),
          code: hexVar(root, "code"),
          sunk: hexVar(root, "press-paper-sunk"),
        },
      },
      {
        theme: "dark",
        lamp: hexVar(dark, "press-lamp"),
        surfaces: {
          elevated: hexVar(dark, "elevated"),
          paper: hexVar(dark, "press-paper"),
          code: hexVar(dark, "code"),
          surface: hexVar(dark, "surface"),
        },
      },
    ];
    for (const { theme, lamp, surfaces } of themes) {
      for (const [name, surface] of Object.entries(surfaces)) {
        const ratio = contrastRatio(lamp, surface);
        expect(
          ratio,
          `${theme} lamp ${lamp} on ${name} ${surface} is ${ratio.toFixed(2)}:1, needs >= 3:1`,
        ).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("lamp colour is confined to the mark", () => {
    // The lamp is a deliberate exception to the monochrome base. Without a
    // guard, the next contributor who needs "a green" reaches for it and
    // brand colour leaks into buttons, focus rings and status.
    const LAMP_TOKEN = /--(?:press-)?lamp(?:-[a-z]+)?\b/;
    const LAMP_UTILITY =
      /\b(?:bg|text|fill|stroke|border|ring|outline|decoration|from|via|to|shadow|accent|caret)-lamp(?:-[a-z]+)?\b/;
    const OWNERS = new Set(["app/globals.css", "components/brand/Lamp.tsx"]);
    const leaks = walk(SRC)
      .map((path) => ({
        rel: relative(SRC, path).replace(/\\/g, "/"),
        body: readFileSync(path, "utf8"),
      }))
      .filter(
        (f) =>
          !OWNERS.has(f.rel) &&
          (LAMP_TOKEN.test(f.body) || LAMP_UTILITY.test(f.body)),
      )
      .map((f) => f.rel);
    expect(leaks).toEqual([]);
  });
});
