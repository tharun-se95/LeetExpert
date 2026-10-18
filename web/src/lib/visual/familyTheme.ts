import type { CSSProperties } from "react";
import type { FamilyId } from "@/lib/content/manifest";
import { FAMILIES } from "@/lib/content/manifest";
import { contrastRatio, gamutMapped, hexToOklch, hexToRgb, rgbToHex } from "./palette";

/**
 * SINGLE SOURCE for family colours. Each family authors ONE hex, its hue
 * from The Grid Underneath (owner, 2026-09-25; spec
 * docs/superpowers/specs/2026-09-25-grid-app-theme-design.md §5): that hex
 * is the dark theme's colour, and every other value — the light variant,
 * both themes' UI accent, the inks on each fill — is derived from it here.
 * To recolor a family, point it at another hue in THEME_BY_ID, or add a
 * hue to GRID_HUES (the lesson artifacts read that table by name too).
 *
 * The two themes need different values (a Grid hue is bright enough for
 * navy but ~2.6:1 on white paper), and familyCssVars writes inline style,
 * which no theme stylesheet can override. So the CSS values are
 * `light-dark(<light>, <dark>)`, resolved where the colour is used by
 * `color-scheme` (set on :root and .dark in globals.css): a `.dark` subtree
 * — the dark theme, or a navy instrument card inside the light theme —
 * gets the dark hue it needs on navy. Anything that paints without CSS (a
 * video's brand tokens, a test) reads the concrete `light` / `dark` inks.
 * An SVG presentation attribute is not CSS either: pass these colours
 * through `style` or `currentColor`, never as `fill=`/`stroke=`.
 */
export type FamilyMotif =
  | "tiles"
  | "cursors"
  | "ruler"
  | "tree"
  | "switchboard"
  | "constellation"
  | "podium"
  | "curves";

export type ThemeName = "light" | "dark";

/** One theme's concrete family colours, all hex. */
export interface FamilyInk {
  /** The family's fill (viz cells, dots, --family-accent). */
  accent: string;
  /**
   * The accent used for UI chrome (--accent / --pop / --highlight) when the
   * family becomes a scope's primary: the smallest push (toward black in
   * light, white in dark) that clears the 3:1 non-text floor on every
   * surface of that theme. The Grid hues and their light variants already
   * clear it, so today this equals `accent`; the push stays so a recolor
   * cannot ship chrome under the floor.
   */
  accentUi: string;
  /** Text on a solid `accent` fill, computed by pickInk. */
  onAccent: string;
  /** Text on a solid `accentUi` fill (--on-pop), computed by pickInk. */
  onAccentUi: string;
}

export interface FamilyTheme extends FamilyInk {
  id: FamilyId;
  motif: FamilyMotif;
  label: string;
  /** The authored Grid hue — the dark theme's accent. */
  grid: string;
  light: FamilyInk;
  dark: FamilyInk;
  // The inherited FamilyInk fields are `light-dark(<light>, <dark>)` CSS values.
}

// Every surface the UI accent can render on in each theme — --pop/--accent
// paint chrome across the sidebar (elevated), editor (code), tests rail
// (surface) and the page itself (background), not just the page. Order:
// background, elevated, code, surface. design-tokens.test.ts checks these
// against globals.css, so a surface change cannot leave them stale.
export const FAMILY_SURFACES: Record<ThemeName, readonly string[]> = {
  light: ["#ffffff", "#ffffff", "#f8fafc", "#f1f5f9"],
  dark: ["#15202e", "#223145", "#1b2735", "#101a26"],
};
// The Grid's ink on its bright fills (5.84:1 on its blue, the tightest).
const DARK_INK = "#0e1726";

/** Linear RGB interpolation: t=0 → a, t=1 → b. */
function mixHex(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex(ca.map((c, i) => c + (cb[i] - c) * t) as [number, number, number]);
}

