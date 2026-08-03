"use client";

/**
 * A hash table's bucket array — index column down the left, chained
 * entries running right from any non-empty bucket. Replaces
 * collision-resolution's mermaid subgraph with the same visual language
 * as the rest of the diagram system.
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

const ROW_H = 34;
const ROW_GAP = 6;
const IDX_W = 34;
const ENTRY_W = 84;
const ENTRY_GAP = 18;
const PAD = 12;

export function BucketLayoutDiagram({
  capacity = 8,
  buckets = DEFAULT_BUCKETS,
}: BucketLayoutDiagramProps) {
  const byIndex = new Map(buckets.map((b) => [b.index, b.entries]));
  const rows = Array.from({ length: capacity }, (_, i) => byIndex.get(i) ?? []);
  const maxEntries = Math.max(1, ...rows.map((r) => r.length));
  const width =
    PAD * 2 + IDX_W + (maxEntries > 0 ? maxEntries * (ENTRY_W + ENTRY_GAP) : 0);
  const height = PAD * 2 + capacity * (ROW_H + ROW_GAP) - ROW_GAP;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[520px]"
      role="img"
      aria-label={`A hash table with ${capacity} buckets; ${buckets.filter((b) => b.entries.length > 0).length} contain chained entries`}
    >
      {rows.map((entries, i) => {
        const y = PAD + i * (ROW_H + ROW_GAP);
        return (
          <g key={i}>
            <rect
              x={PAD}
              y={y}
              width={IDX_W}
              height={ROW_H}
              rx={4}
              fill="var(--surface)"
              stroke="var(--border)"
              strokeWidth={1.25}
            />
            <text
              x={PAD + IDX_W / 2}
              y={y + ROW_H / 2 + 4}
              fontSize={12}
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
                    y1={y + ROW_H / 2}
                    x2={ex}
                    y2={y + ROW_H / 2}
                    stroke="var(--family-accent, var(--accent))"
                    strokeWidth={1.5}
                    markerEnd="url(#bucket-arrow)"
                  />
                  <rect
                    x={ex}
                    y={y}
                    width={ENTRY_W}
                    height={ROW_H}
                    rx={4}
                    fill="var(--family-accent, var(--accent))"
                    fillOpacity={0.1}
                    stroke="var(--family-accent, var(--accent))"
                    strokeWidth={1.25}
                  />
                  <text
                    x={ex + ENTRY_W / 2}
                    y={y + ROW_H / 2 + 4}
                    fontSize={11}
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
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--family-accent, var(--accent))" />
        </marker>
      </defs>
    </svg>
  );
}
