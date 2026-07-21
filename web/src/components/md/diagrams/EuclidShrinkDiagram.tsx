"use client";

/**
 * Euclid's algorithm as shrinking bars: each row is one gcd(a, b) call,
 * drawn as a bar of length a divided into q segments of length b, with the
 * leftover remainder r tinted accent. The next row's bar (b, r) is scaled
 * to the SAME reference, so the bars visibly shrink step to step.
 */

interface EuclidShrinkDiagramProps {
  a?: number;
  b?: number;
}

interface Step {
  a: number;
  b: number;
  q: number;
  r: number;
}

const MAX_ROWS = 7;
const BAR_WIDTH = 220;
const BAR_HEIGHT = 20;
const ROW_GAP = 34;
const LEFT_PAD = 4;
const TOP_PAD = 6;

function buildSteps(a: number, b: number): Step[] {
  const steps: Step[] = [];
  let x = Math.max(1, Math.round(a));
  let y = Math.max(0, Math.round(b));
  while (y !== 0 && steps.length < MAX_ROWS) {
    const q = Math.floor(x / y);
    const r = x % y;
    steps.push({ a: x, b: y, q, r });
    x = y;
    y = r;
  }
  return steps;
}

export function EuclidShrinkDiagram({
  a = 48,
  b = 18,
}: EuclidShrinkDiagramProps) {
  const steps = buildSteps(a, b);
  const scale = steps.length > 0 ? BAR_WIDTH / steps[0].a : 1;
  const height = steps.length * ROW_GAP + TOP_PAD + 24;
  const gcd = steps.length > 0 ? steps[steps.length - 1].b : Math.max(a, b);

  return (
    <svg
      viewBox={`0 0 340 ${height}`}
      className="mx-auto h-auto w-full max-w-[420px]"
      role="img"
      aria-label={`Euclid's algorithm shrinking gcd(${a}, ${b}) down to ${gcd}`}
    >
      {steps.map((step, i) => {
        const y = TOP_PAD + i * ROW_GAP;
        const fullSegW = step.b * scale;
        const remW = step.r * scale;
        const isLast = step.r === 0;

        return (
          <g key={i}>
            {/* the q full-length segments — accent-filled on the final (gcd) row */}
            {Array.from({ length: step.q }, (_, s) => (
              <rect
                key={s}
                x={LEFT_PAD + s * fullSegW}
                y={y}
                width={Math.max(fullSegW - 1.5, 1)}
                height={BAR_HEIGHT}
                rx={3}
                fill={isLast ? "var(--accent)" : "var(--surface)"}
                fillOpacity={isLast ? 0.85 : 1}
                stroke={isLast ? "none" : "var(--border)"}
                strokeWidth={1.25}
              />
            ))}
            {/* the remainder segment, highlighted */}
            {remW > 0 ? (
              <rect
                x={LEFT_PAD + step.q * fullSegW}
                y={y}
                width={Math.max(remW - 1, 1)}
                height={BAR_HEIGHT}
                rx={3}
                fill="var(--accent)"
                fillOpacity={0.85}
              />
            ) : null}

            <text
              x={LEFT_PAD + step.a * scale + 10}
              y={y + BAR_HEIGHT / 2}
              fontSize={11}
              dominantBaseline="middle"
              fill={isLast ? "var(--accent)" : "var(--muted)"}
              fontWeight={isLast ? 700 : 500}
              fontFamily="var(--font-geist-mono), monospace"
            >
              {isLast
                ? `gcd = ${step.b}`
                : `${step.a} = ${step.q}×${step.b} + ${step.r}`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
