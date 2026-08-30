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
   * the smallest push (toward black OR white, whichever direction the
   * failing side needs) that clears the 3:1 non-text floor against every
   * surface the chrome can render on — --background, --elevated, --code,
   * --surface — in BOTH themes. Most families pass as-is.
   */
  accentUi: string;
  motif: FamilyMotif;
  label: string;
  /**
   * Text colour for content sitting on a *solid raw accent* fill (e.g. an
   * active viz cell, --family-accent). Computed via WCAG contrast, not
   * assumed white — white-on-#C9A227 (state-transition) is ~2.42:1 and
   * white-on-#1F9D8A (relationships) is a marginal ~3.36:1; both get a
   * fixed dark ink instead. The other five families clear >=4.28:1 with
   * white.
   */
  onAccent: string;
  /**
   * Text colour for content on a solid *accentUi* fill (--pop/--on-pop —
   * e.g. the coach masthead mark). A DIFFERENT pairing from onAccent on
   * purpose: accentUi and the raw accent are different colours once
   * uiAccent() has pushed one of them, so the ink that reads well on one
   * does not necessarily read well on the other. Concretely,
   * state-transition and relationships need dark ink on their bright raw
   * accent but white on their (darkened) accentUi — forcing one ink to
   * serve both fills is what silently shipped ~4.34:1 dark-on-dark here
   * against the 4.5:1 floor. Computed by pickInk(), not authored.
   */
  onAccentUi: string;
}

// Every surface the UI accent can actually render on in each theme —
// --pop/--accent paint chrome across the sidebar (elevated), editor (code),
// tests rail (surface) and the page itself (background), not just the page.
const LIGHT_SURFACES = ["#F1F4F9", "#ffffff", "#e4e9f2", "#d8dde8"];
const DARK_SURFACES = ["#121214", "#26262a", "#19191d", "#0c0c0d"];
const DARK_INK = "#111827";

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

function clearsAll(hex: string, surfaces: string[], floor = 3): boolean {
  return surfaces.every((s) => contrastRatio(hex, s) >= floor);
}

/**
 * Push `hex` toward `target` (mix ratio 0→1) until `clears` is satisfied,
 * taking the SMALLEST push that does — mirrors the old single-surface
 * binary search, just against an arbitrary predicate. Returns the original
 * colour unchanged if even a full push to `target` cannot satisfy it,
 * rather than shipping the extreme (pure black/white) silently.
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
 * The smallest push — toward black OR white, whichever the FAILING side
 * needs — that clears the 3:1 non-text floor against every surface in both
 * themes. Light surfaces are all brighter than any reasonably-saturated
 * accent, so darkening only ever helps light-mode contrast and only ever
 * hurts dark-mode contrast (and vice versa for lightening) — the two floors
 * pull in opposite directions along the SAME axis, so a family can need
 * either move, never both. If a family somehow failed both sides at once,
 * a single hue-preserving push cannot fix it; this returns the accent
 * unchanged so the token test fails loudly rather than shipping a silent
 * gap that needs an authored exception.
 */
export function uiAccent(accent: string): string {
  const clearsLight = (hex: string) => clearsAll(hex, LIGHT_SURFACES);
  const clearsDark = (hex: string) => clearsAll(hex, DARK_SURFACES);
  if (clearsLight(accent) && clearsDark(accent)) return accent;

  const lightOk = clearsLight(accent);
  const darkOk = clearsDark(accent);

  if (!lightOk && darkOk) {
    const darkened = pushToward(accent, "#000000", clearsLight);
    return clearsDark(darkened) ? darkened : accent;
  }
  if (lightOk && !darkOk) {
    const lightened = pushToward(accent, "#ffffff", clearsDark);
    return clearsLight(lightened) ? lightened : accent;
  }
  return accent;
}

/**
 * Best ink for text on a solid `fill`, computed rather than assumed. Prefers
 * white (the convention for nearly every accent in this palette); falls
 * back to a fixed dark steel ink only when white can't clear even the
 * large-text 3:1 floor. If genuinely neither clears its own floor, returns
 * whichever is relatively better so the caller's own AA test fails loudly
 * rather than this function silently picking a value that still fails.
 */
function pickInk(fill: string): string {
  const white = contrastRatio("#ffffff", fill);
  const dark = contrastRatio(DARK_INK, fill);
  if (white >= 3) return "#ffffff";
  if (dark >= 4.5) return DARK_INK;
  return white >= dark ? "#ffffff" : DARK_INK;
}

const THEME_BY_ID: Record<
  FamilyId,
  Omit<FamilyTheme, "label" | "accentUi" | "onAccentUi">
> = {
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
).map((id) => {
  const accentUi = uiAccent(THEME_BY_ID[id].accent);
  return {
    ...THEME_BY_ID[id],
    accentUi,
    onAccentUi: pickInk(accentUi),
    label: labelFor(id),
  };
});

export function getFamilyTheme(id: FamilyId | string): FamilyTheme {
  const theme = THEME_BY_ID[id as FamilyId];
  if (!theme) {
    return {
      id: "linear-traversal",
      accent: "#0A7A6A",
      accentUi: "#0A7A6A",
      motif: "tiles",
      onAccent: "#ffffff",
      onAccentUi: "#ffffff",
      label: "Linear",
    };
  }
  const accentUi = uiAccent(theme.accent);
  return {
    ...theme,
    accentUi,
    onAccentUi: pickInk(accentUi),
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
    // the 3:1-on-every-surface-safe variant; on-pop is onAccentUi (paired
    // with accentUi specifically, NOT onAccent — see the FamilyTheme
    // comment for why the two fills need different ink). --mark is
    // deliberately NOT remapped — it stays the steel body ink everywhere.
    "--accent": theme.accentUi,
    "--accent-hover": `color-mix(in oklab, ${theme.accentUi} 85%, white)`,
    "--accent-active": theme.accentUi,
    "--pop": theme.accentUi,
    "--on-pop": theme.onAccentUi,
    "--highlight": `color-mix(in oklab, ${theme.accentUi} 14%, transparent)`,
  } as CSSProperties;
}
