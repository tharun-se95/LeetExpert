import type { CSSProperties } from "react";
import type { FamilyId } from "@/lib/content/manifest";
import { FAMILIES } from "@/lib/content/manifest";

/**
 * SINGLE SOURCE for family colours. To recolor a family, edit the `accent`
 * hex in THEME_BY_ID below — every derived value (accentUi, hover, washes,
 * highlights, module cards, sidebar chips, chapter bars) updates from that
 * one change. onAccent stays authored: it is a semantic choice (white vs
 * dark ink on a solid fill), not something a luminance formula can decide.
 */
export type FamilyMotif =
  | "tiles"
  | "cursors"
  | "ruler"
  | "tree"
  | "switchboard"
  | "constellation"
  | "podium";

export interface FamilyTheme {
  id: FamilyId;
  accent: string;
  /**
   * The accent used for UI chrome (--accent / --pop / --highlight) when the
   * family becomes a page's primary. Derived from `accent` by uiAccent() —
   * the smallest darkening that clears the 3:1 non-text floor against BOTH
   * the light paper (#F1F4F9) and the dark paper (#121214). Most families
   * pass as-is; state-transition (gold) is darkened because pure gold is
   * only ~2.2:1 on light paper.
   */
  accentUi: string;
  motif: FamilyMotif;
  label: string;
  /**
   * Text color for content sitting on a *solid* accent fill (e.g. an
   * active viz cell). Computed via WCAG contrast, not assumed white —
   * white-on-#C9A227 (state-transition) is ~2.42:1 and white-on-#1F9D8A
   * (relationships) is a marginal ~3.36:1; both get a fixed dark ink
   * instead. The other five families clear >=4.28:1 with white.
   */
  onAccent: string;
}

const LIGHT_PAPER = "#F1F4F9";
const DARK_PAPER = "#121214";

function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function toLinear(channel: number): number {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const [r, g, b] = hexRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio (1–21). */
function contrastRatio(a: string, b: string): number {
  const [la, lb] = [luminance(a), luminance(b)];
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Linear RGB interpolation: t=0 → a, t=1 → b. */
function mixHex(a: string, b: string, t: number): string {
  const ca = hexRgb(a);
  const cb = hexRgb(b);
  return (
    "#" +
    ca
      .map((c, i) => Math.round(c + (cb[i] - c) * t).toString(16).padStart(2, "0"))
      .join("")
  );
}

/**
 * Darken an accent toward black until it clears 3:1 on light paper.
 * Darkening also *hurts* dark-paper contrast, so take the smallest
 * darkening that keeps BOTH floors — mid-brightness hues like gold stay
 * comfortably above the dark floor while their light-paper contrast climbs.
 */
export function uiAccent(accent: string): string {
  if (
    contrastRatio(accent, LIGHT_PAPER) >= 3 &&
    contrastRatio(accent, DARK_PAPER) >= 3
  ) {
    return accent;
  }
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const candidate = mixHex(accent, "#000000", mid);
    if (contrastRatio(candidate, LIGHT_PAPER) >= 3) hi = mid;
    else lo = mid;
  }
  const darkened = mixHex(accent, "#000000", hi);
  if (contrastRatio(darkened, DARK_PAPER) < 3) return accent;
  return darkened;
}

const THEME_BY_ID: Record<FamilyId, Omit<FamilyTheme, "label" | "accentUi">> = {
  "linear-traversal": {
    id: "linear-traversal",
    accent: "#0A7A6A",
    motif: "tiles",
    onAccent: "#ffffff", // 5.24:1
  },
  "pointer-movement": {
    id: "pointer-movement",
    accent: "#C45C26",
    motif: "cursors",
    onAccent: "#ffffff", // 4.28:1
  },
  "ordering-search": {
    id: "ordering-search",
    accent: "#2F6FED",
    motif: "ruler",
    onAccent: "#ffffff", // 4.55:1
  },
  "recursive-exploration": {
    id: "recursive-exploration",
    accent: "#6B4CE6",
    motif: "tree",
    onAccent: "#ffffff", // 5.52:1
  },
  "state-transition": {
    id: "state-transition",
    accent: "#C9A227",
    motif: "switchboard",
    onAccent: "#111827", // white fails at 2.42:1; dark ink is 7.33:1
  },
  relationships: {
    id: "relationships",
    accent: "#1F9D8A",
    motif: "constellation",
    onAccent: "#111827", // white is a marginal 3.36:1; dark ink is 5.28:1
  },
  "priority-structures": {
    id: "priority-structures",
    accent: "#E11D48",
    motif: "podium",
    onAccent: "#ffffff", // 4.70:1
  },
};

function labelFor(id: FamilyId): string {
  return FAMILIES.find((f) => f.id === id)?.shortTitle ?? id;
}

export const FAMILY_THEMES: FamilyTheme[] = (
  Object.keys(THEME_BY_ID) as FamilyId[]
).map((id) => ({
  ...THEME_BY_ID[id],
  accentUi: uiAccent(THEME_BY_ID[id].accent),
  label: labelFor(id),
}));

export function getFamilyTheme(id: FamilyId | string): FamilyTheme {
  const theme = THEME_BY_ID[id as FamilyId];
  if (!theme) {
    return {
      id: "linear-traversal",
      accent: "#0A7A6A",
      accentUi: "#0A7A6A",
      motif: "tiles",
      onAccent: "#ffffff",
      label: "Linear",
    };
  }
  return {
    ...theme,
    accentUi: uiAccent(theme.accent),
    label: labelFor(theme.id),
  };
}

export function familyCssVars(id: FamilyId | string): CSSProperties {
  const theme = getFamilyTheme(id);
  return {
    "--family-accent": theme.accent,
    "--family-on-accent": theme.onAccent,
    "--family-wash": `color-mix(in oklab, ${theme.accent} 12%, transparent)`,
    // The family becomes the page's primary inside this scope. accentUi is
    // the 3:1-on-both-papers-safe variant (gold is darkened); on-pop is the
    // family's own onAccent so `bg-pop text-on-pop` stays AA. --mark is
    // deliberately NOT remapped — it stays the steel body ink everywhere.
    "--accent": theme.accentUi,
    "--accent-hover": `color-mix(in oklab, ${theme.accentUi} 85%, white)`,
    "--accent-active": theme.accentUi,
    "--pop": theme.accentUi,
    "--on-pop": theme.onAccent,
    "--highlight": `color-mix(in oklab, ${theme.accentUi} 14%, transparent)`,
  } as CSSProperties;
}
