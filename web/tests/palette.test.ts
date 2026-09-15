import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  GITHUB_RAMPS,
  GRAIN_OPACITY,
  HUE_NAMES,
  LIGHT_TEXT_SURFACES,
  LINE_SURFACE,
  contrastRatio,
  lineColour,
  paletteCssDeclarations,
  ramp,
  textInk,
} from "../src/lib/visual/palette";

describe("contribution green palette generator", () => {
  it("reproduces GitHub's contribution ramps exactly at the green hue", () => {
    // The proof the rule is right: copying the ramp's lightness and chroma
    // at green's own hue must give back GitHub's eight colours unchanged.
    expect(ramp("green", "dark")).toEqual([...GITHUB_RAMPS.dark]);
    expect(ramp("green", "light")).toEqual([...GITHUB_RAMPS.light]);
  });

  it("gives every hue a light text colour that clears 4.5:1 on every light surface", () => {
    for (const hue of HUE_NAMES) {
      const ink = textInk(hue, "light");
      for (const surface of LIGHT_TEXT_SURFACES) {
        expect(
          contrastRatio(ink, surface),
          `${hue} ${ink} on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("uses level 4 as the dark text colour", () => {
    for (const hue of HUE_NAMES) {
      expect(textInk(hue, "dark")).toBe(ramp(hue, "dark")[3]);
    }
  });
});

/** Body of the first `selector {` block, brace-matched so a nested rule cannot end it early. */
function blockBody(css: string, selector: string): string {
  const at = css.indexOf(`\n${selector} {`);
  if (at === -1) return "";
  const open = css.indexOf("{", at);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  return "";
}

describe("palette tokens in globals.css", () => {
  it("every --hue token equals the generator's output, in both themes", () => {
    // The CSS holds literal hexes so the browser needs no runtime maths; this
    // keeps them from being edited away from the derivation.
    const css = readFileSync(join(__dirname, "..", "src", "app", "globals.css"), "utf8");
    const blocks = [
      [":root", "light"],
      [".dark", "dark"],
    ] as const;
    for (const [selector, theme] of blocks) {
      const body = blockBody(css, selector);
      expect(body, `${selector} block not found`).not.toBe("");
      const declared = [...body.matchAll(/--hue-[a-z]+-(?:[1-4]|ink|line):\s*#[0-9a-f]{6};/g)].map(
        (m) => m[0].replace(/:\s*/, ": "),
      );
      expect(declared, `${selector} --hue tokens`).toEqual(paletteCssDeclarations(theme));
    }
  });
});

describe("grain-safe line colours", () => {
  const worstGrainPixel = () =>
    "#" +
    [1, 3, 5]
      .map((i) => Math.round(parseInt(LINE_SURFACE.slice(i, i + 2), 16) * (1 - GRAIN_OPACITY)))
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("");

  it("mirrors the light card and the grain strength from globals.css", () => {
    // palette.ts cannot read CSS, so it keeps copies; this keeps them honest.
    const css = readFileSync(join(__dirname, "..", "src", "app", "globals.css"), "utf8").replace(
      /\/\*[\s\S]*?\*\//g,
      "",
    );
    expect(css.match(/--elevated:\s*(#[0-9a-f]{6});/)?.[1]).toBe(LINE_SURFACE);
    expect(Number(css.match(/--grain-opacity:\s*([\d.]+);/)?.[1])).toBe(GRAIN_OPACITY);
  });

  it("gives every hue a light line that clears 3:1 at the worst grain pixel, darkening level 3 only when needed", () => {
    const worst = worstGrainPixel();
    for (const hue of HUE_NAMES) {
      const level3 = ramp(hue, "light")[2];
      const line = lineColour(hue, "light");
      expect(contrastRatio(line, worst), `${hue} ${line} on ${worst}`).toBeGreaterThanOrEqual(3);
      if (contrastRatio(level3, worst) >= 3) {
        expect(line, `${hue} keeps level 3 when it already clears`).toBe(level3);
      } else {
        expect(contrastRatio(line, worst), `${hue} darkened only as far as needed`).toBeLessThan(3.1);
      }
    }
  });

  it("uses level 4 as the dark line", () => {
    for (const hue of HUE_NAMES) {
      expect(lineColour(hue, "dark")).toBe(ramp(hue, "dark")[3]);
    }
  });
});
