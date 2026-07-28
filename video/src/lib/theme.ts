/**
 * Cinematic motion-graphics palette for the Part 1 videos: warm near-black,
 * warm off-white, one confident amber→coral gradient accent used for every
 * glow/highlight.
 *
 * Video palettes are intentionally separate from the web app's Riso system
 * (web/src/app/globals.css). Motion graphics may use glow, gradient, and
 * multi-hue treatments that the course UI deliberately forbids. Do not
 * import Riso tokens here, and do not import these colours into web/.
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

/**
 * Neon Depth palette — dark neon-glow with real dimensional (Three.js)
 * depth. Multi-color on purpose, unlike BRUTAL's one-accent rule: each
 * *structure type* draws from one dominant hue (stacks = purple, trees/
 * graphs = cyan) rather than mixing every accent into one scene. Orange/
 * green/pink are reserved for cross-cutting meaning (current index,
 * complexity tiers) that repeats across every video.
 * See docs/superpowers/specs/2026-07-19-neon-depth-visual-system-design.md
 */
export const NEON = {
  bg: "#070a10",
  cyan: "#00e6ff",
  purple: "#7c4dff",
  orange: "#ffbb00",
  green: "#00f0a1",
  pink: "#ff4d6d",
  textMuted: "#c7d2e0",
  textBright: "#eafcff",
  structureMuted: "#22304a",
  structureMutedAlt: "#2c3c56",
  emissiveMuted: "#26344e",
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
