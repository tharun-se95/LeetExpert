"use client";

/**
 * Stacked horizontal bands, top to bottom — the shape for anything that's
 * fundamentally an ordered set of layers checked/applied in sequence: the
 * three-plus-one cache layers, layout nesting, the middleware-first
 * request pipeline. The topmost band runs first.
 */
export interface Band {
  label: string;
  detail?: string;
  highlight?: boolean;
}

interface LayeredBandsDiagramProps {
  bands?: Band[];
  caption?: string;
}

const BAND_W = 380;
const BAND_H = 44;
const GAP = 4;
const PAD = 12;

export function LayeredBandsDiagram({
  bands = [{ label: "Layer 1" }, { label: "Layer 2" }],
  caption,
}: LayeredBandsDiagramProps) {
  const width = PAD * 2 + BAND_W;
  const height = PAD * 2 + bands.length * (BAND_H + GAP) - GAP + (caption ? 20 : 0);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[420px]"
      role="img"
      aria-label={
        (caption ? `${caption}: ` : "") +
        bands.map((b) => b.label + (b.detail ? ` — ${b.detail}` : "")).join(", then ")
      }
    >
      <defs>
        <marker id="bandArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--muted)" />
        </marker>
      </defs>
      {bands.map((band, i) => {
        const y = PAD + i * (BAND_H + GAP);
        return (
          <g key={i}>
            <rect
              x={PAD}
              y={y}
              width={BAND_W}
              height={BAND_H}
              rx={6}
              fill={band.highlight ? "var(--family-accent, var(--accent))" : "var(--surface)"}
              fillOpacity={band.highlight ? 0.16 : 1}
              stroke={band.highlight ? "var(--family-accent, var(--accent))" : "var(--border)"}
              strokeWidth={band.highlight ? 1.5 : 1}
            />
            <text
              x={PAD + 14}
              y={y + BAND_H / 2 - (band.detail ? 7 : 0)}
              fontSize={11.5}
              fontWeight={700}
              fill="var(--foreground)"
              dominantBaseline="central"
              fontFamily="var(--font-sans), system-ui"
            >
              {band.label}
            </text>
            {band.detail ? (
              <text
                x={PAD + 14}
                y={y + BAND_H / 2 + 11}
                fontSize={9.5}
                fill="var(--muted)"
                dominantBaseline="central"
                fontFamily="var(--font-sans), system-ui"
              >
                {band.detail}
              </text>
            ) : null}
            {i < bands.length - 1 ? (
              <line
                x1={PAD + BAND_W / 2}
                y1={y + BAND_H + 1}
                x2={PAD + BAND_W / 2}
                y2={y + BAND_H + GAP - 1}
                stroke="var(--muted)"
                strokeWidth={1.5}
                markerEnd="url(#bandArrow)"
              />
            ) : null}
          </g>
        );
      })}
      {caption ? (
        <text
          x={width / 2}
          y={height - 4}
          fontSize={10}
          fill="var(--muted)"
          textAnchor="middle"
          fontFamily="var(--font-sans), system-ui"
        >
          {caption}
        </text>
      ) : null}
    </svg>
  );
}
