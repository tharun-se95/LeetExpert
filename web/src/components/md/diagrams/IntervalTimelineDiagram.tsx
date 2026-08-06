"use client";

/**
 * Intervals on a number line — overlap / disjoint made geometric.
 */

export interface IntervalSpec {
  start: number;
  end: number;
  label?: string;
}

interface IntervalTimelineDiagramProps {
  intervals?: IntervalSpec[];
  /** Domain start/end for the axis. */
  domain?: [number, number];
}

const DEFAULT_INTERVALS: IntervalSpec[] = [
  { start: 1, end: 100, label: "[1,100]" },
  { start: 2, end: 3, label: "[2,3]" },
  { start: 4, end: 5, label: "[4,5]" },
];

export function IntervalTimelineDiagram({
  intervals = DEFAULT_INTERVALS,
  domain,
}: IntervalTimelineDiagramProps) {
  const ints =
    intervals.length > 0
      ? intervals
      : DEFAULT_INTERVALS;
  const min = domain?.[0] ?? Math.min(...ints.map((i) => i.start)) - 1;
  const max = domain?.[1] ?? Math.max(...ints.map((i) => i.end)) + 1;
  const span = Math.max(1, max - min);

  const PAD_L = 48;
  const PAD_R = 24;
  const AXIS_Y = 28;
  const ROW_H = 36;
  const width = 460;
  const plotW = width - PAD_L - PAD_R;
  const height = AXIS_Y + ints.length * ROW_H + 36;

  const xAt = (v: number) => PAD_L + ((v - min) / span) * plotW;

  // Tick candidates
  const ticks: number[] = [];
  const step = span > 20 ? 10 : span > 8 ? 2 : 1;
  for (let t = Math.ceil(min); t <= max; t += step) ticks.push(t);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[500px]"
      role="img"
      aria-label={`${ints.length} intervals on a number line from ${min} to ${max}`}
    >
      <line
        x1={PAD_L}
        y1={AXIS_Y}
        x2={PAD_L + plotW}
        y2={AXIS_Y}
        stroke="var(--border)"
        strokeWidth={1.5}
      />
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={xAt(t)}
            y1={AXIS_Y - 4}
            x2={xAt(t)}
            y2={AXIS_Y + 4}
            stroke="var(--muted)"
            strokeWidth={1}
          />
          <text
            x={xAt(t)}
            y={AXIS_Y - 8}
            fontSize={10}
            fill="var(--muted)"
            textAnchor="middle"
            fontFamily="var(--font-mono), monospace"
          >
            {t}
          </text>
        </g>
      ))}

      {ints.map((iv, i) => {
        const y = AXIS_Y + 18 + i * ROW_H;
        const x1 = xAt(iv.start);
        const x2 = xAt(iv.end);
        const w = Math.max(x2 - x1, 4);
        return (
          <g key={i}>
            <rect
              x={x1}
              y={y}
              width={w}
              height={22}
              rx={4}
              fill="var(--family-accent, var(--accent))"
              fillOpacity={0.18}
              stroke="var(--family-accent, var(--accent))"
              strokeWidth={1.5}
            />
            <text
              x={x1 - 8}
              y={y + 15}
              fontSize={11}
              fill="var(--muted)"
              textAnchor="end"
              fontFamily="var(--font-mono), monospace"
            >
              {iv.label ?? `[${iv.start},${iv.end}]`}
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
        fontFamily="var(--font-sans), system-ui"
      >
        sorted by start → sweep left to right
      </text>
    </svg>
  );
}
