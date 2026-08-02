"use client";

import {
  ArrayStrip,
  CELL_H,
  stripWidth,
} from "@/components/md/diagrams/ArrayStrip";

/**
 * The three-step invariant proof as three snapshots of the SAME array:
 * initialization (settled region empty), maintenance (partway), termination
 * (nothing left untouched). The invariant never changes — only how much of
 * the array satisfies each part of it.
 */

interface Phase {
  name: string;
  note: string;
  first: number;
  second: number;
}

interface InvariantPhasesDiagramProps {
  size?: number;
  midFirst?: number;
  midSecond?: number;
  endFirst?: number;
}

const PAD_X = 14;
const LABEL_W = 96;
const TOP_PAD = 10;
/** no brackets and no markers on these rows — cells plus breathing room only */
const ROW_GAP = CELL_H + 24;

export function InvariantPhasesDiagram({
  size = 8,
  midFirst = 3,
  midSecond = 5,
  endFirst = 5,
}: InvariantPhasesDiagramProps) {
  const n = Math.max(2, Math.min(16, Math.round(size)));
  const mf = Math.max(0, Math.min(n, Math.round(midFirst)));
  const ms = Math.max(mf, Math.min(n, Math.round(midSecond)));
  const ef = Math.max(0, Math.min(n, Math.round(endFirst)));

  const phases: Phase[] = [
    { name: "Initialization", note: "region empty", first: 0, second: 0 },
    { name: "Maintenance", note: "one more settled", first: mf, second: ms },
    { name: "Termination", note: "nothing untouched", first: ef, second: n },
  ];

  const width = LABEL_W + stripWidth(n) + PAD_X * 2;
  const height = (phases.length - 1) * ROW_GAP + CELL_H + TOP_PAD * 2;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[520px]"
      role="img"
      aria-label={`The same array at three points: initialization with an empty settled region, maintenance partway through, and termination where every element has been classified`}
    >
      {phases.map((phase, i) => {
        const rowY = i * ROW_GAP + TOP_PAD;
        const isLast = i === phases.length - 1;
        return (
          <g key={phase.name}>
            <text
              x={PAD_X}
              y={rowY + CELL_H / 2 - 6}
              fontSize={11}
              fontWeight={700}
              fill={isLast ? "var(--family-accent, var(--accent))" : "var(--foreground)"}
              dominantBaseline="central"
              fontFamily="var(--font-mono), monospace"
            >
              {phase.name}
            </text>
            <text
              x={PAD_X}
              y={rowY + CELL_H / 2 + 8}
              fontSize={8.5}
              fill="var(--muted)"
              dominantBaseline="central"
            >
              {phase.note}
            </text>
            <ArrayStrip
              x={LABEL_W + PAD_X}
              y={rowY}
              size={n}
              regions={[
                { from: 0, to: phase.first, tone: "done" },
                { from: phase.first, to: phase.second, tone: "dead" },
                { from: phase.second, to: n, tone: "open" },
              ]}
            />
          </g>
        );
      })}
    </svg>
  );
}
