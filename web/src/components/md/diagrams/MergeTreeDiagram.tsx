"use client";

/**
 * Merge-sort divide tree: array ranges splitting down to singles.
 */

export interface MergeLevel {
  /** ranges at this level, each as a label string */
  ranges: string[];
}

interface MergeTreeDiagramProps {
  levels?: MergeLevel[];
  caption?: string;
}

const DEFAULT_LEVELS: MergeLevel[] = [
  { ranges: ["[3,1,4,1,5,9,2,6]"] },
  { ranges: ["[3,1,4,1]", "[5,9,2,6]"] },
  { ranges: ["[3,1]", "[4,1]", "[5,9]", "[2,6]"] },
  { ranges: ["[3]", "[1]", "[4]", "[1]", "[5]", "[9]", "[2]", "[6]"] },
];

export function MergeTreeDiagram({
  levels = DEFAULT_LEVELS,
  caption = "log n levels · O(n) work per level → O(n log n)",
}: MergeTreeDiagramProps) {
  const PAD = 12;
  const ROW_H = 34;
  const width = 480;
  const height = PAD * 2 + levels.length * ROW_H + 24;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[520px]"
      role="img"
      aria-label={`Merge sort divide tree with ${levels.length} levels`}
    >
      {levels.map((level, li) => {
        const y = PAD + li * ROW_H;
        const count = level.ranges.length;
        const gap = 6;
        const totalGap = (count - 1) * gap;
        const boxW = Math.min(200, (width - PAD * 2 - totalGap) / count);
        const rowW = count * boxW + totalGap;
        const startX = (width - rowW) / 2;
        return (
          <g key={li}>
            {level.ranges.map((label, ri) => {
              const x = startX + ri * (boxW + gap);
              const isLeaf = li === levels.length - 1;
              return (
                <g key={ri}>
                  <rect
                    x={x}
                    y={y}
                    width={boxW}
                    height={ROW_H - 8}
                    rx={4}
                    fill={
                      isLeaf
                        ? "var(--family-accent, var(--accent))"
                        : "var(--surface)"
                    }
                    fillOpacity={isLeaf ? 0.15 : 1}
                    stroke="var(--family-accent, var(--accent))"
                    strokeWidth={1.25}
                  />
                  <text
                    x={x + boxW / 2}
                    y={y + (ROW_H - 8) / 2 + 4}
                    fontSize={count > 4 ? 9 : 11}
                    fill="var(--foreground)"
                    textAnchor="middle"
                    fontFamily="var(--font-mono), monospace"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
      <text
        x={width / 2}
        y={height - 6}
        fontSize={11}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        {caption}
      </text>
    </svg>
  );
}
