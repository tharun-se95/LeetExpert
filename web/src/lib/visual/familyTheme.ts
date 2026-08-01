import type { CSSProperties } from "react";
import type { FamilyId } from "@/lib/content/manifest";
import { FAMILIES } from "@/lib/content/manifest";

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
  accentSoft: string;
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

const THEME_BY_ID: Record<FamilyId, Omit<FamilyTheme, "label">> = {
  "linear-traversal": {
    id: "linear-traversal",
    accent: "#0A7A6A",
    accentSoft: "#0A7A6A",
    motif: "tiles",
    onAccent: "#ffffff", // 5.24:1
  },
  "pointer-movement": {
    id: "pointer-movement",
    accent: "#C45C26",
    accentSoft: "#C45C26",
    motif: "cursors",
    onAccent: "#ffffff", // 4.28:1
  },
  "ordering-search": {
    id: "ordering-search",
    accent: "#2F6FED",
    accentSoft: "#2F6FED",
    motif: "ruler",
    onAccent: "#ffffff", // 4.55:1
  },
  "recursive-exploration": {
    id: "recursive-exploration",
    accent: "#6B4CE6",
    accentSoft: "#6B4CE6",
    motif: "tree",
    onAccent: "#ffffff", // 5.52:1
  },
  "state-transition": {
    id: "state-transition",
    accent: "#C9A227",
    accentSoft: "#C9A227",
    motif: "switchboard",
    onAccent: "#111827", // white fails at 2.42:1; dark ink is 7.33:1
  },
  relationships: {
    id: "relationships",
    accent: "#1F9D8A",
    accentSoft: "#1F9D8A",
    motif: "constellation",
    onAccent: "#111827", // white is a marginal 3.36:1; dark ink is 5.28:1
  },
  "priority-structures": {
    id: "priority-structures",
    accent: "#E11D48",
    accentSoft: "#E11D48",
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
  label: labelFor(id),
}));

export function getFamilyTheme(id: FamilyId | string): FamilyTheme {
  const theme = THEME_BY_ID[id as FamilyId];
  if (!theme) {
    return {
      id: "linear-traversal",
      accent: "#0A7A6A",
      accentSoft: "#0A7A6A",
      motif: "tiles",
      onAccent: "#ffffff",
      label: "Linear",
    };
  }
  return { ...theme, label: labelFor(theme.id) };
}

export function familyCssVars(id: FamilyId | string): CSSProperties {
  const theme = getFamilyTheme(id);
  return {
    "--family-accent": theme.accent,
    "--family-accent-soft": theme.accentSoft,
    "--family-on-accent": theme.onAccent,
    "--family-wash": `color-mix(in oklab, ${theme.accent} 12%, transparent)`,
  } as CSSProperties;
}
