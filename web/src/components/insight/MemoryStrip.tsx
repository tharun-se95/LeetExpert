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
      <p className={cn("font-mono text-[0.7rem] text-muted", className)}>
        {memory.label ?? "—"}
      </p>
    );
  }

  const markers = mapMarkersToDisplay(memory);
  const cellW = 18;
  const gap = 2;
  const n = memory.cells.length;
  const width = n * cellW + Math.max(0, n - 1) * gap;
  const hasMarkers = markers.length > 0;
  const height = hasMarkers ? 40 : 22;
  const cellY = 1;
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
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={aria || "Memory schematic"}
        className="block max-w-full"
      >
        {memory.cells.map((value, i) => {
          const x = i * (cellW + gap);
          const isEllipsis = value === "…";
          const isMarked = markers.some((m) => m.cellIndex === i);
          return (
            <g key={i} transform={`translate(${x}, ${cellY})`}>
              <rect
                width={cellW}
                height={18}
                rx={2}
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
                strokeWidth={1}
              />
              <text
                x={cellW / 2}
                y={12.5}
                textAnchor="middle"
                className="fill-foreground"
                style={{
                  fontSize: value.length > 2 ? 7 : 9,
                  fontFamily: "var(--font-mono-face), ui-monospace, monospace",
                  fill: isEllipsis ? "var(--muted)" : "var(--foreground)",
                }}
              >
                {value}
              </text>
            </g>
          );
        })}
        {markers.map((m) => {
          const x = m.cellIndex * (cellW + gap) + cellW / 2;
          const color = MARKER_COLOR[m.kind ?? "left"] ?? "var(--accent)";
          return (
            <g key={`${m.label}-${m.cellIndex}`}>
              <text
                x={x}
                y={34}
                textAnchor="middle"
                style={{
                  fontSize: 9,
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
        <p className="mt-0.5 font-mono text-[0.6rem] text-muted">
          {memory.cells.length - (memory.cells.includes("…") ? 1 : 0)}/
          {memory.totalLength}
        </p>
      ) : null}
    </div>
  );
}
