"use client";

import {
  ArrayStrip,
  BRACKET_BAND,
  CELL_H,
  MARKER_BAND,
  stripWidth,
} from "@/components/md/diagrams/ArrayStrip";

/**
 * Binary-search range: eliminated sides + live [lo, hi] with mid marked.
 */

interface SearchRangeDiagramProps {
  values?: (string | number)[];
  lo?: number;
  hi?: number;
  mid?: number;
  target?: string | number;
}

const PAD_X = 14;

export function SearchRangeDiagram({
  values = [1, 3, 5, 7, 9, 11, 13, 15],
  lo = 0,
  hi = 7,
  mid = 3,
  target = 7,
}: SearchRangeDiagramProps) {
  const vals = values.length > 0 ? values : [1, 3, 5, 7, 9, 11, 13, 15];
  const n = vals.length;
  const a = Math.max(0, Math.min(lo, n - 1));
  const b = Math.max(a, Math.min(hi, n - 1));
  const m = Math.max(a, Math.min(mid, b));

  const width = stripWidth(n) + PAD_X * 2;
  const height = BRACKET_BAND + CELL_H + MARKER_BAND + 22;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[480px]"
      role="img"
      aria-label={`Binary search range [${a}, ${b}] with mid ${m}; target ${target}`}
    >
      <ArrayStrip
        x={PAD_X}
        y={BRACKET_BAND}
        size={n}
        values={vals}
        regions={[
          { from: 0, to: a, tone: "dead", label: "eliminated" },
          { from: a, to: b + 1, tone: "done", label: "[lo, hi]" },
          { from: b + 1, to: n, tone: "dead", label: "eliminated" },
        ]}
        markers={[
          { at: a, label: "lo" },
          { at: m, label: "mid" },
          { at: b, label: "hi" },
        ]}
        active={[m]}
      />
      <text
        x={width / 2}
        y={height - 4}
        fontSize={11}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-mono), monospace"
      >
        target = {String(target)} · answer ∈ [lo, hi]
      </text>
    </svg>
  );
}
