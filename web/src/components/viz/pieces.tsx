"use client";

import { useId, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Shared vocabulary for the live-state tracer grammar (spec:
 * docs/superpowers/specs/2026-08-20-viz-live-state-grammar-design.md).
 *
 * Cells and legends above are the long-lived building blocks; the primitives
 * below them (Tape, Head, WindowFrame, RangeBracket, StatusPanel, Node) are
 * the revamped grammar: values that move, ranges that are objects, one
 * instrument strip, one node shape.
 */

// Slot geometry used by Tape and its overlays (matches the 2.5rem Cell).
/** One slot is this wide; the next slot's left edge is SLOT_STEP away. */
export const SLOT_W = "2.5rem";
export const SLOT_GAP = "0.375rem";
export const SLOT_STEP = "calc(2.5rem + 0.375rem)";
/** Numeric form of SLOT_STEP, for computing pixel offsets in rem. */
export const SLOT_STEP_REM = 2.875;

export type Tone =
  | "default"
  | "focal"
  | "range"
  | "eliminated"
  | "result"
  | "held";

const TONE_CELL: Record<Tone, string> = {
  default: "border-border bg-background text-foreground",
  focal:
    "border-[var(--family-accent,var(--accent))] bg-[var(--family-accent,var(--accent))] text-[var(--family-on-accent,var(--on-pop))]",
  range:
    "border-[var(--family-accent,var(--accent))]/50 bg-[var(--family-accent,var(--accent))]/10 text-foreground",
  eliminated: "border-border bg-surface text-muted opacity-50",
  result: "border-good/60 bg-good/15 text-foreground",
  held: "border-[var(--bad)]/60 bg-[var(--bad)]/10 text-foreground",
};

/**
 * Small rendering vocabulary shared by the array-ish tracers: value cells
 * with semantic tones, pointer-arrow rows that glide between indices, and
 * a tint legend. Patterns mined from lab/primitives (ArrayStrip,
 * PointerMarkers) but motion-animated and theme-var driven.
 */

export type CellTone = "plain" | "kept" | "junk" | "active" | "dropped" | "resolved";

const TONE_CLASS: Record<CellTone, string> = {
  plain: "border-border bg-background text-foreground",
  kept: "border-[var(--family-accent,var(--accent))]/60 bg-[var(--family-accent,var(--accent))]/14 text-foreground",
  junk: "border-border bg-surface text-muted opacity-60",
  // dropped/resolved stay universal red/green — pass/fail meaning, not family identity.
  active:
    "border-[var(--family-accent,var(--accent))] bg-[var(--family-accent,var(--accent))] text-[var(--family-on-accent,var(--on-pop))]",
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
              const color = m.color ?? "var(--family-accent, var(--accent))";
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

/* ------------------------------------------------------------------ */
/* Live-state grammar primitives                                      */
/* ------------------------------------------------------------------ */

export interface TapeMarker {
  at: number;
  label: string;
  color?: string;
}

export interface TapeRange {
  lo: number;
  hi: number;
}

function slotLeft(at: number): string {
  return `calc(${at} * ${SLOT_STEP})`;
}

function rangeWidth(range: TapeRange): string {
  const span = range.hi - range.lo + 1;
  return `calc(${span} * ${SLOT_W} + ${span - 1} * ${SLOT_GAP} + 0.5rem)`;
}

/** A small pointer that sits above a slot — the step's attention marker. */
export function Head({
  at,
  label,
  color,
}: {
  at: number;
  label: string;
  color?: string;
}) {
  const c = color ?? "var(--family-accent, var(--accent))";
  return (
    <div
      aria-hidden
      className="absolute top-0 flex flex-col items-center"
      style={{
        left: slotLeft(at),
        transform: "translateX(calc(-1 * (1.25rem)))",
        width: "2.5rem",
      }}
    >
      <span
        className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none"
        style={{
          color: c,
          backgroundColor: `color-mix(in oklab, ${c} 12%, transparent)`,
        }}
      >
        {label}
      </span>
      <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden>
        <path d="M5 6 L0 0 H10 Z" fill={c} />
      </svg>
    </div>
  );
}

/** A translucent frame wrapped around a contiguous run of slots (the window). */
export function WindowFrame({ lo, hi }: TapeRange) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute rounded-lg border-2 border-[var(--family-accent,var(--accent))]/60 bg-[var(--family-accent,var(--accent))]/10"
      style={{
        left: `calc(${lo} * ${SLOT_STEP} - 0.25rem)`,
        top: "-0.25rem",
        width: rangeWidth({ lo, hi }),
        height: `calc(${SLOT_W} + 0.5rem)`,
      }}
    />
  );
}

/** A top bracket with end caps over [lo, hi]; collapsed range = resolved. */
export function RangeBracket({ lo, hi }: TapeRange) {
  const resolved = lo === hi;
  const c = resolved
    ? "var(--good)"
    : "var(--family-accent, var(--accent))";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-[-0.4rem] flex"
      style={{
        left: `calc(${lo} * ${SLOT_STEP} - 0.25rem)`,
        width: rangeWidth({ lo, hi }),
      }}
    >
      <div className="w-2 border-t-2 border-l-2 rounded-tl" style={{ borderColor: c }} />
      <div className="flex-1 border-t-2" style={{ borderColor: c }} />
      <div className="w-2 border-t-2 border-r-2 rounded-tr" style={{ borderColor: c }} />
    </div>
  );
}

