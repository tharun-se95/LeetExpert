/**
 * Cinematic motion-graphics palette for the Part 1 videos: warm near-black,
 * warm off-white, one confident amber→coral gradient accent used for every
 * glow/highlight. Distinct from the web app's flat blue theme on purpose —
 * this is a premium video treatment, not a screenshot of the site.
 */
export const COLORS = {
  bg: "#0b0a08",
  fg: "#f5efe6",
  muted: "#9c948a",
  border: "#2a2620",
  surface: "#141210",
  accent: "#ff8a3d",
  accent2: "#ff3d68",
  danger: "#ff5c5c",
  good: "#4ade80",
} as const;

/** The signature gradient — use for glows, progress fills, and emphasis text. */
export const ACCENT_GRADIENT = `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent2})`;

/**
 * Brutalist/papercut palette for the Family 7 video — raw paper, hard black
 * ink, one loud acid-yellow accent. Deliberately its own system, not a
 * variant of COLORS above: no gradients, no glass, no soft shadows.
 */
export const BRUTAL = {
  paper: "#f2ede2",
  paperDark: "#e6dfcf",
  ink: "#141210",
  accent: "#eeff3d",
  accent2: "#ff4d2e",
  muted: "#5b564a",
} as const;

/** Family accent colors, mirrored from web/src/lib/visual/familyTheme.ts */
export const FAMILY_ACCENTS: { id: string; label: string; accent: string }[] = [
  { id: "linear-traversal", label: "Linear Traversal", accent: "#0A7A6A" },
  { id: "pointer-movement", label: "Pointer Movement", accent: "#C45C26" },
  { id: "ordering-search", label: "Ordering & Search", accent: "#2F6FED" },
  { id: "recursive-exploration", label: "Recursive Exploration", accent: "#6B4CE6" },
  { id: "state-transition", label: "State Transition", accent: "#C9A227" },
  { id: "relationships", label: "Relationships", accent: "#1F9D8A" },
  { id: "priority-structures", label: "Priority Structures", accent: "#E11D48" },
];
