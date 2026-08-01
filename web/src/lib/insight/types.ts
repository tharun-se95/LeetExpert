import type { CueTone } from "@/lib/course/cheatsheets/types";

/** Complexity target shown as chips — from lesson fence or cheatsheet. */
export interface InsightComplexity {
  time: string;
  space: string;
  why?: string;
  /** Where the numbers came from — shown as a source badge. */
  source: "lesson" | "module";
}

export interface InsightChecklistItem {
  label: string;
  tone?: CueTone;
}

export type MemoryMarkerKind = "left" | "right" | "window-lo" | "window-hi" | "write" | "read";

export interface MemoryMarker {
  /** Cell index; for end-of-strip, use length - 1 */
  index: number | "start" | "end";
  label: string;
  kind?: MemoryMarkerKind;
}

export type MemoryKind =
  | "string"
  | "array"
  | "matrix"
  | "tree"
  | "list"
  | "graph"
  | "sequence"
  | "scalar"
  | "opaque";

export interface MemoryModel {
  kind: MemoryKind;
  /** Display cells (already truncated). */
  cells: string[];
  /** True when original input was longer than the display cap. */
  truncated: boolean;
  /** Total length before truncation (for aria). */
  totalLength: number;
  markers: MemoryMarker[];
  /** Short fallback when cells cannot be drawn. */
  label?: string;
}

export interface InsightVariable {
  name: string;
  value: string;
  /** "From selected case" vs "After run" */
  provenance: "case" | "run";
}

export interface ResolvedInsight {
  complexity: InsightComplexity | null;
  /** Pattern / invariant cues — never solution code. */
  checklist: InsightChecklistItem[];
  memory: MemoryModel | null;
  variables: InsightVariable[];
}
