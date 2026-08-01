import type { ArgShape, SandboxCase, SandboxSpec } from "@/components/sandbox/types";
import { pretty } from "@/lib/sandbox/compare";
import type { MemoryMarker, MemoryModel } from "@/lib/insight/types";

/** Soft cap so the strip stays readable in the IDE middle band. */
export const MEMORY_CELL_CAP = 24;

function cellLabel(value: unknown): string {
  if (typeof value === "string") {
    if (value.length === 0) return "ε";
    if (value.length === 1) return value;
    return value.length > 4 ? `${value.slice(0, 3)}…` : value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value === null) return "null";
  return "·";
}

function truncateCells(
  cells: string[],
): { cells: string[]; truncated: boolean; totalLength: number } {
  const totalLength = cells.length;
  if (cells.length <= MEMORY_CELL_CAP) {
    return { cells, truncated: false, totalLength };
  }
  const head = Math.ceil(MEMORY_CELL_CAP / 2) - 1;
  const tail = MEMORY_CELL_CAP - head - 1;
  return {
    cells: [...cells.slice(0, head), "…", ...cells.slice(cells.length - tail)],
    truncated: true,
    totalLength,
  };
}

function shapeOf(spec: SandboxSpec, argIndex: number): ArgShape | undefined {
  return spec.shape[String(argIndex)];
}

function isLinkedListPayload(value: unknown): value is {
  values: unknown[];
  pos: number;
} {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Array.isArray((value as { values?: unknown }).values) &&
    typeof (value as { pos?: unknown }).pos === "number"
  );
}

/**
 * Build a schematic memory model from the selected case.
 * Structural inputs (tree/graph) get a typed label, not fake cells.
 */
export function parseCaseMemory(
  testCase: SandboxCase,
  spec: SandboxSpec,
  markers: MemoryMarker[] = [],
): MemoryModel | null {
  if (spec.check === "sequence") {
    return {
      kind: "sequence",
      cells: [],
      truncated: false,
      totalLength: 0,
      markers: [],
      label: testCase.ops
        ? `Class · ${testCase.ops.length} ops`
        : "Class · sequence",
    };
  }

  const args = testCase.args ?? [];
  if (args.length === 0) {
    return {
      kind: "opaque",
      cells: [],
      truncated: false,
      totalLength: 0,
      markers: [],
      label: "No input args",
    };
  }

  const primary = args[0];
  const shape = shapeOf(spec, 0);

  if (shape === "tree" || shape === "node") {
    return {
      kind: "tree",
      cells: [],
      truncated: false,
      totalLength: 0,
      markers: [],
      label: `Tree · ${pretty(primary, 48)}`,
    };
  }
  if (shape === "graph") {
    return {
      kind: "graph",
      cells: [],
      truncated: false,
      totalLength: 0,
      markers: [],
      label: "Graph · adjacency",
    };
  }
  if (shape === "list" || shape === "list[]" || isLinkedListPayload(primary)) {
    const values = isLinkedListPayload(primary)
      ? primary.values
      : Array.isArray(primary)
        ? primary
        : null;
    if (!values) {
      return {
        kind: "list",
        cells: [],
        truncated: false,
        totalLength: 0,
        markers: [],
        label: "Linked list",
      };
    }
    const { cells, truncated, totalLength } = truncateCells(
      values.map(cellLabel),
    );
    return {
      kind: "list",
      cells,
      truncated,
      totalLength,
      markers: resolveMarkers(markers, totalLength),
      label: truncated ? `List · ${totalLength} nodes` : undefined,
    };
  }

  if (typeof primary === "string") {
    const chars = [...primary];
    const { cells, truncated, totalLength } = truncateCells(
      chars.map((c) => (c === " " ? "␠" : c)),
    );
    return {
      kind: "string",
      cells,
      truncated,
      totalLength,
      markers: resolveMarkers(markers, totalLength),
      label: truncated ? `String · ${totalLength} chars` : undefined,
    };
  }

  if (Array.isArray(primary)) {
    if (
      primary.length > 0 &&
      primary.every((row) => Array.isArray(row))
    ) {
      const flat = (primary as unknown[][]).flat();
      const { cells, truncated, totalLength } = truncateCells(
        flat.map(cellLabel),
      );
      return {
        kind: "matrix",
        cells,
        truncated,
        totalLength,
        markers: [],
        label: `Matrix · ${primary.length}×${(primary[0] as unknown[]).length}`,
      };
    }
    const { cells, truncated, totalLength } = truncateCells(
      primary.map(cellLabel),
    );
    return {
      kind: "array",
      cells,
      truncated,
      totalLength,
      markers: resolveMarkers(markers, totalLength),
      label: truncated ? `Array · ${totalLength}` : undefined,
    };
  }

  if (
    typeof primary === "number" ||
    typeof primary === "boolean" ||
    primary === null
  ) {
    return {
      kind: "scalar",
      cells: [cellLabel(primary)],
      truncated: false,
      totalLength: 1,
      markers: [],
    };
  }

  return {
    kind: "opaque",
    cells: [],
    truncated: false,
    totalLength: 0,
    markers: [],
    label: pretty(primary, 64),
  };
}

function resolveMarkers(
  markers: MemoryMarker[],
  length: number,
): MemoryMarker[] {
  if (length <= 0) return [];
  return markers
    .map((m) => {
      let index: number;
      if (m.index === "start") index = 0;
      else if (m.index === "end") index = Math.max(0, length - 1);
      else index = m.index;
      if (index < 0 || index >= length) return null;
      // Truncation collapses middle indices — only keep start/end-ish markers
      // that still land on a displayed cell when we remap by absolute index.
      return { ...m, index };
    })
    .filter((m): m is MemoryMarker & { index: number } => m !== null)
    .map((m) => ({ ...m, index: m.index }));
}

/**
 * Remap absolute markers onto a possibly truncated cell row.
 * Truncated rows insert "…" at the middle — markers that fall in the
 * omitted range are dropped; start/end markers stay at the visible ends.
 */
export function mapMarkersToDisplay(
  memory: MemoryModel,
): { cellIndex: number; label: string; kind?: MemoryMarker["kind"] }[] {
  if (memory.cells.length === 0 || memory.markers.length === 0) return [];
  if (!memory.truncated) {
    return memory.markers
      .filter((m): m is MemoryMarker & { index: number } => typeof m.index === "number")
      .map((m) => ({ cellIndex: m.index, label: m.label, kind: m.kind }));
  }

  const ellipsisAt = memory.cells.indexOf("…");
  const headCount = ellipsisAt >= 0 ? ellipsisAt : memory.cells.length;
  const tailCount =
    ellipsisAt >= 0 ? memory.cells.length - ellipsisAt - 1 : 0;
  const tailStart = memory.totalLength - tailCount;

  const out: { cellIndex: number; label: string; kind?: MemoryMarker["kind"] }[] =
    [];
  for (const m of memory.markers) {
    const abs =
      m.index === "start"
        ? 0
        : m.index === "end"
          ? memory.totalLength - 1
          : m.index;
    if (typeof abs !== "number" || abs < 0 || abs >= memory.totalLength) {
      continue;
    }
    if (abs < headCount) {
      out.push({ cellIndex: abs, label: m.label, kind: m.kind });
    } else if (abs >= tailStart) {
      out.push({
        cellIndex: ellipsisAt + 1 + (abs - tailStart),
        label: m.label,
        kind: m.kind,
      });
    }
  }
  return out;
}
