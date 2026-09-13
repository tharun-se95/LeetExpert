import { describe, expect, it } from "vitest";
import {
  GITHUB_RAMPS,
  HUE_NAMES,
  LIGHT_TEXT_SURFACES,
  contrastRatio,
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
