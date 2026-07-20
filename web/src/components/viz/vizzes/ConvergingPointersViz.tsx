"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { Cell, Legend, MarkerRow, type CellTone } from "@/components/viz/pieces";
import { numberArrayProp, speedProp } from "@/components/viz/props";
import type { VizCode, VizStep } from "@/components/viz/types";

const CODE: VizCode = {
  python: `def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        s = arr[left] + arr[right]
        if s == target:
            return left, right
        if s < target:
            left += 1
        else:
            right -= 1
    return None`,
  typescript: `function twoSumSorted(arr: number[], target: number) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const s = arr[left] + arr[right];
    if (s === target) return [left, right];
    if (s < target) {
      left++;
    } else {
      right--;
    }
  }
  return null;
}`,
};

interface ConvergingState {
  left: number;
  right: number;
  /** Sum being examined this step, if any */
  sum: number | null;
  dead: number[];
  justDead: number | null;
  found: [number, number] | null;
  /** Pairs eliminated so far / total pairs */
  gone: number;
  total: number;
}

function buildSteps(arr: number[], target: number): VizStep<ConvergingState>[] {
  const steps: VizStep<ConvergingState>[] = [];
  const n = arr.length;
  const total = (n * (n - 1)) / 2;
  let left = 0;
  let right = n - 1;
  let gone = 0;
  let sums = 0;
  const dead: number[] = [];

  const snap = (over: Partial<ConvergingState> = {}): ConvergingState => ({
    left,
    right,
    sum: null,
    dead: [...dead],
    justDead: null,
    found: null,
    gone,
    total,
    ...over,
  });

  steps.push({
    caption: `left = 0, right = ${n - 1} — all ${total} pairs are still candidates. Sortedness makes the ends the extremes.`,
    line: { python: 2, typescript: 2 },
    state: snap(),
  });

  while (left < right) {
    const s = arr[left] + arr[right];
    sums += 1;
    steps.push({
      caption: `arr[${left}] + arr[${right}] = ${arr[left]} + ${arr[right]} = ${s}. Compare against target ${target}.`,
      line: { python: 4, typescript: 5 },
      state: snap({ sum: s }),
    });
    if (s === target) {
      steps.push({
        caption: `${s} == ${target} — return (${left}, ${right}). Only ${sums} sums were ever computed; batch elimination killed ${gone} of the ${total} pairs along the way.`,
        line: { python: 6, typescript: 6 },
        state: snap({ sum: s, found: [left, right] }),
      });
      return steps;
    }
    if (s < target) {
      const batch = right - left;
      gone += batch;
      dead.push(left);
      const deadIdx = left;
      left += 1;
      steps.push({
        caption: `${s} < ${target}: even ${arr[right]} — the largest live partner — leaves ${arr[deadIdx]} short. Index ${deadIdx} is dead; its ${batch} remaining pairs vanish (${gone} of ${total} eliminated).`,
        line: { python: 8, typescript: 8 },
        state: snap({ justDead: deadIdx }),
      });
    } else {
      const batch = right - left;
      gone += batch;
      dead.push(right);
      const deadIdx = right;
      right -= 1;
      steps.push({
        caption: `${s} > ${target}: even ${arr[left]} — the smallest live partner — overshoots with ${arr[deadIdx]}. Index ${deadIdx} is dead; its ${batch} remaining pairs vanish (${gone} of ${total} eliminated).`,
        line: { python: 10, typescript: 10 },
        state: snap({ justDead: deadIdx }),
      });
    }
  }

  steps.push({
    caption: `left == right — the window is empty and every pair was eliminated. No pair sums to ${target}.`,
    line: { python: 11, typescript: 13 },
    state: snap(),
  });
  return steps;
}

function cellTone(state: ConvergingState, i: number): CellTone {
  if (state.found && (i === state.found[0] || i === state.found[1])) return "active";
  if (state.dead.includes(i)) return "dropped";
  if (state.sum !== null && (i === state.left || i === state.right)) return "active";
  return "plain";
}

export function ConvergingPointersViz(props: Record<string, unknown>) {
  const { data, target, speed } = props;
  const arr = useMemo(
    () => [...numberArrayProp(data, [2, 7, 11, 15, 21])].sort((a, b) => a - b),
    [data],
  );
  const tgt = typeof target === "number" && Number.isFinite(target) ? target : 22;
  const steps = useMemo(() => buildSteps(arr, tgt), [arr, tgt]);

  return (
    <VizPlayer
      code={CODE}
      steps={steps}
      speedMs={speedProp(speed)}
      label="Converging pointers trace"
    >
      {(state) => (
        <div className="flex flex-col items-start gap-3">
          <div className="flex gap-1.5">
            {arr.map((v, i) => (
              <Cell key={i} value={v} index={i} tone={cellTone(state, i)} />
            ))}
          </div>
          <MarkerRow
            length={arr.length}
            markers={
              state.found
                ? [
                    { index: state.found[0], label: "L" },
                    { index: state.found[1], label: "R" },
                  ]
                : [
                    { index: state.left, label: "L" },
                    { index: state.right, label: "R", color: "var(--muted)" },
                  ]
            }
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
            <span>
              target <span className="text-foreground">{tgt}</span>
            </span>
            <span>
              sum{" "}
              <span className="text-foreground">
                {state.sum === null ? "—" : state.sum}
              </span>
            </span>
            <span className="rounded-md border border-border bg-surface px-1.5 py-0.5">
              pairs eliminated{" "}
              <motion.span
                key={state.gone}
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                className="inline-block font-semibold text-accent"
              >
                {state.gone}
              </motion.span>
              /{state.total}
            </span>
          </div>
          <Legend
            items={[
              { tone: "active", label: "current pair" },
              { tone: "dropped", label: "eliminated" },
              { tone: "plain", label: "live window" },
            ]}
          />
        </div>
      )}
    </VizPlayer>
  );
}
