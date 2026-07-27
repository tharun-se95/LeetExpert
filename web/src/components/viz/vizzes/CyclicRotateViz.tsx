"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { Cell, Legend, type CellTone } from "@/components/viz/pieces";
import { numberArrayProp, speedProp } from "@/components/viz/props";
import type { VizCode, VizStep } from "@/components/viz/types";

/**
 * Rotation by cycle chasing, traced on the ring. Each index points at its
 * destination (i + k) mod n; the token carries the displaced value around
 * one cycle until it returns to where it started. When k and n share a
 * factor the arrows form SEVERAL disjoint cycles, so the outer loop has to
 * notice a closed cycle and restart from a fresh index — which is the whole
 * reason this algorithm is fiddly, and the thing the trace makes visible.
 *
 * The snippets are the SAME code the lesson's expert-variant reveal shows,
 * so the panel and the prose never drift apart. The two languages have
 * different line counts (TypeScript carries its own gcd helper), so every
 * step below cites each language's number independently.
 */
const CODE: VizCode = {
  python: `from math import gcd

def rotate_cycles(nums, k):
    n = len(nums)
    k %= n
    if k == 0:
        return
    for start in range(gcd(n, k)):
        held = nums[start]
        i = start
        while True:
            j = (i + k) % n
            nums[j], held = held, nums[j]
            i = j
            if i == start:
                break`,
  typescript: `function gcd(a: number, b: number): number {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function rotateCycles(nums: number[], k: number): void {
  const n = nums.length;
  k %= n;
  if (k === 0) return;
  for (let start = 0; start < gcd(n, k); start++) {
    let held = nums[start];
    let i = start;
    do {
      const j = (i + k) % n;
      [nums[j], held] = [held, nums[j]];
      i = j;
    } while (i !== start);
  }
}`,
};

/** `k %= n` */
const LINE_REDUCE_K = { python: 5, typescript: 8 };
/** `if k == 0: return` */
const LINE_EARLY_OUT = { python: 6, typescript: 9 };
/** the `for start in range(gcd(n, k))` header */
const LINE_CYCLE_LOOP = { python: 8, typescript: 10 };
/** `held = nums[start]` */
const LINE_PICK_UP = { python: 9, typescript: 11 };
/** `j = (i + k) % n` */
const LINE_DESTINATION = { python: 12, typescript: 14 };
/** the swap that places the held value */
const LINE_PLACE = { python: 13, typescript: 15 };
/** the `i == start` cycle-closed test */
const LINE_CLOSED = { python: 15, typescript: 17 };

interface CycleState {
  nums: number[];
  /** index the current cycle began at */
  start: number | null;
  /** index the token is sitting on */
  current: number | null;
  /** destination being written this step */
  next: number | null;
  /** value in hand, not yet placed */
  held: number | null;
  /** indices whose final value has been written */
  placed: boolean[];
  /** which cycle we are on, for colour */
  cycle: number;
  moved: number;
  done: boolean;
}