/**
 * The array as a slot tape. Values glide to new slots when the snapshot
 * reorders them; slots and index labels stay put. Window/bracket/markers
 * overlay the same geometry so everything stays in register.
 */
export function Tape({
  values,
  keyOf = (v) => String(v),
  toneFor,
  focal = null,
  markers = [],
  window = null,
  bracket = null,
  held = null,
  reduced = false,
  className,
  hideIndices = false,
}: {
  values: (number | string | null)[];
  keyOf?: (v: number | string) => string;
  toneFor?: (i: number) => Tone;
  /** The step's subject — gets a ring + scale on top of its tone. */
  focal?: number | null;
  markers?: TapeMarker[];
  window?: TapeRange | null;
  bracket?: TapeRange | null;
  /** Value currently "in hand" — rendered as a floating chip over the tape. */
  held?: number | string | null;
  reduced?: boolean;
  className?: string;
  /** Suppress the index row — for secondary tapes aligned under another. */
  hideIndices?: boolean;
}) {
  const n = values.length;
  const width = `calc(${n} * ${SLOT_W} + ${n - 1} * ${SLOT_GAP})`;
  const spring = reduced
    ? { duration: 0 }
    : { type: "spring", stiffness: 420, damping: 34 } as const;
  // Glide needs value identity; duplicate values can't be told apart, so key
  // by slot instead — content stays correct even though nothing glides.
  const present = values.filter((v): v is number | string => v !== null);
  const hasDupes = new Set(present).size !== present.length;
  const chipKey = (i: number, v: number | string) =>
    hasDupes ? `${i}` : (keyOf?.(v) ?? String(v));

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {(markers.length > 0 || held !== null) && (
        <div className="relative h-7">
          {markers.map((m) => (
            <Head key={m.label} at={m.at} label={m.label} color={m.color} />
          ))}
          {held !== null ? (
            <div
              aria-hidden
              className="absolute right-0 top-0 flex h-7 items-center rounded-md border border-[var(--bad)]/60 bg-[var(--bad)]/10 px-2 font-mono text-[11px] font-semibold text-foreground"
            >
              held {held}
            </div>
          ) : null}
        </div>
      )}

      <div className="relative" style={{ width }}>
        {window ? <WindowFrame {...window} /> : null}
        {bracket ? <RangeBracket {...bracket} /> : null}
        <div className="flex gap-[0.375rem]">
          {Array.from({ length: n }, (_, i) => (
            <div key={i} className="flex w-10 flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-lg border border-border bg-background/40" />
              {!hideIndices ? (
                <span className="font-mono text-[10px] text-muted">{i}</span>
              ) : null}
            </div>
          ))}
        </div>

        {values.map((v, i) => {
          if (v === null) return null;
          const tone = toneFor?.(i) ?? "default";
          return (
            <motion.div
              key={chipKey(i, v)}
              initial={false}
              animate={{ x: slotLeft(i) }}
              transition={spring}
              className="absolute left-0 top-0 w-10"
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border font-mono text-sm font-semibold tabular-nums",
                  TONE_CELL[tone],
                  !reduced && "transition-colors duration-300",
                  focal === i && !reduced && "scale-[1.07] ring-2 ring-[var(--family-accent,var(--accent))] ring-offset-2 ring-offset-[var(--background)]",
                )}
              >
                {v}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/** One instrument strip for live variables, identical across every tracer. */
export function StatusPanel({
  items,
  className,
}: {
  items: { label: string; value: ReactNode }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] tabular-nums text-muted",
        className,
      )}
    >
      {items.map((it, i) => (
        <span key={i} className="flex items-baseline gap-1.5">
          <span className="text-muted/70">{it.label}</span>
          <span className="font-semibold text-foreground">{it.value}</span>
        </span>
      ))}
    </div>
  );
}

export type NodeState = "default" | "focal" | "visited" | "result" | "held";

const NODE_STATE: Record<NodeState, string> = {
  default: "border-border bg-background text-foreground",
  focal:
    "border-[var(--family-accent,var(--accent))] bg-[var(--family-accent,var(--accent))] text-[var(--family-on-accent,var(--on-pop))]",
  visited:
    "border-[var(--family-accent,var(--accent))]/50 bg-[var(--family-accent,var(--accent))]/10 text-foreground",
  result: "border-good/60 bg-good/15 text-foreground",
  held: "border-[var(--bad)]/60 bg-[var(--bad)]/10 text-foreground",
};

/**
 * One node in a list/tree/graph tracer — same accent language as cells.
 * Circles for trees/graphs, rounded squares for list nodes.
 */
export function Node({
  value,
  sub,
  state = "default",
  shape = "circle",
  size = 36,
  reduced = false,
  className,
}: {
  value: string | number;
  sub?: string;
  state?: NodeState;
  shape?: "circle" | "square";
  size?: number;
  reduced?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border font-mono text-[11px] font-semibold leading-none",
        shape === "circle" ? "rounded-full" : "rounded-lg",
        NODE_STATE[state],
        !reduced && "transition-colors duration-300",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <span>{value}</span>
      {sub ? (
        <span className="mt-0.5 text-[9px] font-normal opacity-80">{sub}</span>
      ) : null}
    </div>
  );
}
