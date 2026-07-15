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
}

const THEME_BY_ID: Record<FamilyId, Omit<FamilyTheme, "label">> = {
  "linear-traversal": {
    id: "linear-traversal",
    accent: "#0A7A6A",
    accentSoft: "#0A7A6A",
    motif: "tiles",
  },
  "pointer-movement": {
    id: "pointer-movement",
    accent: "#C45C26",
    accentSoft: "#C45C26",
    motif: "cursors",
  },
  "ordering-search": {
    id: "ordering-search",
    accent: "#2F6FED",
    accentSoft: "#2F6FED",
    motif: "ruler",
  },
  "recursive-exploration": {
    id: "recursive-exploration",
    accent: "#6B4CE6",
    accentSoft: "#6B4CE6",
    motif: "tree",
  },
  "state-transition": {
    id: "state-transition",
    accent: "#C9A227",
    accentSoft: "#C9A227",
    motif: "switchboard",
  },
  relationships: {
    id: "relationships",
    accent: "#1F9D8A",
    accentSoft: "#1F9D8A",
    motif: "constellation",
  },
  "priority-structures": {
    id: "priority-structures",
    accent: "#E11D48",
    accentSoft: "#E11D48",
    motif: "podium",
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
    "--family-wash": `color-mix(in oklab, ${theme.accent} 12%, transparent)`,
  } as CSSProperties;
}
