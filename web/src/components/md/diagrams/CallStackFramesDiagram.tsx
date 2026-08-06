"use client";

/**
 * Stacked call/data frames — LIFO visualized as a column of cards with
 * the top (most recent) highlighted. Used by Stacks and Recursion.
 */

export interface StackFrame {
  label: string;
  detail?: string;
}

interface CallStackFramesDiagramProps {
  frames?: StackFrame[];
  /** Label under the stack column. */
  caption?: string;
  /** Highlight the top frame (default true). */
  highlightTop?: boolean;
  /** Optional second column for recursion-vs-iteration contrast. */
  compare?: {
    title: string;
    frames: StackFrame[];
  };
  title?: string;
}

const FRAME_W = 180;
const FRAME_H = 36;
const GAP = 6;
const PAD = 16;

export function CallStackFramesDiagram({
  frames = [
    { label: "main()", detail: "waiting" },
    { label: "factorial(3)", detail: "n=3" },
    { label: "factorial(2)", detail: "n=2" },
    { label: "factorial(1)", detail: "n=1 · base" },
  ],
  caption = "call stack (top = most recent)",
  highlightTop = true,
  compare,
  title,
}: CallStackFramesDiagramProps) {
  const cols = compare ? 2 : 1;
  const leftFrames = frames;
  const rightFrames = compare?.frames ?? [];
  const maxFrames = Math.max(leftFrames.length, rightFrames.length, 1);
  const colGap = 48;
  const width =
    PAD * 2 + cols * FRAME_W + (cols - 1) * colGap + (title ? 0 : 0);
  const headerH = title || compare ? 28 : 0;
  const height =
    PAD * 2 + headerH + maxFrames * (FRAME_H + GAP) - GAP + 28;

  const renderCol = (
    colFrames: StackFrame[],
    x: number,
    colTitle?: string,
  ) => {
    const startY =
      PAD +
      headerH +
      (maxFrames - colFrames.length) * (FRAME_H + GAP);
    return (
      <g>
        {colTitle && (
          <text
            x={x + FRAME_W / 2}
            y={PAD + 14}
            fontSize={12}
            fontWeight={600}
            fill="var(--muted)"
            textAnchor="middle"
            fontFamily="var(--font-sans), system-ui"
          >
            {colTitle}
          </text>
        )}
        {colFrames.map((frame, i) => {
          const y = startY + i * (FRAME_H + GAP);
          const isTop = highlightTop && i === colFrames.length - 1;
          return (
            <g key={`${frame.label}-${i}`}>
              <rect
                x={x}
                y={y}
                width={FRAME_W}
                height={FRAME_H}
                rx={6}
                fill={
                  isTop
                    ? "var(--family-accent, var(--accent))"
                    : "var(--surface)"
                }
                fillOpacity={isTop ? 0.18 : 1}
                stroke="var(--family-accent, var(--accent))"
                strokeWidth={isTop ? 1.75 : 1.25}
                strokeOpacity={isTop ? 1 : 0.55}
              />
              <text
                x={x + 12}
                y={y + (frame.detail ? 14 : FRAME_H / 2 + 4)}
                fontSize={12}
                fontWeight={600}
                fill="var(--foreground)"
                fontFamily="var(--font-mono), monospace"
              >
                {frame.label}
              </text>
              {frame.detail && (
                <text
                  x={x + 12}
                  y={y + 28}
                  fontSize={10}
                  fill="var(--muted)"
                  fontFamily="var(--font-mono), monospace"
                >
                  {frame.detail}
                </text>
              )}
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[460px]"
      role="img"
      aria-label={
        compare
          ? `Left: ${title ?? "recursion"} with ${leftFrames.length} frames. Right: ${compare.title} with ${rightFrames.length} frames.`
          : `A stack of ${frames.length} frames; top is ${frames[frames.length - 1]?.label ?? "empty"}`
      }
    >
      {title && !compare && (
        <text
          x={width / 2}
          y={PAD + 12}
          fontSize={12}
          fontWeight={600}
          fill="var(--muted)"
          textAnchor="middle"
        >
          {title}
        </text>
      )}
      {renderCol(leftFrames, PAD, compare ? title ?? "recursion" : undefined)}
      {compare &&
        renderCol(rightFrames, PAD + FRAME_W + colGap, compare.title)}
      <text
        x={width / 2}
        y={height - 8}
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
