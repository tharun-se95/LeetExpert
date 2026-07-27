"use client";

/**
 * A clock face for modular arithmetic: m evenly-spaced positions around a
 * circle, with one or more values plotted at their (value mod m) landing
 * spot. Values that share a position (e.g. 8 and -7 mod 5) stack their
 * labels together — visually, "different numbers, same clock position."
 */

interface ModClockDiagramProps {
  m?: number;
  values?: number[];
}

function mod(a: number, m: number): number {
  return ((a % m) + m) % m;
}

const SIZE = 240;
const CENTER = SIZE / 2;
const RING_R = 78;
const TICK_LABEL_R = RING_R + 20;
const VALUE_LABEL_R = RING_R + 42;

function angleFor(position: number, m: number): number {
  // 0 at the top, clockwise.
  return (Math.PI * 2 * position) / m - Math.PI / 2;
}

function pointAt(radius: number, angle: number): { x: number; y: number } {
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
}

export function ModClockDiagram({
  m = 5,
  values = [8, -7],
}: ModClockDiagramProps) {
  const clampedM = Math.max(2, Math.min(12, Math.round(m)));

  const groups = new Map<number, number[]>();
  for (const v of values) {
    const pos = mod(v, clampedM);
    const list = groups.get(pos) ?? [];
    list.push(v);
    groups.set(pos, list);
  }

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto h-auto w-full max-w-[280px]"
      role="img"
      aria-label={`A clock with ${clampedM} positions, showing where ${values.join(", ")} land modulo ${clampedM}`}
    >
      {/* ring */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RING_R}
        fill="none"
        stroke="var(--border)"
        strokeWidth={1.5}
      />

      {/* direction arrow: clockwise = +1 */}
      <path
        d={(() => {
          const start = pointAt(RING_R + 10, -Math.PI / 2 - 0.05);
          const end = pointAt(RING_R + 10, -Math.PI / 2 + 0.55);
          const mid = pointAt(RING_R + 16, -Math.PI / 2 + 0.25);
          return `M ${start.x} ${start.y} Q ${mid.x} ${mid.y} ${end.x} ${end.y}`;
        })()}
        fill="none"
        stroke="var(--muted)"
        strokeWidth={1.5}
        strokeLinecap="round"
        markerEnd="url(#modclock-arrow)"
      />
      <defs>
        <marker
          id="modclock-arrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth={5}
          markerHeight={5}
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 Z" fill="var(--muted)" />
        </marker>
      </defs>
      <text
        x={CENTER + 30}
        y={CENTER - RING_R + 4}
        fontSize={9}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-mono), monospace"
      >
        +1
      </text>

      {/* tick positions */}
      {Array.from({ length: clampedM }, (_, position) => {
        const angle = angleFor(position, clampedM);
        const dot = pointAt(RING_R, angle);
        const label = pointAt(TICK_LABEL_R, angle);
        const isHighlighted = groups.has(position);
        return (
          <g key={position}>
            <circle
              cx={dot.x}
              cy={dot.y}
              r={isHighlighted ? 5 : 3}
              fill={isHighlighted ? "var(--accent)" : "var(--background)"}
              stroke={isHighlighted ? "var(--accent)" : "var(--border)"}
              strokeWidth={1.5}
            />
            <text
              x={label.x}
              y={label.y}
              fontSize={11}
              fontWeight={isHighlighted ? 700 : 500}
              fill={isHighlighted ? "var(--foreground)" : "var(--muted)"}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {position}
            </text>
          </g>
        );
      })}

      {/* value labels, stacked when they share a position */}
      {Array.from(groups.entries()).map(([position, vals]) => {
        const angle = angleFor(position, clampedM);
        const base = pointAt(VALUE_LABEL_R, angle);
        return (
          <g key={position}>
            {vals.map((v, i) => (
              <text
                key={v}
                x={base.x}
                y={base.y + (i - (vals.length - 1) / 2) * 13}
                fontSize={12}
                fontWeight={600}
                fill="var(--accent)"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="var(--font-mono), monospace"
              >
                {v}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
