import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { FAMILY_THEMES } from "@/lib/visual/familyTheme";

/**
 * Guards the viz family-theming pass: every tracer must declare a real
 * family (so a future viz doesn't silently fall back to generic indigo
 * and reintroduce the "everything looks the same" problem this fixed),
 * and every family's onAccent choice must actually clear contrast against
 * its own accent — computed here, not just trusted from a code comment.
 *
 * Spec: docs/superpowers/specs/2026-08-01-viz-family-theming-design.md
 */

const VIZZES_DIR = join(__dirname, "..", "src", "components", "viz", "vizzes");
const VALID_FAMILIES = new Set(FAMILY_THEMES.map((f) => f.id));

function relativeLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const channels = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

function contrastRatio(a: string, b: string): number {
  const L1 = relativeLuminance(a);
  const L2 = relativeLuminance(b);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

describe("viz family theming", () => {
  it("every viz component declares a valid family", () => {
    const files = readdirSync(VIZZES_DIR).filter((f) => f.endsWith(".tsx"));
    expect(files.length).toBeGreaterThan(0);

    const missing: string[] = [];
    const invalid: string[] = [];
    for (const file of files) {
      const body = readFileSync(join(VIZZES_DIR, file), "utf8");
      const match = body.match(/family="([a-z-]+)"/);
      if (!match) {
        missing.push(file);
        continue;
      }
      if (!VALID_FAMILIES.has(match[1] as never)) {
        invalid.push(`${file}: ${match[1]}`);
      }
    }
    expect(missing, "vizzes missing a family prop").toEqual([]);
    expect(invalid, "vizzes with an unknown family id").toEqual([]);
  });

  it("onAccent clears the contrast floor against its own family accent, computed not assumed", () => {
    for (const theme of FAMILY_THEMES) {
      const ratio = contrastRatio(theme.onAccent, theme.accent);
      // White-on-fill text is bold ~14px on the active cell — AA large-text
      // floor (3:1). Families using the #111827 dark-ink fallback clear the
      // full normal-text floor (4.5:1) comfortably, so hold them to that.
      const floor = theme.onAccent.toLowerCase() === "#ffffff" ? 3 : 4.5;
      expect(
        ratio,
        `${theme.id}: ${theme.onAccent} on ${theme.accent} is ${ratio.toFixed(2)}:1, needs >= ${floor}:1`,
      ).toBeGreaterThanOrEqual(floor);
    }
  });
});
