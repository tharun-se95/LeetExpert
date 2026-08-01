"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { Cell, Legend, type CellTone } from "@/components/viz/pieces";
import { numberArrayProp, speedProp } from "@/components/viz/props";
import type { VizCode, VizStep } from "@/components/viz/types";

const CODE: VizCode = {
  python: `def max_subarray(nums):
    best_ending_here = nums[0]
    best = nums[0]
    for x in nums[1:]:
        best_ending_here = max(x, best_ending_here + x)
        best = max(best, best_ending_here)
    return best`,
  typescript: `function maxSubArray(nums: number[]): number {
  let bestEndingHere = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    bestEndingHere = Math.max(nums[i], bestEndingHere + nums[i]);
    best = Math.max(best, bestEndingHere);
  }
  return best;
}`,
};

interface KadaneState {
  nums: number[];
  i: number;
  bestEndingHere: number;
  start: number;
  best: number;
  bestStart: number;
  bestEnd: number;
  restarted: boolean;
}

function buildSteps(nums: number[]): VizStep<KadaneState>[] {
  const steps: VizStep<KadaneState>[] = [];
  const n = nums.length;
  let bestEndingHere = nums[0];
  let start = 0;
  let best = nums[0];
  let bestStart = 0;
  let bestEnd = 0;

  const snap = (over: Partial<KadaneState> = {}): KadaneState => ({
    nums,
    i: 0,
    bestEndingHere,
    start,
    best,
    bestStart,
    bestEnd,
    restarted: false,
    ...over,
  });

  steps.push({
    caption: `best_ending_here = best = nums[0] = ${nums[0]} — the first element is trivially its own best subarray.`,
    line: { python: 3, typescript: 3 },
    state: snap({ i: 0 }),
  });

  for (let i = 1; i < n; i++) {
    const x = nums[i];
    const oldBEH = bestEndingHere;
    const extendVal = oldBEH + x;
    const restart = x > extendVal;
    bestEndingHere = Math.max(x, extendVal);
    if (restart) start = i;
    steps.push({
      caption: restart
        ? `best_ending_here = max(${x}, ${extendVal}) = ${x} — restart here; the running total (${oldBEH}) was dragging things down.`
        : `best_ending_here = max(${x}, ${extendVal}) = ${bestEndingHere} — extend; the running total is still helping.`,
      line: { python: 5, typescript: 5 },
      state: snap({ i, bestEndingHere, start, restarted: restart }),
    });

    const oldBest = best;
    const improved = bestEndingHere > best;
    best = Math.max(best, bestEndingHere);
    if (improved) {
      bestStart = start;
      bestEnd = i;
    }
    steps.push({
      caption: improved
        ? `best = max(${oldBest}, ${bestEndingHere}) = ${best} — new best subarray!`
        : `best = max(${oldBest}, ${bestEndingHere}) = ${best} — no improvement.`,
      line: { python: 6, typescript: 6 },
      state: snap({ i, bestEndingHere, start, best, bestStart, bestEnd }),
    });
  }

  steps.push({
    caption: `Return best = ${best} — subarray [${bestStart}, ${bestEnd}] achieves it.`,
    line: { python: 7, typescript: 8 },
    state: snap({ i: n - 1, best, bestStart, bestEnd }),
  });

  return steps;
}

function cellTone(state: KadaneState, i: number): CellTone {
  if (state.i === i) return "active";
  if (i >= state.start && i <= state.i) return "kept";
  if (i >= state.bestStart && i <= state.bestEnd) return "resolved";
  return "plain";
}

export function KadaneViz(props: Record<string, unknown>) {
  const { data, speed } = props;
  const nums = useMemo(
    () => numberArrayProp(data, [-2, 1, -3, 4, -1, 2, 1, -5, 4]),
    [data],
  );
  const steps = useMemo(() => buildSteps(nums), [nums]);

  return (
    <VizPlayer code={CODE} steps={steps} speedMs={speedProp(speed)} label="Kadane's algorithm trace" family="linear-traversal">
      {(state) => (
        <div className="flex flex-col items-start gap-3">
          <div className="flex gap-1.5">
            {state.nums.map((v, i) => (
              <Cell key={i} value={v} index={i} tone={cellTone(state, i)} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
            <span>
              best_ending_here <span className="text-foreground">{state.bestEndingHere}</span>
            </span>
            <span className="rounded-md border border-border bg-surface px-1.5 py-0.5">
              best{" "}
              <motion.span
                key={state.best}
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                className="inline-block font-semibold text-accent"
              >
                {state.best}
              </motion.span>
            </span>
          </div>
          <Legend
            items={[
              { tone: "kept", label: "subarray ending here" },
              { tone: "resolved", label: "best subarray so far" },
              { tone: "active", label: "current element" },
            ]}
          />
        </div>
      )}
    </VizPlayer>
  );
}
