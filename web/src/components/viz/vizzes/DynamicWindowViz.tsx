"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { Cell, Legend, MarkerRow, type CellTone } from "@/components/viz/pieces";
import { numberArrayProp, speedProp } from "@/components/viz/props";
import type { VizCode, VizStep } from "@/components/viz/types";

const CODE: VizCode = {
  python: `def min_subarray_len(target, nums):
    left = 0
    window_sum = 0
    best = float("inf")
    for right in range(len(nums)):
        window_sum += nums[right]
        while window_sum >= target:
            best = min(best, right - left + 1)
            window_sum -= nums[left]
            left += 1
    return best if best != float("inf") else 0`,
  typescript: `function minSubArrayLen(target: number, nums: number[]): number {
  let left = 0;
  let windowSum = 0;
  let best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    windowSum += nums[right];
    while (windowSum >= target) {
      best = Math.min(best, right - left + 1);
      windowSum -= nums[left];
      left++;
    }
  }
  return best === Infinity ? 0 : best;
}`,
};

interface DynamicWindowState {
  nums: number[];
  target: number;
  left: number;
  right: number | null;
  windowSum: number;
  best: number | null;
  entering: number | null;
  leaving: number | null;
  valid: boolean;
  done: boolean;
}

function buildSteps(nums: number[], target: number): VizStep<DynamicWindowState>[] {
  const steps: VizStep<DynamicWindowState>[] = [];
  const n = nums.length;
  let left = 0;
  let windowSum = 0;
  let best: number | null = null;

  const snap = (over: Partial<DynamicWindowState> = {}): DynamicWindowState => ({
    nums,
    target,
    left,
    right: null,
    windowSum,
    best,
    entering: null,
    leaving: null,
    valid: windowSum >= target,
    done: false,
    ...over,
  });

  for (let right = 0; right < n; right++) {
    windowSum += nums[right];
    steps.push({
      caption: `window_sum += nums[${right}] = ${nums[right]} → window_sum = ${windowSum}. Window is now [${left}, ${right}].`,
      line: { python: 6, typescript: 6 },
      state: snap({ right, entering: right, valid: windowSum >= target }),
    });

    for (;;) {
      const valid = windowSum >= target;
      steps.push({
        caption: valid
          ? `window_sum = ${windowSum} ≥ ${target} — valid. Shrink while it holds.`
          : `window_sum = ${windowSum} < ${target} — invalid. Stop shrinking, expand right again.`,
        line: { python: 7, typescript: 7 },
        state: snap({ right, valid }),
      });
      if (!valid) break;

      const len = right - left + 1;
      const oldBestLabel = best === null ? "∞" : String(best);
      const improved = best === null || len < best;
      best = best === null ? len : Math.min(best, len);
      steps.push({
        caption: improved
          ? `best = min(${oldBestLabel}, ${len}) = ${best} — new best!`
          : `best = min(${oldBestLabel}, ${len}) = ${best} — no improvement.`,
        line: { python: 8, typescript: 8 },
        state: snap({ right, best, valid: true }),
      });

      const leavingIdx = left;
      windowSum -= nums[left];
      left += 1;
      steps.push({
        caption: `window_sum -= nums[${leavingIdx}] = ${windowSum}; left → ${left}. Shrinking from the left.`,
        line: { python: 9, typescript: 9 },
        state: snap({ right, best, leaving: leavingIdx }),
      });
    }
  }

  steps.push({
    caption: `Return ${best ?? 0} — the shortest window whose sum reached ${target}.`,
    line: { python: 11, typescript: 13 },
    state: snap({ right: n - 1, done: true }),
  });

  return steps;
}

function cellTone(state: DynamicWindowState, i: number): CellTone {
  if (state.leaving === i) return "dropped";
  if (state.entering === i) return "active";
  if (state.right !== null && i >= state.left && i <= state.right) return "kept";
  return "plain";
}

export function DynamicWindowViz(props: Record<string, unknown>) {
  const { data, target, speed } = props;
  const nums = useMemo(() => numberArrayProp(data, [2, 3, 1, 2, 4, 3]), [data]);
  const tgt = typeof target === "number" && Number.isFinite(target) ? target : 7;
  const steps = useMemo(() => buildSteps(nums, tgt), [nums, tgt]);

  return (
    <VizPlayer code={CODE} steps={steps} speedMs={speedProp(speed)} label="Dynamic window trace">
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
              { index: state.left, label: "left", color: "var(--muted)" },
              ...(state.right !== null ? [{ index: state.right, label: "right" }] : []),
            ]}
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
            <span>
              target <span className="text-foreground">{state.target}</span>
            </span>
            <span>
              window sum{" "}
              <span className={state.valid ? "text-accent" : "text-foreground"}>{state.windowSum}</span>
            </span>
            <span className="rounded-md border border-border bg-surface px-1.5 py-0.5">
              best{" "}
              <motion.span
                key={state.best ?? "none"}
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                className="inline-block font-semibold text-accent"
              >
                {state.best ?? "∞"}
              </motion.span>
            </span>
          </div>
          <Legend
            items={[
              { tone: "kept", label: "in window" },
              { tone: "active", label: "entering" },
              { tone: "dropped", label: "leaving (shrink)" },
            ]}
          />
        </div>
      )}
    </VizPlayer>
  );
}
