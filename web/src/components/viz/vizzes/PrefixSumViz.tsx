"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { Cell, Legend, type CellTone } from "@/components/viz/pieces";
import { numberArrayProp, speedProp } from "@/components/viz/props";
import type { VizCode, VizStep } from "@/components/viz/types";

const CODE: VizCode = {
  python: `def build_prefix(nums):
    prefix = [0] * (len(nums) + 1)
    for i, x in enumerate(nums):
        prefix[i + 1] = prefix[i] + x
    return prefix

def range_sum(prefix, l, r):
    return prefix[r + 1] - prefix[l]`,
  typescript: `function buildPrefix(nums: number[]): number[] {
  const prefix = new Array(nums.length + 1).fill(0);
  for (let i = 0; i < nums.length; i++) {
    prefix[i + 1] = prefix[i] + nums[i];
  }
  return prefix;
}

function rangeSum(prefix: number[], l: number, r: number): number {
  return prefix[r + 1] - prefix[l];
}`,
};

interface PrefixSumState {
  nums: number[];
  prefix: number[];
  builtUpTo: number;
  currentI: number | null;
  queryL: number | null;
  queryR: number | null;
  highlightPrefixIdx: number[];
  queryResult: number | null;
}

function buildSteps(
  nums: number[],
  queries: { l: number; r: number }[],
): VizStep<PrefixSumState>[] {
  const steps: VizStep<PrefixSumState>[] = [];
  const n = nums.length;
  const prefix = new Array(n + 1).fill(0);

  const snap = (over: Partial<PrefixSumState> = {}): PrefixSumState => ({
    nums,
    prefix: [...prefix],
    builtUpTo: 0,
    currentI: null,
    queryL: null,
    queryR: null,
    highlightPrefixIdx: [],
    queryResult: null,
    ...over,
  });

  steps.push({
    caption: `prefix[0] = 0 — the sum of nothing. prefix gets ${n + 1} entries for ${n} elements.`,
    line: { python: 2, typescript: 2 },
    state: snap(),
  });

  for (let i = 0; i < n; i++) {
    const before = prefix[i];
    prefix[i + 1] = before + nums[i];
    steps.push({
      caption: `prefix[${i + 1}] = prefix[${i}] + nums[${i}] = ${before} + ${nums[i]} = ${prefix[i + 1]}.`,
      line: { python: 4, typescript: 4 },
      state: snap({ builtUpTo: i + 1, currentI: i }),
    });
  }

  for (const { l, r } of queries) {
    steps.push({
      caption: `sum(nums[${l}..${r}]): look up prefix[${r + 1}] = ${prefix[r + 1]} — everything through index ${r}.`,
      line: { python: 8, typescript: 10 },
      state: snap({ builtUpTo: n, queryL: l, queryR: r, highlightPrefixIdx: [r + 1] }),
    });
    const result = prefix[r + 1] - prefix[l];
    steps.push({
      caption: `prefix[${r + 1}] − prefix[${l}] = ${prefix[r + 1]} − ${prefix[l]} = ${result}. One subtraction — O(1), regardless of how wide [${l}, ${r}] is.`,
      line: { python: 8, typescript: 10 },
      state: snap({
        builtUpTo: n,
        queryL: l,
        queryR: r,
        highlightPrefixIdx: [l, r + 1],
        queryResult: result,
      }),
    });
  }

  return steps;
}

function numsTone(state: PrefixSumState, i: number): CellTone {
  if (state.queryL !== null && state.queryR !== null && i >= state.queryL && i <= state.queryR) {
    return "active";
  }
  if (i === state.currentI) return "active";
  if (i < state.builtUpTo) return "kept";
  return "plain";
}

function prefixTone(state: PrefixSumState, i: number): CellTone {
  if (state.highlightPrefixIdx.includes(i)) return "active";
  if (i <= state.builtUpTo) return "resolved";
  return "plain";
}

export function PrefixSumViz(props: Record<string, unknown>) {
  const { data, queries, speed } = props;
  const nums = useMemo(() => numberArrayProp(data, [2, 4, 1, 5, 3]), [data]);
  const queryList = useMemo(() => {
    if (
      Array.isArray(queries) &&
      queries.every(
        (q) =>
          q &&
          typeof q === "object" &&
          typeof (q as { l?: unknown }).l === "number" &&
          typeof (q as { r?: unknown }).r === "number",
      )
    ) {
      return (queries as { l: number; r: number }[]).slice(0, 4);
    }
    return [
      { l: 1, r: 3 },
      { l: 2, r: 4 },
    ];
  }, [queries]);
  const steps = useMemo(() => buildSteps(nums, queryList), [nums, queryList]);

  return (
    <VizPlayer code={CODE} steps={steps} speedMs={speedProp(speed)} label="Prefix sum trace">
      {(state) => (
        <div className="flex flex-col items-start gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] text-muted">nums</span>
            <div className="flex gap-1.5">
              {state.nums.map((v, i) => (
                <Cell key={i} value={v} index={i} tone={numsTone(state, i)} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] text-muted">prefix</span>
            <div className="flex gap-1.5">
              {state.prefix.map((v, i) => (
                <Cell
                  key={i}
                  value={i <= state.builtUpTo ? v : ""}
                  index={i}
                  tone={prefixTone(state, i)}
                  pop={state.currentI !== null && i === state.currentI + 1 && i === state.builtUpTo}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
            <span>
              query{" "}
              <span className="text-foreground">
                {state.queryL === null ? "—" : `[${state.queryL}, ${state.queryR}]`}
              </span>
            </span>
            {state.queryResult !== null ? (
              <span className="rounded-md border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-accent">
                sum{" "}
                <motion.span
                  key={state.queryResult}
                  initial={{ scale: 1.4 }}
                  animate={{ scale: 1 }}
                  className="inline-block font-semibold"
                >
                  {state.queryResult}
                </motion.span>
              </span>
            ) : null}
          </div>
          <Legend
            items={[
              { tone: "kept", label: "summed in" },
              { tone: "resolved", label: "prefix computed" },
              { tone: "active", label: "in query / lookup" },
            ]}
          />
        </div>
      )}
    </VizPlayer>
  );
}
