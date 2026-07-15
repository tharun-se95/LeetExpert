"use client";

import { cn } from "@/lib/utils";

export interface ArrayStripProps {
  values: (string | number)[];
  /** Preferred prop name */
  highlights?: number[];
  /** Alias used by some demos */
  highlight?: number[];
  /** Inclusive window — prefer start/end */
  window?: { start: number; end: number } | { left: number; right: number };
  dimmed?: number[];
  accent?: string;
  size?: "sm" | "md";
  className?: string;
}

function windowBounds(
  win: ArrayStripProps["window"],
): { start: number; end: number } | null {
  if (!win) return null;
  if ("start" in win) return { start: win.start, end: win.end };
  return { start: win.left, end: win.right };
}

export function ArrayStrip({
  values,
  highlights,
  highlight,
  window: win,
  dimmed = [],
  accent = "var(--family-accent, var(--accent))",
  size = "md",
  className,
}: ArrayStripProps) {
  const hi = new Set(highlights ?? highlight ?? []);
  const bounds = windowBounds(win);
  const cell = size === "sm" ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm";

  return (
    <div
      className={cn(
        "lab-motion flex flex-wrap items-end justify-center gap-1.5",
        className,
      )}
      role="img"
      aria-label={`Array: ${values.join(", ")}`}
    >
      {values.map((v, i) => {
        const isHi = hi.has(i);
        const isDim = dimmed.includes(i);
        const inWin = bounds != null && i >= bounds.start && i <= bounds.end;
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "flex items-center justify-center rounded-lg border font-mono font-semibold tabular-nums transition-colors",
                cell,
                isDim && "opacity-35",
              )}
              style={{
                borderColor: isHi || inWin ? accent : "var(--border)",
                background: isHi
                  ? accent
                  : inWin
                    ? `color-mix(in oklab, ${accent} 12%, transparent)`
                    : "var(--background)",
                color: isHi ? "#ffffff" : "var(--foreground)",
                boxShadow:
                  inWin && !isHi
                    ? `inset 0 0 0 1px color-mix(in oklab, ${accent} 40%, transparent)`
                    : undefined,
              }}
            >
              {v}
            </div>
            <span className="font-mono text-[10px] text-muted">{i}</span>
          </div>
        );
      })}
    </div>
  );
}
