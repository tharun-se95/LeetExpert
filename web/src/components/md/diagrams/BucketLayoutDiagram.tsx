"use client";

/**
 * A hash table's bucket array — index column down the left, chained
 * entries running right from any non-empty bucket. Empty slots render as
 * thin rows (they carry no extra information beyond "empty"), so a mostly-
 * empty table stays compact instead of stretching to one full-height row
 * per capacity slot.
 */

export interface BucketRow {
  index: number;
  entries: string[];
}

interface BucketLayoutDiagramProps {
  capacity?: number;
  buckets?: BucketRow[];
}

const DEFAULT_BUCKETS: BucketRow[] = [
  { index: 0, entries: ["cat"] },
  { index: 2, entries: ["dog", "god"] },
  { index: 4, entries: ["emu"] },
];

const ROW_H = 28;
const EMPTY_ROW_H = 18;
const ROW_GAP = 4;
const IDX_W = 28;
const ENTRY_W = 68;
const ENTRY_GAP = 14;
const PAD = 10;

export function BucketLayoutDiagram({
  capacity = 8,
  buckets = DEFAULT_BUCKETS,
}: BucketLayoutDiagramProps) {
  const byIndex = new Map(buckets.map((b) => [b.index, b.entries]));
  const rows = Array.from({ length: capacity }, (_, i) => byIndex.get(i) ?? []);
  const maxEntries = Math.max(1, ...rows.map((r) => r.length));
  const width =
    PAD * 2 + IDX_W + (maxEntries > 0 ? maxEntries * (ENTRY_W + ENTRY_GAP) : 0);

  let cursorY = PAD;
  const rowYs = rows.map((entries) => {
    const y = cursorY;
    const h = entries.length > 0 ? ROW_H : EMPTY_ROW_H;
    cursorY += h + ROW_GAP;
    return { y, h };
  });
  const height = cursorY - ROW_GAP + PAD;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[380px]"
      role="img"
      aria-label={`A hash table with ${capacity} buckets; ${buckets.filter((b) => b.entries.length > 0).length} contain chained entries`}
    >
      {rows.map((entries, i) => {
        const { y, h } = rowYs[i]!;
        return (
          <g key={i}>
            <rect
              x={PAD}
              y={y}
              width={IDX_W}
              height={h}
              rx={3}
              fill="var(--surface)"
              stroke="var(--border)"
              strokeWidth={1}
            />
            <text
              x={PAD + IDX_W / 2}
              y={y + h / 2 + (entries.length > 0 ? 4 : 3.5)}
              fontSize={entries.length > 0 ? 11 : 9}
              fontWeight={600}
              fill="var(--muted)"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {i}
            </text>

            {entries.map((entry, j) => {
              const ex = PAD + IDX_W + ENTRY_GAP + j * (ENTRY_W + ENTRY_GAP);
              const prevRight = j === 0 ? PAD + IDX_W : ex - ENTRY_GAP;
              return (
                <g key={j}>
                  <line
                    x1={prevRight}
                    y1={y + h / 2}
                    x2={ex}
                    y2={y + h / 2}
                    stroke="var(--family-accent, var(--accent))"
                    strokeWidth={1.25}
                    markerEnd="url(#bucket-arrow)"
                  />
                  <rect
                    x={ex}
                    y={y}
                    width={ENTRY_W}
                    height={h}
                    rx={3}
                    fill="var(--family-accent, var(--accent))"
                    fillOpacity={0.1}
                    stroke="var(--family-accent, var(--accent))"
                    strokeWidth={1}
                  />
                  <text
                    x={ex + ENTRY_W / 2}
                    y={y + h / 2 + 3.5}
                    fontSize={9.5}
                    fill="var(--foreground)"
                    textAnchor="middle"
                    fontFamily="var(--font-mono), monospace"
                  >
                    {entry}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}

      <defs>
        <marker
          id="bucket-arrow"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--family-accent, var(--accent))" />
        </marker>
      </defs>
    </svg>
  );
}