function clearsAll(hex: string, surfaces: readonly string[], floor = 3): boolean {
  return surfaces.every((s) => contrastRatio(hex, s) >= floor);
}

/**
 * Push `hex` toward `target` (mix ratio 0→1) until `clears` is satisfied,
 * taking the SMALLEST push that does. Returns the original colour unchanged
 * if even a full push cannot satisfy it, so the token test fails loudly
 * rather than shipping pure black/white silently.
 */
function pushToward(
  hex: string,
  target: string,
  clears: (candidate: string) => boolean,
): string {
  if (clears(hex)) return hex;
  if (!clears(mixHex(hex, target, 1))) return hex;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (clears(mixHex(hex, target, mid))) hi = mid;
    else lo = mid;
  }
  return mixHex(hex, target, hi);
}

/**
 * The UI accent for one theme: the smallest push that clears 3:1 on every
 * surface of that theme — darker on the light papers, lighter on navy.
 * Each theme has its own value now, so the two floors no longer pull one
 * hex in opposite directions.
 */
export function uiAccentFor(accent: string, theme: ThemeName): string {
  const surfaces = FAMILY_SURFACES[theme];
  return pushToward(accent, theme === "light" ? "#000000" : "#ffffff", (h) => clearsAll(h, surfaces));
}

/**
 * The light theme's variant of a Grid hue: the same OKLCH hue, lightness
 * lowered (chroma only as far as the screen needs) until white text on it
 * clears AA 4.5:1. Viz cells carry text on the solid fill, so that is the
 * binding floor; it also lands every variant >= 3.3:1 on the four light
 * surfaces, so one value serves fills and chrome.
 */
export function lightVariant(grid: string): string {
  const { L, C, H } = hexToOklch(grid);
  for (let l = L; l > 0.2; l -= 0.001) {
    const candidate = gamutMapped(l, C, H);
    if (contrastRatio("#ffffff", candidate) >= 4.5) return candidate;
  }
  return grid;
}

/**
 * Best ink for text on a solid `fill`, computed rather than assumed: white
 * or the Grid's dark ink, whichever clears AA 4.5:1 (white first). If
 * neither does, the better of the two, so the caller's AA test fails loudly.
 */
function pickInk(fill: string): string {
  const white = contrastRatio("#ffffff", fill);
  const dark = contrastRatio(DARK_INK, fill);
  if (white >= 4.5) return "#ffffff";
  if (dark >= 4.5) return DARK_INK;
  return white >= dark ? "#ffffff" : DARK_INK;
}

function inkFor(accent: string, theme: ThemeName): FamilyInk {
  const accentUi = uiAccentFor(accent, theme);
  return { accent, accentUi, onAccent: pickInk(accent), onAccentUi: pickInk(accentUi) };
}

const lightDark = (light: string, dark: string) => (light === dark ? light : `light-dark(${light}, ${dark})`);

/** Both themes' inks for one authored dark hex, and their light-dark() CSS values. */
function themed(grid: string): Pick<FamilyTheme, "grid" | "light" | "dark" | keyof FamilyInk> {
  const light = inkFor(lightVariant(grid), "light");
  const dark = inkFor(grid, "dark");
  return {
    grid,
    light,
    dark,
    accent: lightDark(light.accent, dark.accent),
    accentUi: lightDark(light.accentUi, dark.accentUi),
    onAccent: lightDark(light.onAccent, dark.onAccent),
    onAccentUi: lightDark(light.onAccentUi, dark.onAccentUi),
  };
}

/**
 * The Grid's state hues (owner, 2026-09-25). Relationships had shared teal
 * with linear traversal; magenta #E07BE0 is a 7th hue in the Grid's band
 * (OKLCH L0.67-0.81, C0.12-0.18), chosen by distance: 0.120 dE-OK from its
 * nearest Grid hue, far from the brand lamp and --good (spec §5).
 * Olive #959E03 (OKLCH L0.67 C0.15 h114) is the 8th, for the foundations
 * family (owner, #15): the colour in the band whose nearest neighbour is
 * farthest away — 0.152 from yellow, 0.148 from the greens (#40).
 */
