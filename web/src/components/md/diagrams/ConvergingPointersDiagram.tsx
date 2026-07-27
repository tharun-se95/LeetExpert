"use client";

import {
  ArrayStrip,
  CELL_GAP,
  CELL_H,
  CELL_W,
  MARKER_BAND,
  stripWidth,
} from "@/components/md/diagrams/ArrayStrip";

/**
 * Reversal by converging pointers, one row per swap. The accent region grows
 * inward from BOTH ends — that region is the invariant ("everything outside
 * [left, right] is already final"), and the unfinished middle shrinks row to
 * row, the same bar-and-shrink language as the Euclid and log-halving
 * diagrams in the math module.
 */

interface ConvergingPointersDiagramProps {
  data?: (string | number)[];
}

interface Row {
  cells: (string | number)[];
  left: number;
  right: number;
  /** the pair swapped to PRODUCE the next row; null on the final row */
  swap: [number, number] | null;
}

const PAD_X = 14;
const TOP_PAD = 8;
const ROW_GAP = CELL_H + MARKER_BAND + 16;
const MAX_ROWS = 8;

function buildRows(data: (string | number)[]): Row[] {
  const rows: Row[] = [];
  const cells = [...data];
  let left = 0;
  let right = cells.length - 1;

  while (left < right && rows.length < MAX_ROWS - 1) {
    rows.push({ cells: [...cells], left, right, swap: [left, right] });
    [cells[left], cells[right]] = [cells[right], cells[left]];
    left++;
    right--;
  }
  // final state: nothing left to swap
  rows.push({ cells: [...cells], left, right, swap: null });
  return rows;
}

function centerX(index: number): number {
  return index * (CELL_W + CELL_GAP) + CELL_W / 2;
}

export function ConvergingPointersDiagram({
  data = [1, 2, 3, 4, 5, 6],
}: ConvergingPointersDiagramProps) {
  const cells = data.slice(0, 12);
  const n = cells.length;
  const rows = buildRows(cells);

  const width = stripWidth(n) + PAD_X * 2;
  // the final row carries no pointer markers, so it needs cells only
  const height = (rows.length - 1) * ROW_GAP + TOP_PAD + CELL_H + 6;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[340px]"
      role="img"
      aria-label={`Reversing an array of ${n} elements by swapping from both ends inward, taking ${rows.length - 1} swaps until the unfinished middle is empty`}
    >
      <defs>
        <marker
          id="converge-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth={4}
          markerHeight={4}
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 Z" fill="var(--muted)" />
        </marker>
      </defs>

      {rows.map((row, i) => {
        const y = TOP_PAD + i * ROW_GAP;
        const isFinal = row.swap === null;
        // outside [left, right] is settled; on the final row, everything is
        const regions = isFinal
          ? ([{ from: 0, to: n, tone: "done" as const }])
          : ([
              { from: 0, to: row.left, tone: "done" as const },
              { from: row.left, to: row.right + 1, tone: "open" as const },
              { from: row.right + 1, to: n, tone: "done" as const },
            ]);

        return (
          <g key={i}>
            <ArrayStrip
              x={PAD_X}
              y={y}
              size={n}
              values={row.cells}
              regions={regions}
              active={row.swap ?? []}
              markers={
                isFinal
                  ? []
                  : [
                      { at: row.left, label: "left" },
                      { at: row.right, label: "right" },
                    ]
              }
            />

            {/* swap arc joining the two ends being exchanged */}
            {row.swap ? (
              <path
                d={(() => {
                  const x1 = PAD_X + centerX(row.swap[0]);
                  const x2 = PAD_X + centerX(row.swap[1]);
                  const top = y - 2;
                  const lift = Math.min(14, 4 + (x2 - x1) / 12);
                  return `M ${x1} ${top} Q ${(x1 + x2) / 2} ${top - lift} ${x2} ${top}`;
                })()}
                fill="none"
                stroke="var(--muted)"
                strokeWidth={1.25}
                markerEnd="url(#converge-arrow)"
                markerStart="url(#converge-arrow)"
              />
            ) : (
              <text
                x={PAD_X + stripWidth(n) / 2}
                y={y - 6}
                fontSize={10}
                fontWeight={700}
                fill="var(--accent)"
                textAnchor="middle"
                fontFamily="var(--font-mono), monospace"
              >
                left ≥ right — reversed
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
