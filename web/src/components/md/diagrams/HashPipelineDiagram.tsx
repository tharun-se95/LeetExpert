"use client";

/**
 * Hash → slot pipeline: key → h(key) → mod m → bucket index.
 * Companion to bucket-layout (which shows the table after hashing).
 */

interface HashPipelineDiagramProps {
  keyLabel?: string;
  hashValue?: number;
  capacity?: number;
}

export function HashPipelineDiagram({
  keyLabel = '"dog"',
  hashValue = 4182,
  capacity = 8,
}: HashPipelineDiagramProps) {
  const slot = ((hashValue % capacity) + capacity) % capacity;
  const stages = [
    { title: "key", value: keyLabel },
    { title: "h(key)", value: String(hashValue) },
    { title: `mod ${capacity}`, value: String(slot) },
    { title: "bucket", value: `[${slot}]` },
  ];

  const BOX_W = 88;
  const BOX_H = 52;
  const GAP = 36;
  const PAD = 16;
  const width = PAD * 2 + stages.length * BOX_W + (stages.length - 1) * GAP;
  const height = 110;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[480px]"
      role="img"
      aria-label={`Hash pipeline: ${keyLabel} hashes to ${hashValue}, then mod ${capacity} lands in bucket ${slot}`}
    >
      {stages.map((s, i) => {
        const x = PAD + i * (BOX_W + GAP);
        const y = 28;
        return (
          <g key={s.title}>
            {i > 0 && (
              <line
                x1={x - GAP}
                y1={y + BOX_H / 2}
                x2={x}
                y2={y + BOX_H / 2}
                stroke="var(--family-accent, var(--accent))"
                strokeWidth={1.75}
                markerEnd="url(#hash-pipe-arrow)"
              />
            )}
            <rect
              x={x}
              y={y}
              width={BOX_W}
              height={BOX_H}
              rx={6}
              fill="var(--surface)"
              stroke="var(--family-accent, var(--accent))"
              strokeWidth={i === stages.length - 1 ? 2 : 1.25}
            />
            <text
              x={x + BOX_W / 2}
              y={y + 18}
              fontSize={10}
              fill="var(--muted)"
              textAnchor="middle"
              fontFamily="var(--font-sans), system-ui"
            >
              {s.title}
            </text>
            <text
              x={x + BOX_W / 2}
              y={y + 38}
              fontSize={13}
              fontWeight={700}
              fill="var(--foreground)"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {s.value}
            </text>
          </g>
        );
      })}
      <text
        x={width / 2}
        y={height - 8}
        fontSize={11}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-mono), monospace"
      >
        slot = h(key) mod m
      </text>
      <defs>
        <marker
          id="hash-pipe-arrow"
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
