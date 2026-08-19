"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FAMILIES, type FamilyId } from "@/lib/content/manifest";
import { familyCssVars, getFamilyTheme } from "@/lib/visual/familyTheme";
import { Cell, MarkerRow } from "@/components/viz/pieces";
import { cn } from "@/lib/utils";

/**
 * Curriculum at a glance, as a spotlight: one pattern family on stage at a
 * time, drawn with the same cell-and-pointer vocabulary the lessons use, in
 * the family's real accent (familyTheme.ts). Auto-advances through all seven;
 * reduced-motion freezes on the settled frame and stops the clock.
 */

const BEAT_MS = 600;
const DWELL_MS = 5200;

// One less than the loop LCM (lcm(8, 6, 9, 7) = 504), so every scene starts
// on its finished frame — first paint looks complete, then it animates.
const SETTLED_BEAT = 503;

interface SpotlightStats {
  modules: number;
  concepts: number;
  lessons: number;
  problems: number;
}

function useSpotlightClock(): { beat: number; settled: boolean } {
  const reduced = useReducedMotion();
  const [beat, setBeat] = useState(SETTLED_BEAT);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setBeat((b) => b + 1), BEAT_MS);
    return () => window.clearInterval(id);
  }, [reduced]);
  return { beat, settled: reduced === true };
}

/** Scenes loop over `cycle` beats; the last beat is the settled frame. */
function phaseOf(beat: number, settled: boolean, cycle: number): number {
  return settled ? cycle - 1 : beat % cycle;
}

const CELL_VALUES = [2, 7, 11, 15, 18, 21, 26] as const;

function LinearGlyph({ phase }: { phase: number }) {
  const accent = getFamilyTheme("linear-traversal").accent;
  const cells = [3, 1, 4, 1, 5, 9];
  const writeAt = Math.min(phase, cells.length - 1);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <MarkerRow
        length={cells.length}
        markers={[{ index: writeAt, label: "w", color: accent }]}
      />
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${cells.length}, 2.5rem)` }}
      >
        {cells.map((v, i) => (
          <Cell
            key={i}
            value={v}
            index={i}
            tone={phase > i ? "kept" : "plain"}
            pop={phase > i}
          />
        ))}
      </div>
    </div>
  );
}

function PointersGlyph({ phase }: { phase: number }) {
  const accent = getFamilyTheme("pointer-movement").accent;
  // Walk the two ends to a meet in the middle, then hold.
  const left = Math.min(phase, 3);
  const right = Math.max(CELL_VALUES.length - 1 - phase, 3);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <MarkerRow
        length={CELL_VALUES.length}
        markers={[
          { index: left, label: "i", color: accent },
          { index: right, label: "j", color: accent },
        ]}
      />
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${CELL_VALUES.length}, 2.5rem)` }}
      >
        {CELL_VALUES.map((v, i) => (
          <Cell key={i} value={v} index={i} tone="plain" />
        ))}
      </div>
    </div>
  );
}

