import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { MODULES } from "../src/lib/course/manifest";
import { getModuleArt } from "../src/lib/course/media";

/**
 * Module card art is registry-addressed: the card looks the file up by the
 * module's slug. A renamed module or a failed generation would silently fall
 * back to the SVG glyph in production, which is the failure mode this file
 * exists to convert into a red CI run.
 *
 * Both themes are required together. Shipping one without the other would put
 * a light-inked image on a dark page (or the reverse), so `getModuleArt`
 * returns nothing unless the pair exists — and that pairing is asserted here,
 * not assumed.
 */
const ART_DIR = join(process.cwd(), "public", "media", "module-art");

describe("module card art", () => {
  it("covers every module in the manifest", () => {
    const missing = MODULES.filter((m) => !getModuleArt(m.slug)).map(
      (m) => m.slug,
    );
    expect(missing).toEqual([]);
  });

  it.each(MODULES.map((m) => m.slug))("%s has both theme files", (slug) => {
    expect(existsSync(join(ART_DIR, `${slug}-light.webp`))).toBe(true);
    expect(existsSync(join(ART_DIR, `${slug}-dark.webp`))).toBe(true);
  });

  it("returns public paths, not filesystem paths", () => {
    const art = getModuleArt(MODULES[0]!.slug);
    expect(art?.light).toBe(`/media/module-art/${MODULES[0]!.slug}-light.webp`);
    expect(art?.dark).toBe(`/media/module-art/${MODULES[0]!.slug}-dark.webp`);
  });

  it("returns undefined for a slug that has no art", () => {
    expect(getModuleArt("not-a-real-module")).toBeUndefined();
  });
});
