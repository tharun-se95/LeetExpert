"use client";

import { cn } from "@/lib/utils";

export type PointerMarker = {
  index: number;
  label: string;
  color?: string;
};

/** @deprecated alias */
export type PointerSpec = PointerMarker;

export interface PointerMarkersProps {
  /** Number of array cells (preferred) */
  length?: number;
  /** Alias for length */
  count?: number;
  pointers: PointerMarker[];
  accent?: string;
  className?: string;
}

/**
 * Labeled L / R / slow / fast arrows under an array strip.
 */
export function PointerMarkers({
  length,
  count,
  pointers,
  accent = "var(--family-accent, var(--accent))",
  className,
}: PointerMarkersProps) {
  const n = length ?? count ?? 0;

  return (
    <div
      className={cn("lab-motion mt-1 grid gap-1", className)}
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      role="img"
      aria-label={pointers.map((p) => `${p.label} at ${p.index}`).join(", ")}
    >
      {Array.from({ length: n }, (_, i) => {
        const ps = pointers.filter((p) => p.index === i);
        return (
          <div
            key={i}
            className="flex min-h-8 flex-col items-center justify-start gap-0.5"
          >
            {ps.map((p) => {
              const color = p.color ?? accent;
              return (
                <div key={p.label} className="flex flex-col items-center">
                  <svg width="12" height="10" viewBox="0 0 12 10" aria-hidden>
                    <path d="M6 0 L12 10 H0 Z" fill={color} />
                  </svg>
                  <span
                    className="rounded-[length:var(--radius-xs)] px-1 font-mono text-[10px] font-semibold"
                    style={{ color }}
                  >
                    {p.label}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