function OrderingGlyph({ phase }: { phase: number }) {
  // Binary search for 11: the candidate range halves until one cell is left.
  const steps = [
    { lo: 0, hi: 6, mid: 3 },
    { lo: 0, hi: 3, mid: 1 },
    { lo: 2, hi: 3, mid: 2 },
    { lo: 2, hi: 2, mid: 2 },
  ] as const;
  const { lo, hi, mid } = steps[Math.min(phase, steps.length - 1)] ?? steps[0]!;
  const accent = getFamilyTheme("ordering-search").accent;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <MarkerRow
        length={CELL_VALUES.length}
        markers={[
          { index: lo, label: "lo", color: accent },
          { index: mid, label: "mid", color: accent },
          { index: hi, label: "hi", color: accent },
        ]}
      />
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${CELL_VALUES.length}, 2.5rem)` }}
      >
        {CELL_VALUES.map((v, i) => (
          <Cell
            key={i}
            value={v}
            index={i}
            tone={i === mid ? "active" : i >= lo && i <= hi ? "kept" : "junk"}
          />
        ))}
      </div>
    </div>
  );
}

const FIB_NODES = [
  { x: 100, y: 20, v: "4", at: 0 },
  { x: 50, y: 62, v: "3", at: 1 },
  { x: 150, y: 62, v: "2", at: 2 },
  { x: 28, y: 104, v: "2", at: 3 },
  { x: 78, y: 104, v: "1", at: 4 },
  { x: 122, y: 104, v: "1", at: 5 },
  { x: 172, y: 104, v: "0", at: 6 },
] as const;

const FIB_EDGES = [
  [100, 20, 50, 62, 1],
  [100, 20, 150, 62, 2],
  [50, 62, 28, 104, 3],
  [50, 62, 78, 104, 4],
  [150, 62, 122, 104, 5],
  [150, 62, 172, 104, 6],
] as const;

function RecursiveGlyph({ phase }: { phase: number }) {
  const theme = getFamilyTheme("recursive-exploration");
  const show = (at: number) => phase >= at;
  return (
    <svg width="200" height="124" viewBox="0 0 200 124" aria-hidden>
      {FIB_EDGES.map(([x1, y1, x2, y2, at], i) =>
        show(at) ? (
          <line
            key={i}
            x1={x1}
            y1={y1 + 13}
            x2={x2}
            y2={y2 - 13}
            stroke={theme.accent}
            strokeOpacity="0.45"
            strokeWidth="2"
          />
        ) : null,
      )}
      {FIB_NODES.map((n) => (
        <g key={`${n.x}-${n.y}`}>
          <circle
            cx={n.x}
            cy={n.y}
            r="13"
            fill={show(n.at) ? theme.accent : "transparent"}
            stroke={theme.accent}
            strokeOpacity={show(n.at) ? 1 : 0.35}
            strokeWidth="2"
            className="transition-colors duration-300"
          />
          <text
            x={n.x}
            y={n.y + 4}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fontFamily="var(--font-mono)"
            fill={show(n.at) ? theme.onAccent : "var(--muted)"}
            className="transition-colors duration-300"
          >
            {n.v}
          </text>
        </g>
      ))}
    </svg>
  );
}

function StateGlyph({ phase }: { phase: number }) {
  const theme = getFamilyTheme("state-transition");
  const memo = [1, 1, 2, 3];
  return (
    <div className="grid grid-cols-2 gap-2">
      {memo.map((v, i) => {
        const filled = phase > i;
        return (
          <div
            key={i}
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-lg border font-display text-xl font-bold transition-colors duration-300",
              !filled && "border-border bg-surface/60",
            )}
            style={filled ? { backgroundColor: theme.accent } : undefined}
          >
            <span style={{ color: filled ? theme.onAccent : "var(--muted)" }}>
              {v}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const BFS_NODES = [
  { x: 90, y: 44, v: "0", at: 0 },
  { x: 30, y: 18, v: "1", at: 1 },
  { x: 150, y: 18, v: "2", at: 2 },
  { x: 30, y: 70, v: "3", at: 3 },
  { x: 150, y: 70, v: "4", at: 4 },
] as const;

function GraphsGlyph({ phase }: { phase: number }) {
  const theme = getFamilyTheme("relationships");
  const lit = (at: number) => phase >= at;
  return (
    <svg width="180" height="92" viewBox="0 0 180 92" aria-hidden>
      {BFS_NODES.slice(1).map((n) => (
        <line
          key={`${n.x}-${n.y}`}
          x1={BFS_NODES[0]!.x}
          y1={BFS_NODES[0]!.y}
          x2={n.x}
          y2={n.y}
          stroke="var(--border)"
          strokeWidth="2"
        />
      ))}
      {BFS_NODES.map((n) => (
        <g key={`${n.x}-${n.y}`}>
          <circle
            cx={n.x}
            cy={n.y}
            r="13"
            fill={lit(n.at) ? theme.accent : "transparent"}
            stroke={theme.accent}
            strokeOpacity={lit(n.at) ? 1 : 0.35}
            strokeWidth="2"
            className="transition-colors duration-300"
          />
          <text
            x={n.x}
            y={n.y + 4}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fontFamily="var(--font-mono)"
            fill={lit(n.at) ? theme.onAccent : "var(--muted)"}
            className="transition-colors duration-300"
          >
            {n.v}
          </text>
        </g>
      ))}
    </svg>
  );
}

function PriorityGlyph({ phase }: { phase: number }) {
  const accent = getFamilyTheme("priority-structures").accent;
  const heights = [16, 26, 36, 46];
  return (
    <div className="flex h-16 items-end gap-2">
      {heights.map((h, i) => {
        const shown = phase > i;
        return (
          <span
            key={h}
            aria-hidden
            className="w-4 rounded-t-md transition-all duration-300"
            style={{
              height: shown ? h : 0,
              backgroundColor: shown ? accent : accent,
              opacity: shown ? 1 : 0.15,
            }}
          />
        );
      })}
    </div>
  );
}

const GLYPHS: Record<FamilyId, (props: { phase: number }) => React.JSX.Element> =
  {
    "linear-traversal": LinearGlyph,
    "pointer-movement": PointersGlyph,
    "ordering-search": OrderingGlyph,
    "recursive-exploration": RecursiveGlyph,
    "state-transition": StateGlyph,
    relationships: GraphsGlyph,
    "priority-structures": PriorityGlyph,
  };

const CYCLES: Record<FamilyId, number> = {
  "linear-traversal": 8, // 6 fills + 2 hold
  "pointer-movement": 8, // 7-position walk + 2 hold
  "ordering-search": 6, // 4 narrowing steps + 2 hold
  "recursive-exploration": 9, // 7 nodes + 2 hold
  "state-transition": 6, // 4 cells + 2 hold
  relationships: 7, // 5 lights + 2 hold
  "priority-structures": 6, // 4 bars + 2 hold
};

function Dot({
  active,
  accent,
  label,
  onClick,
}: {
  active: boolean;
  accent: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active}
      onClick={onClick}
      className={cn(
        "h-1.5 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2",
        active ? "w-6" : "w-1.5",
      )}
      style={{ backgroundColor: active ? accent : "var(--border)" }}
    />
  );
}

export function FamilySpotlight({ stats }: { stats: SpotlightStats }) {
  const { beat, settled } = useSpotlightClock();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (settled) return;
    const id = window.setInterval(
      () => setActive((a) => (a + 1) % FAMILIES.length),
      DWELL_MS,
    );
    return () => window.clearInterval(id);
  }, [settled]);

  const family = FAMILIES[active]!;
  const theme = getFamilyTheme(family.id);
  const count = family.patterns.length;
  const phase = phaseOf(beat, settled, CYCLES[family.id]);
  const Glyph = GLYPHS[family.id];

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.65rem] font-medium tracking-wide text-muted uppercase">
          Curriculum at a glance
        </p>
        <span className="flex items-center gap-2 font-mono text-[10px] text-muted tabular-nums">
          {active + 1} / {FAMILIES.length}
          {!settled ? (
            <span className="inline-flex items-center gap-1 font-sans font-medium">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-good" />
              Live
            </span>
          ) : null}
        </span>
      </div>

      <div
        className="relative mt-3 min-h-[264px]"
        style={familyCssVars(family.id)}
        aria-live="polite"
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={family.id}
            initial={settled ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={settled ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col items-center"
            aria-label={`${family.shortTitle} — ${count} pattern${count === 1 ? "" : "s"}`}
          >
            <div
              aria-hidden
              className="flex w-full flex-1 items-center justify-center rounded-[length:var(--radius-md)]"
              style={{
                background: `radial-gradient(ellipse 75% 95% at 50% 45%, color-mix(in oklab, ${theme.accent} 14%, transparent), transparent 72%)`,
              }}
            >
              <Glyph phase={phase} />
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold tracking-tight">
              {family.title}
            </h3>
            <p className="mt-1 max-w-xs text-center text-xs leading-relaxed text-muted">
              {family.description}
            </p>
            <p className="mt-1.5 font-mono text-[10px] text-muted tabular-nums">
              {count} pattern{count === 1 ? "" : "s"}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {FAMILIES.map((f, i) => (
          <Dot
            key={f.id}
            active={i === active}
            accent={getFamilyTheme(f.id).accent}
            label={`Show ${f.shortTitle} family`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>

      <p className="mt-3 text-center font-mono text-[10px] text-muted/70 tabular-nums">
        {stats.modules} modules · {stats.concepts} concepts · {stats.lessons}{" "}
        lessons · {stats.problems} problems
      </p>
    </div>
  );
}