function gcd(a: number, b: number): number {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function buildSteps(data: number[], rawK: number): VizStep<CycleState>[] {
  const nums = [...data];
  const n = nums.length;
  const k = ((Math.round(rawK) % n) + n) % n;
  const steps: VizStep<CycleState>[] = [];
  const placed = new Array<boolean>(n).fill(false);

  let moved = 0;
  let cycle = 0;

  const snap = (over: Partial<CycleState> = {}): CycleState => ({
    nums: [...nums],
    start: null,
    current: null,
    next: null,
    held: null,
    placed: [...placed],
    cycle,
    moved,
    done: false,
    ...over,
  });

  steps.push({
    caption: `n = ${n}, k = ${k}. Every index i must end up at (i + ${k}) mod ${n}.`,
    line: LINE_REDUCE_K,
    state: snap(),
  });

  if (k === 0) {
    steps.push({
      caption: "k reduces to 0 — the array is already in its rotated order.",
      line: LINE_EARLY_OUT,
      state: snap({ done: true }),
    });
    return steps;
  }

  const cycleCount = gcd(n, k);
  steps.push({
    caption: `gcd(${n}, ${k}) = ${cycleCount}, so the arrows split the indices into ${cycleCount} ${cycleCount === 1 ? "cycle" : "disjoint cycles"} — that many separate starting points.`,
    line: LINE_CYCLE_LOOP,
    state: snap(),
  });

  for (let start = 0; start < cycleCount; start++) {
    cycle = start;
    let current = start;
    let held = nums[start];

    steps.push({
      caption: `Cycle ${start + 1} of ${cycleCount}: pick up ${held} from index ${start}. That slot is now free to overwrite.`,
      line: LINE_PICK_UP,
      state: snap({ start, current, held }),
    });

    for (;;) {
      const nxt = (current + k) % n;
      steps.push({
        caption: `Destination of ${current} is (${current} + ${k}) mod ${n} = ${nxt}.`,
        line: LINE_DESTINATION,
        state: snap({ start, current, next: nxt, held }),
      });

      const displaced = nums[nxt];
      nums[nxt] = held;
      held = displaced;
      placed[nxt] = true;
      current = nxt;
      moved += 1;

      steps.push({
        caption: `Drop ${nums[nxt]} into slot ${nxt} — that one is final. Pick up the ${held} it displaced. ${moved} of ${n} placed.`,
        line: LINE_PLACE,
        state: snap({ start, current, next: null, held }),
      });

      if (current === start) {
        steps.push({
          caption:
            moved < n
              ? `Back at index ${start}, so this cycle is closed — but only ${moved} of ${n} are placed. Chasing further here would just retrace the same ${moved} slots.`
              : `Back at index ${start}, and all ${n} elements are placed.`,
          line: LINE_CLOSED,
          state: snap({ start, current, held: null }),
        });
        break;
      }
    }
  }

  steps.push({
    caption: `All ${cycleCount} ${cycleCount === 1 ? "cycle" : "cycles"} chased, each element written exactly once: [${nums.join(", ")}].`,
    line: LINE_CYCLE_LOOP,
    state: snap({ done: true }),
  });

  return steps;
}

const RING = 250;
const RING_C = RING / 2;
const RING_R = 84;
const NODE_R = 17;

function angleFor(index: number, n: number): number {
  return (Math.PI * 2 * index) / n - Math.PI / 2;
}

function pointAt(radius: number, angle: number): { x: number; y: number } {
  return {
    x: RING_C + radius * Math.cos(angle),
    y: RING_C + radius * Math.sin(angle),
  };
}

function cellTone(state: CycleState, i: number): CellTone {
  if (state.next === i) return "active";
  if (state.placed[i]) return "resolved";
  if (state.current === i && state.held !== null) return "junk";
  return "plain";
}

export function CyclicRotateViz(props: Record<string, unknown>) {
  const { data, k, speed } = props;
  const nums = numberArrayProp(data, [1, 2, 3, 4, 5, 6]);
  const shift = typeof k === "number" && Number.isFinite(k) ? k : 2;
  const steps = useMemo(() => buildSteps(nums, shift), [nums, shift]);
  const n = nums.length;

  return (
    <VizPlayer
      code={CODE}
      steps={steps}
      speedMs={speedProp(speed)}
      label={`Cycle-chasing rotation of ${n} elements by ${shift}`}
    >
      {(state, ctx) => {
        const tokenAt =
          state.current !== null
            ? pointAt(RING_R, angleFor(state.current, n))
            : null;

        return (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <svg
              viewBox={`0 0 ${RING} ${RING}`}
              className="h-auto w-full max-w-[260px] shrink-0"
              aria-hidden
            >
              <defs>
                <marker
                  id="rotate-cycle-arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth={5}
                  markerHeight={5}
                  orient="auto-start-reverse"
                >
                  <path d="M0 0 L10 5 L0 10 Z" fill="var(--accent)" />
                </marker>
              </defs>

              <circle
                cx={RING_C}
                cy={RING_C}
                r={RING_R}
                fill="none"
                stroke="var(--border)"
                strokeWidth={1}
                strokeDasharray="2 4"
              />

              {/* the hop being taken this step */}
              {state.current !== null && state.next !== null
                ? (() => {
                    const from = pointAt(
                      RING_R - NODE_R - 3,
                      angleFor(state.current, n),
                    );
                    const to = pointAt(
                      RING_R - NODE_R - 3,
                      angleFor(state.next, n),
                    );
                    const midAngle = Math.atan2(
                      (from.y + to.y) / 2 - RING_C,
                      (from.x + to.x) / 2 - RING_C,
                    );
                    const control = pointAt(RING_R * 0.28, midAngle);
                    return (
                      <path
                        d={`M ${from.x} ${from.y} Q ${control.x} ${control.y} ${to.x} ${to.y}`}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth={1.75}
                        markerEnd="url(#rotate-cycle-arrow)"
                      />
                    );
                  })()
                : null}

              {/* index nodes, carrying their current value */}
              {Array.from({ length: n }, (_, i) => {
                const at = pointAt(RING_R, angleFor(i, n));
                const isPlaced = state.placed[i];
                const isStart = state.start === i;
                const stroke = isPlaced
                  ? "var(--accent)"
                  : isStart
                    ? "var(--muted)"
                    : "var(--border)";
                return (
                  <g key={i}>
                    <circle
                      cx={at.x}
                      cy={at.y}
                      r={NODE_R}
                      fill={isPlaced ? "var(--accent)" : "var(--background)"}
                      fillOpacity={isPlaced ? 0.85 : 1}
                      stroke={stroke}
                      strokeWidth={isStart ? 2.25 : 1.5}
                      strokeDasharray={isStart && !isPlaced ? "3 2" : undefined}
                    />
                    <text
                      x={at.x}
                      y={at.y}
                      fontSize={12}
                      fontWeight={700}
                      fill={
                        isPlaced ? "var(--background)" : "var(--foreground)"
                      }
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontFamily="var(--font-mono), monospace"
                    >
                      {state.nums[i]}
                    </text>
                    <text
                      x={pointAt(RING_R + NODE_R + 11, angleFor(i, n)).x}
                      y={pointAt(RING_R + NODE_R + 11, angleFor(i, n)).y}
                      fontSize={9}
                      fill="var(--muted)"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontFamily="var(--font-mono), monospace"
                    >
                      {i}
                    </text>
                  </g>
                );
              })}

              {/* the travelling token — this is the value in hand */}
              {tokenAt && state.held !== null ? (
                <motion.g
                  animate={{ x: tokenAt.x, y: tokenAt.y }}
                  initial={false}
                  transition={
                    ctx.reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 260, damping: 26 }
                  }
                >
                  <circle
                    r={9}
                    cx={0}
                    cy={-NODE_R - 12}
                    fill="var(--accent)"
                    stroke="var(--background)"
                    strokeWidth={2}
                  />
                  <text
                    x={0}
                    y={-NODE_R - 12}
                    fontSize={9}
                    fontWeight={700}
                    fill="var(--background)"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="var(--font-mono), monospace"
                  >
                    {state.held}
                  </text>
                </motion.g>
              ) : null}

              <text
                x={RING_C}
                y={RING_C}
                fontSize={11}
                fill="var(--muted)"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="var(--font-mono), monospace"
              >
                {state.held !== null ? `holding ${state.held}` : "hands empty"}
              </text>
            </svg>

            <div className="flex flex-col items-start gap-3">
              <div className="flex flex-wrap gap-1.5">
                {state.nums.map((v, i) => (
                  <Cell
                    key={i}
                    value={v}
                    index={i}
                    tone={cellTone(state, i)}
                    pop={state.placed[i] && state.current === i}
                  />
                ))}
              </div>
              <Legend
                items={[
                  { tone: "resolved", label: "final position" },
                  { tone: "active", label: "being written" },
                  { tone: "plain", label: "not yet moved" },
                ]}
              />
              <p className="font-mono text-[11px] text-muted">
                {`moved ${state.moved} / ${n}`}
                {state.start !== null ? ` · cycle from ${state.start}` : ""}
              </p>
            </div>
          </div>
        );
      }}
    </VizPlayer>
  );
}
