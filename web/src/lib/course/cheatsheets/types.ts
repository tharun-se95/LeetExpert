export type CueTone =
  | "accent"
  | "good"
  | "warn"
  | "bad"
  | "muted"
  | "mark"
  | "insight";

export type CheatsheetTier = "gold" | "template";

export type DiagramId =
  | "array-cells"
  | "two-pointers"
  | "sliding-window"
  | "hash-buckets"
  | "stack-lifo"
  | "queue-fifo"
  | "linked-list"
  | "fast-slow-list"
  | "binary-search"
  | "prefix-bar"
  | "bfs-layers"
  | "dp-table"
  | "tree-levels"
  | "heap-pyramid"
  | "interval-sweep"
  | "matrix-grid"
  | "recursion-tree"
  | "sort-bars"
  | "trie-branches"
  | "greedy-choice"
  | "union-find";

export interface PatternCard {
  title: string;
  summary: string;
  tone: CueTone;
  /** Interview “smell” that points at this pattern. */
  smell?: string;
  diagram?: DiagramId;
}

export interface ComplexityRow {
  label: string;
  time: string;
  space: string;
  note?: string;
}

export interface SmellCue {
  smell: string;
  pattern: string;
}

export interface Trap {
  title: string;
  detail: string;
  tone: "warn" | "bad";
}

export interface ModuleCheatsheet {
  moduleSlug: string;
  tier: CheatsheetTier;
  tagline: string;
  patterns: PatternCard[];
  complexity: ComplexityRow[];
  smells: SmellCue[];
  traps: Trap[];
}

export const DIAGRAM_IDS: readonly DiagramId[] = [
  "array-cells",
  "two-pointers",
  "sliding-window",
  "hash-buckets",
  "stack-lifo",
  "queue-fifo",
  "linked-list",
  "fast-slow-list",
  "binary-search",
  "prefix-bar",
  "bfs-layers",
  "dp-table",
  "tree-levels",
  "heap-pyramid",
  "interval-sweep",
  "matrix-grid",
  "recursion-tree",
  "sort-bars",
  "trie-branches",
  "greedy-choice",
  "union-find",
] as const;
