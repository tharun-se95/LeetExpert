"use client";

/**
 * The vertical-scan idea from Longest Common Prefix: stack the strings,
 * walk a column index right, stop at the first column where any string
 * disagrees or runs out. Static snapshot at the stopping column.
 */

interface ColumnScanDiagramProps {
  strings?: string[];
}

const CELL = 26;
const GAP = 3;
const ROW_GAP = 6;

function breakColumn(strs: string[]): number {
  const first = strs[0] ?? "";
  for (let col = 0; col < first.length; col++) {
    const ch = first[col];
    for (const s of strs.slice(1)) {
      if (col >= s.length || s[col] !== ch) return col;
    }
  }
  return first.length;
}

export function ColumnScanDiagram({
  strings = ["flower", "flow", "flight"],
}: ColumnScanDiagramProps) {
  // Empty-array input bypasses the default param (only `undefined` does
  // not) and would otherwise send Math.max(...[]) to -Infinity, producing
  // an invalid negative viewBox.
  const strs = (strings.length > 0 ? strings : ["flower", "flow", "flight"]).slice(0, 5);
  const brk = breakColumn(strs);
  const maxLen = Math.max(...strs.map((s) => s.length));
  // Room for the "shared prefix" label + bracket above the cells. The
  // label used to sit at y≈2 inside a viewBox that started at 0, so
  // alphabetic-baseline glyphs were clipped at the top.
  const topPad = brk > 0 ? 22 : 4;
  const width = 90 + maxLen * (CELL + GAP);
  const height = topPad + strs.length * (CELL + ROW_GAP) + 2;
  const prefixRight = 90 + brk * (CELL + GAP) - GAP;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[440px] overflow-visible"
      role="img"
      aria-label={
        brk === 0
          ? `${strs.length} strings stacked and compared column by column; they disagree at the very first column, so there is no shared prefix`
          : `${strs.length} strings stacked and compared column by column; they agree through column ${brk - 1}, giving a shared prefix of length ${brk}`
      }
    >
      {brk > 0 ? (
        <g>
          <text
            x={90 + (prefixRight - 90) / 2}
            y={11}
            fontSize={9}
            fontWeight={600}
            fill="var(--family-accent, var(--accent))"
            textAnchor="middle"
            fontFamily="var(--font-mono), monospace"
          >
            shared prefix
          </text>
          <path
            d={`M 90 ${topPad - 2} L 90 15 L ${prefixRight} 15 L ${prefixRight} ${topPad - 2}`}
            fill="none"
            stroke="var(--family-accent, var(--accent))"
            strokeWidth={1.25}
          />
        </g>
      ) : null}

      {strs.map((s, row) => {
        const y = topPad + row * (CELL + ROW_GAP);
        return (
          <g key={row}>
            {[...s].map((ch, col) => {
              const x = 90 + col * (CELL + GAP);
              const isPrefix = col < brk;
              const isBreak = col === brk;
              return (
                <g key={col}>
                  <rect
                    x={x}
                    y={y}
                    width={CELL}
                    height={CELL}
                    rx={4}
                    fill={
                      isPrefix
                        ? "var(--family-accent, var(--accent))"
                        : isBreak
                          ? "var(--bad)"
                          : "var(--surface)"
                    }
                    fillOpacity={isPrefix ? 0.85 : isBreak ? 0.14 : 1}
                    stroke={isBreak ? "var(--bad)" : "var(--border)"}
                    strokeWidth={isBreak ? 1.5 : 1.25}
                  />
                  <text
                    x={x + CELL / 2}
                    y={y + CELL / 2}
                    fontSize={12}
                    fontWeight={600}
                    fill={isPrefix ? "var(--background)" : "var(--foreground)"}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="var(--font-mono), monospace"
                  >
                    {ch}
                  </text>
                </g>
              );
            })}
            <text
              x={0}
              y={y + CELL / 2}
              fontSize={10}
              fill="var(--muted)"
              dominantBaseline="central"
              fontFamily="var(--font-mono), monospace"
            >
              str[{row}]
            </text>
          </g>
        );
      })}
    </svg>
  );
}
