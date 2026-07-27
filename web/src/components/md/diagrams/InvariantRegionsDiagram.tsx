"use client";

import {
  ArrayStrip,
  BRACKET_BAND,
  CELL_H,
  MARKER_BAND,
  stripWidth,
} from "@/components/md/diagrams/ArrayStrip";

/**
 * A loop invariant, drawn: the array is partitioned into regions that each
 * MEAN something, and the pointers are the boundaries between them.
 *
 * Labels are props and default to abstract wording, because this sits in
 * the concept section — before read/write pointers are introduced.
 */

interface InvariantRegionsDiagramProps {
  size?: number;
  /** boundary of the settled prefix */
  first?: number;
  /** boundary between processed-and-discarded and untouched */
  second?: number;
  doneLabel?: string;
  deadLabel?: string;
  openLabel?: string;
  firstMarker?: string;
  secondMarker?: string;
}

const PAD_X = 14;

export function InvariantRegionsDiagram({
  size = 8,
  first = 3,
  second = 5,
  doneLabel = "settled",
  deadLabel = "seen, discarded",
  openLabel = "untouched",
  firstMarker = "boundary",
  secondMarker = "cursor",
}: InvariantRegionsDiagramProps) {
  const n = Math.max(2, Math.min(16, Math.round(size)));
  const a = Math.max(0, Math.min(n, Math.round(first)));
  const b = Math.max(a, Math.min(n, Math.round(second)));

  const width = stripWidth(n) + PAD_X * 2;
  const height = BRACKET_BAND + CELL_H + MARKER_BAND;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[460px]"
      role="img"
      aria-label={`An array of ${n} cells split into three regions: ${doneLabel} in the first ${a} cells, ${deadLabel} in the next ${b - a}, and ${openLabel} in the remaining ${n - b}`}
    >
      <ArrayStrip
        x={PAD_X}
        y={BRACKET_BAND}
        size={n}
        regions={[
          { from: 0, to: a, tone: "done", label: doneLabel },
          { from: a, to: b, tone: "dead", label: deadLabel },
          { from: b, to: n, tone: "open", label: openLabel },
        ]}
        markers={[
          { at: a, label: firstMarker },
          { at: b, label: secondMarker },
        ]}
      />
    </svg>
  );
}
