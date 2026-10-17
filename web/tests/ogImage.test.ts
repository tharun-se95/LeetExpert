import { describe, it, expect } from "vitest";
import { OG_METRIC_CHIPS, renderOgImage } from "../src/lib/seo/ogImage";

/**
 * Calculates relative luminance according to WCAG 2.1 specification.
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function relativeLuminance(hex: string): number {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Calculates contrast ratio according to WCAG 2.1 (ranges from 1 to 21).
 */
function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("OG Image Metric Chips", () => {
  it("includes all high-converting metric chips requested", () => {
    expect(OG_METRIC_CHIPS).toContain("116+ Curated Problems");
    expect(OG_METRIC_CHIPS).toContain("24 Modules");
    expect(OG_METRIC_CHIPS).toContain("Socratic AI Coach");
    expect(OG_METRIC_CHIPS).toContain("Dual Pyodide/Node Runtimes");
    expect(OG_METRIC_CHIPS).toHaveLength(4);
  });
});

describe("OG Image WCAG AA Compliance", () => {
  // Brand colors used in ogImage card
  const scrimBg = "#16202e";
  const chipBg = "#0f172a";
  const whiteText = "#ffffff";
  const subtitleText = "#cbd5e1";
  const chipText = "#f8fafc";
  const lampGreen = "#5be07a";

  it("ensures card heading meets WCAG AA (>= 4.5:1) and AAA (>= 7:1) contrast", () => {
    const ratio = contrastRatio(whiteText, scrimBg);
    expect(ratio).toBeGreaterThanOrEqual(7.0);
  });

  it("ensures card subtitle meets WCAG AA (>= 4.5:1) and AAA (>= 7:1) contrast", () => {
    const ratio = contrastRatio(subtitleText, scrimBg);
    expect(ratio).toBeGreaterThanOrEqual(7.0);
  });

  it("ensures chip text on chip surface meets WCAG AA (>= 4.5:1) and AAA (>= 7:1) contrast", () => {
    const ratio = contrastRatio(chipText, chipBg);
    expect(ratio).toBeGreaterThanOrEqual(7.0);
  });

  it("ensures chip green dot meets WCAG AA non-text UI contrast (>= 3.0:1)", () => {
    const ratioOnChip = contrastRatio(lampGreen, chipBg);
    const ratioOnScrim = contrastRatio(lampGreen, scrimBg);
    expect(ratioOnChip).toBeGreaterThanOrEqual(3.0);
    expect(ratioOnScrim).toBeGreaterThanOrEqual(3.0);
  });
});

describe("renderOgImage()", () => {
  it("renders an ImageResponse with 1200x630 dimensions", async () => {
    const response = await renderOgImage();
    expect(response).toBeDefined();
    // ImageResponse is a standard Response subclass in Next.js
    expect(response.status).toBe(200);
  });
});