export const GRID_HUES = {
  teal: "#3CC3AE",
  orange: "#F08A4B",
  blue: "#5C8FFF",
  violet: "#9B86FF",
  yellow: "#E3BD3F",
  magenta: "#E07BE0",
  pink: "#FF6B8B",
  olive: "#959E03",
} as const;

const THEME_BY_ID: Record<FamilyId, { grid: string; motif: FamilyMotif }> = {
  "linear-traversal": { grid: GRID_HUES.teal, motif: "tiles" },
  "pointer-movement": { grid: GRID_HUES.orange, motif: "cursors" },
  "ordering-search": { grid: GRID_HUES.blue, motif: "ruler" },
  "recursive-exploration": { grid: GRID_HUES.violet, motif: "tree" },
  "state-transition": { grid: GRID_HUES.yellow, motif: "switchboard" },
  relationships: { grid: GRID_HUES.magenta, motif: "constellation" },
  "priority-structures": { grid: GRID_HUES.pink, motif: "podium" },
  foundations: { grid: GRID_HUES.olive, motif: "curves" },
};

function labelFor(id: FamilyId): string {
  return FAMILIES.find((f) => f.id === id)?.shortTitle ?? id;
}

function build(id: FamilyId): FamilyTheme {
  const { grid, motif } = THEME_BY_ID[id];
  return { id, motif, label: labelFor(id), ...themed(grid) };
}

export const FAMILY_THEMES: FamilyTheme[] = (Object.keys(THEME_BY_ID) as FamilyId[]).map(build);

const BY_ID = new Map(FAMILY_THEMES.map((t) => [t.id, t]));

/** A family's theme; an unknown id falls back to linear traversal. */
export function getFamilyTheme(id: FamilyId | string): FamilyTheme {
  return BY_ID.get(id as FamilyId) ?? BY_ID.get("linear-traversal")!;
}

function accentCssVars(t: Pick<FamilyTheme, keyof FamilyInk>): CSSProperties {
  return {
    "--family-accent": t.accent,
    "--family-on-accent": t.onAccent,
    "--family-wash": `color-mix(in oklab, ${t.accent} 12%, transparent)`,
    // The family becomes the scope's primary. accentUi is the
    // 3:1-on-every-surface variant; on-pop is onAccentUi (paired with
    // accentUi, NOT onAccent — the two fills can need different ink).
    // --mark is deliberately NOT remapped: it stays the body accent ink.
    "--accent": t.accentUi,
    "--accent-hover": `color-mix(in oklab, ${t.accentUi} 85%, white)`,
    "--accent-active": t.accentUi,
    "--pop": t.accentUi,
    "--on-pop": t.onAccentUi,
    "--highlight": `color-mix(in oklab, ${t.accentUi} 14%, transparent)`,
  } as CSSProperties;
}

export function familyCssVars(id: FamilyId | string): CSSProperties {
  return accentCssVars(getFamilyTheme(id));
}

/**
 * The single-course-wide-accent option the multi-course design doc
 * explicitly allows as an alternative to DSA's per-module family system
 * (see docs/superpowers/specs/2026-08-31-multi-course-platform-design.md).
 * Reuses the same contrast math as `familyCssVars`, but the course authors
 * ONE accent hex for both themes — `getFamilyTheme` has no entry for it and
 * would silently fall back to DSA's linear traversal. The raw accent stays
 * as authored; only the chrome variant is pushed per theme.
 */
export function singleAccentCssVars(accent: string): CSSProperties {
  const light = inkFor(accent, "light");
  const dark = inkFor(accent, "dark");
  return accentCssVars({
    accent,
    accentUi: lightDark(light.accentUi, dark.accentUi),
    onAccent: lightDark(light.onAccent, dark.onAccent),
    onAccentUi: lightDark(light.onAccentUi, dark.onAccentUi),
  });
}
