"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Small rendering vocabulary shared by the array-ish tracers: value cells
 * with semantic tones, pointer-arrow rows that glide between indices, and
 * a tint legend. Patterns mined from lab/primitives (ArrayStrip,
 * PointerMarkers) but motion-animated and theme-var driven.
 */

export type CellTone = "plain" | "kept" | "junk" | "active" | "dropped" | "resolved";

const TONE_CLASS: Record<CellTone, string> = {
  plain: "border-border bg-background text-foreground",
  kept: "border-accent/60 bg-accent/14 text-foreground",
  junk: "border-border bg-surface text-muted opacity-60",
  active: "border-pop bg-pop text-on-pop",
  dropped: "border-bad/60 bg-bad/10 text-muted",
  resolved: "border-good/50 bg-good/10 text-foreground",
};

export function Cell({
  value,
  index,
  tone = "plain",
  pop = false,
}: {
  value: string | number;
  index?: number;
  tone?: CellTone;
  /** Remount the value with a pop-in when it was just written */
  pop?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg border font-mono text-sm font-semibold tabular-nums transition-colors duration-300",
          TONE_CLASS[tone],
        )}
      >
        <motion.span
          key={pop ? `pop-${value}` : "static"}
          initial={pop ? { scale: 1.5, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
        >
          {value}
        </motion.span>
      </div>
      {index !== undefined ? (
        <span className="font-mono text-[10px] text-muted">{index}</span>
      ) : null}
    </div>
  );
}

export interface Marker {
  index: number;
  label: string;
  /** CSS color value; defaults to the accent variable */
  color?: string;
}

/**
 * One row of up-pointing arrows under an array row. Markers with the same
 * label glide between indices via layout animation.
 */
export function MarkerRow({ length, markers }: { length: number; markers: Marker[] }) {
  const rowId = useId();
  return (
    <div
      className="grid gap-1.5"
      style={{ gridTemplateColumns: `repeat(${length}, 2.5rem)` }}
      role="img"
      aria-label={markers.map((m) => `${m.label} at index ${m.index}`).join(", ")}
    >
      {Array.from({ length }, (_, i) => (
        <div key={i} className="flex min-h-9 flex-col items-center justify-start">
          {markers
            .filter((m) => m.index === i)
            .map((m) => {
              const color = m.color ?? "var(--accent)";
              return (
                <motion.div
                  key={m.label}
                  layoutId={`${rowId}-${m.label}`}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="flex flex-col items-center"
                >
                  <svg width="12" height="8" viewBox="0 0 12 8" aria-hidden>
                    <path d="M6 0 L12 8 H0 Z" fill={color} />
                  </svg>
                  <span
                    className="font-mono text-[10px] font-semibold"
                    style={{ color }}
                  >
                    {m.label}
                  </span>
                </motion.div>
              );
            })}
        </div>
      ))}
    </div>
  );
}

export function Legend({
  items,
}: {
  items: { tone: CellTone; label: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-[11px] text-muted">
          <span
            className={cn("h-2.5 w-2.5 rounded-sm border", TONE_CLASS[item.tone])}
            aria-hidden
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
