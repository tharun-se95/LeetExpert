/**
 * The contribution-green palette (spec 2026-09-14-contribution-green-palette-design).
 *
 * Every hue copies the OKLCH lightness and chroma of GitHub's contribution
 * ramp at each level, so the set steps evenly the way that green does. The
 * CSS tokens in globals.css are this module's output, checked in CI by
 * tests/palette.test.ts — edit the rule here, never a hex there.
 *
 * No React or DOM imports: tests and a plain `node` run both load it.
 */

export type Theme = "light" | "dark";

export const HUE_NAMES = [
  "red",
  "orange",
  "yellow",
  "green",
  "cyan",
  "blue",
  "purple",
  "pink",
] as const;
export type HueName = (typeof HUE_NAMES)[number];

/** OKLCH hue angle per palette hue, in degrees. */
export const HUE_ANGLES: Record<HueName, number> = {
  red: 25,
  orange: 55,
  yellow: 95,
  green: 146,
  cyan: 200,
  blue: 255,
  purple: 300,
  pink: 350,
};

/** GitHub's contribution-graph ramps, levels 1–4 (level 0 is "no activity"). */
export const GITHUB_RAMPS: Record<Theme, readonly [string, string, string, string]> = {
  dark: ["#0e4429", "#006d32", "#26a641", "#39d353"],
  light: ["#9be9a8", "#40c463", "#30a14e", "#216e39"],
};

/**
 * The surfaces a light text colour must clear 4.5:1 on: --background,
 * --elevated, --code, --surface. Mirrored here because the text-ink rule
 * depends on them; if a surface changes, the palette test fails until the
 * tokens are regenerated.
 */
export const LIGHT_TEXT_SURFACES = ["#f1f4f9", "#ffffff", "#e4e9f2", "#d8dde8"] as const;

const TEXT_FLOOR = 4.5;
/** Light text uses 98% of the gamut-max chroma: the last 2% sits on the gamut edge, where rounding can clip a channel. */
const TEXT_CHROMA_SHARE = 0.98;
const TEXT_LIGHTNESS_STEP = 0.004;

/**
 * The light card (--elevated) and the paper-grain strength (--grain-opacity).
 * Mirrored because the line rule depends on them: a line on the grainy
 * problem panes is weakest where the grain pushes the paper toward black.
 * tests/palette.test.ts checks both against globals.css.
 */
export const LINE_SURFACE = "#ffffff";
export const GRAIN_OPACITY = 0.067;
const LINE_FLOOR = 3;
const LINE_LIGHTNESS_STEP = 0.002;

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as Rgb;
}

function rgbToHex(rgb: Rgb): string {
  return (
    "#" +
    rgb
      .map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export interface Oklch {
  L: number;
  C: number;
  H: number;
}

export function hexToOklch(hex: string): Oklch {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), H: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}

function oklchToLinearRgb(L: number, C: number, H: number): Rgb {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

// A hair of tolerance: the matrices round, and an exact-gamut colour can land
// at -0.00001 on a channel that is genuinely 0.
const inGamut = (rgb: Rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);

function oklchToHex(L: number, C: number, H: number): string {
  return rgbToHex(oklchToLinearRgb(L, C, H).map(toGamma) as Rgb);
}

/** The largest chroma at lightness L and hue H that a screen (sRGB) can show. */
function maxChroma(L: number, H: number): number {
  let lo = 0;
  let hi = 0.4;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToLinearRgb(L, mid, H))) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** Keep L and H; lower chroma only as far as the screen needs. */
function gamutMapped(L: number, C: number, H: number): string {
  if (inGamut(oklchToLinearRgb(L, C, H))) return oklchToHex(L, C, H);
  let lo = 0;
  let hi = C;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToLinearRgb(L, mid, H))) lo = mid;
    else hi = mid;
  }
  return oklchToHex(L, lo, H);
}

/** WCAG 2.x contrast ratio. */
export function contrastRatio(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = hexToRgb(hex).map(toLinear);
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** Levels 1–4 of `hue` for `theme`. */
export function ramp(hue: HueName, theme: Theme): [string, string, string, string] {
  return GITHUB_RAMPS[theme].map((anchor) => {
    const { L, C, H } = hexToOklch(anchor);
    // Green keeps each anchor level's own hue (157°, 151°, 146°, 146° in dark):
    // a single angle would drift the first two levels off GitHub's colours.
    return gamutMapped(L, C, hue === "green" ? H : HUE_ANGLES[hue]);
  }) as [string, string, string, string];
}

/**
 * The colour for text in `hue`. Dark: level 4, already at or near the gamut
 * edge. Light: level 4's lightness at near-maximum chroma — GitHub's light
 * level 4 has chroma 0.112, which turned red brownish (#92403c) — stepping
 * lightness down only if a light surface would fall under 4.5:1.
 */
export function textInk(hue: HueName, theme: Theme): string {
  if (theme === "dark") return ramp(hue, "dark")[3];
  const H = HUE_ANGLES[hue];
  // Start from this hue's own level 4, not GitHub's anchor: after gamut
  // mapping and hex rounding the two differ slightly, and level 4 is the
  // colour the ink replaces.
  let L = hexToOklch(ramp(hue, "light")[3]).L;
  let ink = oklchToHex(L, maxChroma(L, H) * TEXT_CHROMA_SHARE, H);
  const weakest = (hex: string) =>
    Math.min(...LIGHT_TEXT_SURFACES.map((surface) => contrastRatio(hex, surface)));
  while (weakest(ink) < TEXT_FLOOR && L > 0.2) {
    L -= TEXT_LIGHTNESS_STEP;
    ink = oklchToHex(L, maxChroma(L, H) * TEXT_CHROMA_SHARE, H);
  }
  return ink;
}

/**
 * The colour for a 3:1 line (rule, border, stroke) in `hue`. Dark: level 4,
 * which clears 5.43:1 or more even at the worst grain pixel. Light: level 3,
 * with lightness lowered at the same hue and chroma only until it clears 3:1
 * against the worst grain pixel on the card — at level 3 green fell to
 * 2.86:1 on the grainy problem panes (palette spec §4.3, amended 2026-09-15).
 */
export function lineColour(hue: HueName, theme: Theme): string {
  if (theme === "dark") return ramp(hue, "dark")[3];
  const level3 = ramp(hue, "light")[2];
  const { C, H } = hexToOklch(level3);
  let { L } = hexToOklch(level3);
  const worst = rgbToHex(hexToRgb(LINE_SURFACE).map((c) => c * (1 - GRAIN_OPACITY)) as Rgb);
  let line = level3;
  while (contrastRatio(line, worst) < LINE_FLOOR && L > 0.2) {
    L -= LINE_LIGHTNESS_STEP;
    line = gamutMapped(L, C, H);
  }
  return line;
}

/** The token declarations for one theme block, in palette order. */
export function paletteCssDeclarations(theme: Theme): string[] {
  return HUE_NAMES.flatMap((hue) => [
    ...ramp(hue, theme).map((hex, i) => `--hue-${hue}-${i + 1}: ${hex};`),
    `--hue-${hue}-ink: ${textInk(hue, theme)};`,
    `--hue-${hue}-line: ${lineColour(hue, theme)};`,
  ]);
}
