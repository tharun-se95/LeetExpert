"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { Cell, Legend, MarkerRow, type CellTone } from "@/components/viz/pieces";
import { numberArrayProp, speedProp } from "@/components/viz/props";
import type { VizCode, VizStep } from "@/components/viz/types";

const CODE: VizCode = {
  python: `def max_window_sum(nums, k):
    window_sum = sum(nums[:k])
    best = window_sum
    for right in range(k, len(nums)):
        left = right - k
        window_sum += nums[right] - nums[left]
        best = max(best, window_sum)
    return best`,
  typescript: `function maxWindowSum(nums: number[], k: number): number {
  let windowSum = nums.slice(0, k).reduce((a, b) => a + b, 0);
  let best = windowSum;
  for (let right = k; right < nums.length; right++) {
    const left = right - k;
    windowSum += nums[right] - nums[left];
    best = Math.max(best, windowSum);
  }
  return best;
}`,
};

interface SlidingWindowState {
  nums: number[];
  left: number;
  right: number;
  windowSum: number;
  best: number;
  leaving: number | null;
  entering: number | null;
}

function buildSteps(nums: number[], k: number): VizStep<SlidingWindowState>[] {
  const steps: VizStep<SlidingWindowState>[] = [];
  const n = nums.length;

  let windowSum = nums.slice(0, k).reduce((a, b) => a + b, 0);
  const primeSum = windowSum;
  let best = primeSum;

  steps.push({
    caption: `window_sum = sum(nums[0:${k}]) = ${primeSum} — prime the first window.`,
    line: { python: 2, typescript: 2 },
    state: { nums, left: 0, right: k - 1, windowSum: primeSum, best: primeSum, leaving: null, entering: null },
  });
  steps.push({
    caption: `best = ${primeSum} — the first window is our current best.`,
    line: { python: 3, typescript: 3 },
    state: { nums, left: 0, right: k - 1, windowSum: primeSum, best: primeSum, leaving: null, entering: null },
  });

  for (let right = k; right < n; right++) {
    const left = right - k;
    steps.push({
      caption: `left = ${right} - ${k} = ${left} — that's the element about to leave the window.`,
      line: { python: 5, typescript: 5 },
      state: { nums, left, right: right - 1, windowSum, best, leaving: null, entering: null },
    });

    const leavingVal = nums[left];
    const enteringVal = nums[right];
    const oldSum = windowSum;
    windowSum += enteringVal - leavingVal;
    const windowLeft = left + 1; // `left` names the index LEAVING, not the new window edge
    steps.push({
      caption: `window_sum = ${oldSum} + (${enteringVal} − ${leavingVal}) = ${windowSum}. Window slides to [${windowLeft}, ${right}].`,
      line: { python: 6, typescript: 6 },
      state: { nums, left: windowLeft, right, windowSum, best, leaving: left, entering: right },
    });

    const oldBest = best;
    best = Math.max(best, windowSum);
    steps.push({
      caption:
        best > oldBest
          ? `best = max(${oldBest}, ${windowSum}) = ${best} — new best!`
          : `best = max(${oldBest}, ${windowSum}) = ${best} — no improvement.`,
      line: { python: 7, typescript: 7 },
      state: { nums, left: windowLeft, right, windowSum, best, leaving: null, entering: null },
    });
  }

  steps.push({
    caption: `Return best = ${best}. Every slide after the prime cost O(1) — one subtraction, one addition.`,
    line: { python: 8, typescript: 9 },
    state: { nums, left: n - k, right: n - 1, windowSum, best, leaving: null, entering: null },
  });

  return steps;
}

function cellTone(state: SlidingWindowState, i: number): CellTone {
  if (state.leaving === i) return "dropped";
  if (state.entering === i) return "active";
  if (i >= state.left && i <= state.right) return "kept";
  return "plain";
}

export function SlidingWindowViz(props: Record<string, unknown>) {
  const { data, k, speed } = props;
  const nums = useMemo(() => numberArrayProp(data, [2, 1, 5, 1, 3, 2]), [data]);
  const windowK = typeof k === "number" && Number.isInteger(k) && k >= 1 && k <= nums.length ? k : 3;
  const steps = useMemo(() => buildSteps(nums, windowK), [nums, windowK]);

  return (
    <VizPlayer code={CODE} steps={steps} speedMs={speedProp(speed)} label="Sliding window trace" family="pointer-movement">
      {(state) => (
        <div className="flex flex-col items-start gap-3">
          <div className="flex gap-1.5">
            {state.nums.map((v, i) => (
              <Cell key={i} value={v} index={i} tone={cellTone(state, i)} />
            ))}
          </div>
          <MarkerRow
            length={state.nums.length}
            markers={[
              { index: state.left, label: "L", color: "var(--muted)" },
              { index: state.right, label: "R" },
            ]}
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
            <span>
              window sum <span className="text-foreground">{state.windowSum}</span>
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
              { tone: "kept", label: "in window" },
              { tone: "active", label: "entering" },
              { tone: "dropped", label: "leaving" },
            ]}
          />
        </div>
      )}
    </VizPlayer>
  );
}
