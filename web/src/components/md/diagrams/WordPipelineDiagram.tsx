"use client";

/**
 * The split / reverse / join pipeline from Reverse Words: three static
 * snapshots of the same tokens, side by side — no motion needed, the
 * whole idea is "same pieces, different order, then glued."
 */

interface WordPipelineDiagramProps {
  s?: string;
}

const PILL_H = 22;
const PILL_GAP = 6;
const ROW_GAP = 34;

function pillWidth(text: string): number {
  return Math.max(28, text.length * 7.5 + 16);
}

export function WordPipelineDiagram({
  s = "the sky is blue",
}: WordPipelineDiagramProps) {
  const words = s.trim().split(/\s+/).filter(Boolean);
  const reversed = [...words].reverse();
  const joined = reversed.join(" ");

  const rowWidth = (tokens: string[]) =>
    tokens.reduce((sum, t) => sum + pillWidth(t) + PILL_GAP, 0);

  const width = Math.max(rowWidth(words), rowWidth(reversed), pillWidth(joined) + 20) + 90;
  const height = 20 + ROW_GAP * 3;

  const rows: { label: string; tokens: string[] }[] = [
    { label: "split", tokens: words },
    { label: "reverse", tokens: reversed },
    { label: "join", tokens: [joined] },
  ];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[480px]"
      role="img"
      aria-label={`Split "${s}" into words, reverse their order, then join with single spaces to get "${joined}"`}
    >
      {rows.map((row, i) => {
        const y = 14 + i * ROW_GAP;
        let x = 84;
        return (
          <g key={row.label}>
            <text
              x={0}
              y={y + PILL_H / 2}
              fontSize={10}
              fontWeight={700}
              fill="var(--foreground)"
              dominantBaseline="central"
              fontFamily="var(--font-mono), monospace"
            >
              {row.label}
            </text>
            {row.tokens.map((token, j) => {
              const w = pillWidth(token);
              const rectX = x;
              x += w + PILL_GAP;
              const isJoin = row.label === "join";
              return (
                <g key={j}>
                  <rect
                    x={rectX}
                    y={y}
                    width={w}
                    height={PILL_H}
                    rx={PILL_H / 2}
                    fill={
                      isJoin
                        ? "var(--family-accent, var(--accent))"
                        : "var(--surface)"
                    }
                    fillOpacity={isJoin ? 0.85 : 1}
                    stroke={isJoin ? "none" : "var(--border)"}
                    strokeWidth={1.25}
                  />
                  <text
                    x={rectX + w / 2}
                    y={y + PILL_H / 2}
                    fontSize={11}
                    fontWeight={600}
                    fill={isJoin ? "var(--background)" : "var(--foreground)"}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="var(--font-mono), monospace"
                  >
                    {token}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
