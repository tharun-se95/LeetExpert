"use client";

import { cn } from "@/lib/utils";
import type { MemoryModel } from "@/lib/insight/types";
import { mapMarkersToDisplay } from "@/lib/insight/parseCaseMemory";

const MARKER_COLOR: Record<string, string> = {
  left: "var(--accent)",
  right: "var(--accent)",
  "window-lo": "var(--mark)",
  "window-hi": "var(--mark)",
  write: "var(--good)",
  read: "var(--warn)",
};

const CELL_H = 28;
const GAP = 4;
const PAD_Y = 3;
const MARKER_BAND = 16;
const MIN_CELL_W = 28;

function cellWidth(value: string): number {
  if (value === "…") return 22;
  // Mono ~0.6em wide; pad so multi-char labels (flo…, -12) aren't crushed.
  const chars = [...value].length;
  return Math.max(MIN_CELL_W, chars * 8 + 14);
}

/**
 * Schematic SVG cell strip for the Insight panel.
 * Case-bound — not a live debugger snapshot.
 */
export function MemoryStrip({
  memory,
  className,
}: {
  memory: MemoryModel;
  className?: string;
}) {
  if (memory.cells.length === 0) {
    return (
      <p className={cn("font-mono text-xs text-muted", className)}>
        {memory.label ?? "—"}
      </p>
    );
  }

  const markers = mapMarkersToDisplay(memory);
  const widths = memory.cells.map(cellWidth);
  const xs: number[] = [];
  let cursor = 0;
  for (let i = 0; i < widths.length; i++) {
    xs.push(cursor);
    cursor += widths[i]! + (i < widths.length - 1 ? GAP : 0);
  }
  const width = cursor;
  const hasMarkers = markers.length > 0;
  const height = PAD_Y * 2 + CELL_H + (hasMarkers ? MARKER_BAND : 0);
  const cellY = PAD_Y;
  const aria = [
    memory.label,
    memory.kind,
    `${memory.totalLength} cells`,
    markers.map((m) => `${m.label} at ${m.cellIndex}`).join(", "),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={cn("overflow-x-auto", className)}>
      {memory.label ? (
        <p className="mb-1 font-mono text-[0.65rem] text-muted">{memory.label}</p>
      ) : null}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={aria || "Memory schematic"}
        className="block h-auto max-w-full"
      >
        {memory.cells.map((value, i) => {
          const x = xs[i]!;
          const w = widths[i]!;
          const isEllipsis = value === "…";
          const isMarked = markers.some((m) => m.cellIndex === i);
          const fontSize = value.length > 3 ? 10 : 12;
          return (
            <g key={i} transform={`translate(${x}, ${cellY})`}>
              <rect
                width={w}
                height={CELL_H}
                rx={4}
                fill={
                  isEllipsis
                    ? "transparent"
                    : isMarked
                      ? "color-mix(in oklab, var(--accent) 14%, transparent)"
                      : "var(--elevated)"
                }
                stroke={
                  isEllipsis
                    ? "none"
                    : isMarked
                      ? "var(--accent)"
                      : "var(--border)"
                }
                strokeWidth={1.25}
              />
              <text
                x={w / 2}
                y={CELL_H / 2}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontSize,
                  fontFamily: "var(--font-mono-face), ui-monospace, monospace",
                  fontWeight: 600,
                  fill: isEllipsis ? "var(--muted)" : "var(--foreground)",
                }}
              >
                {value}
              </text>
            </g>
          );
        })}
        {markers.map((m) => {
          const x = xs[m.cellIndex]! + widths[m.cellIndex]! / 2;
          const color = MARKER_COLOR[m.kind ?? "left"] ?? "var(--accent)";
          return (
            <g key={`${m.label}-${m.cellIndex}`}>
              <text
                x={x}
                y={PAD_Y + CELL_H + 12}
                textAnchor="middle"
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-mono-face), ui-monospace, monospace",
                  fontWeight: 600,
                  fill: color,
                }}
              >
                {m.label}
              </text>
            </g>
          );
        })}
      </svg>
      {memory.truncated ? (
        <p className="mt-1 font-mono text-[0.65rem] text-muted">
          {memory.cells.length - (memory.cells.includes("…") ? 1 : 0)}/
          {memory.totalLength}
        </p>
      ) : null}
    </div>
  );
}
