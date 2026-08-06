"use client";

/**
 * Sorting invariant: a sorted prefix growing left→right, with the
 * active compare/insert region marked. Static snapshot for baseline sorts.
 */

interface SortedPrefixDiagramProps {
  values?: number[];
  /** Length of the already-sorted prefix. */
  sortedCount?: number;
  /** Index currently being considered. */
  activeIndex?: number;
  caption?: string;
}

const CELL = 40;
const GAP = 4;
const PAD = 16;

export function SortedPrefixDiagram({
  values = [3, 1, 4, 1, 5, 9, 2],
  sortedCount = 3,
  activeIndex = 3,
  caption = "sorted prefix · unsorted suffix",
}: SortedPrefixDiagramProps) {
  const vals = values.length > 0 ? values : [3, 1, 4, 1, 5, 9, 2];
  const n = vals.length;
  const sorted = Math.max(0, Math.min(sortedCount, n));
  const active = Math.max(0, Math.min(activeIndex, n - 1));
  const width = PAD * 2 + n * (CELL + GAP) - GAP;
  const height = 100;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[480px]"
      role="img"
      aria-label={`Array with first ${sorted} elements sorted; index ${active} is active`}
    >
      {vals.map((v, i) => {
        const x = PAD + i * (CELL + GAP);
        const inSorted = i < sorted;
        const isActive = i === active;
        return (
          <g key={i}>
            <rect
              x={x}
              y={24}
              width={CELL}
              height={CELL}
              rx={5}
              fill={
                isActive
                  ? "var(--family-accent, var(--accent))"
                  : inSorted
                    ? "var(--family-accent, var(--accent))"
                    : "var(--surface)"
              }
              fillOpacity={isActive ? 0.28 : inSorted ? 0.12 : 1}
              stroke="var(--family-accent, var(--accent))"
              strokeWidth={isActive ? 2 : 1.25}
              strokeOpacity={inSorted || isActive ? 1 : 0.45}
            />
            <text
              x={x + CELL / 2}
              y={24 + CELL / 2 + 4}
              fontSize={13}
              fontWeight={600}
              fill="var(--foreground)"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {v}
            </text>
            <text
              x={x + CELL / 2}
              y={24 + CELL + 14}
              fontSize={10}
              fill="var(--muted)"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {i}
            </text>
          </g>
        );
      })}

      {sorted > 0 && (
        <line
          x1={PAD}
          y1={18}
          x2={PAD + sorted * (CELL + GAP) - GAP}
          y2={18}
          stroke="var(--family-accent, var(--accent))"
          strokeWidth={2}
        />
      )}

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
