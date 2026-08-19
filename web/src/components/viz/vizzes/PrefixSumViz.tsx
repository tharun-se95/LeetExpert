"use client";

import { useMemo } from "react";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { StatusPanel, Tape, type Tone } from "@/components/viz/pieces";
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

function numsTone(state: PrefixSumState, i: number): Tone {
  if (state.queryL !== null && state.queryR !== null && i >= state.queryL && i <= state.queryR) {
    return "focal";
  }
  if (i === state.currentI) return "focal";
  if (i < state.builtUpTo) return "range";
  return "default";
}

function prefixTone(state: PrefixSumState, i: number): Tone {
  if (state.highlightPrefixIdx.includes(i)) return "focal";
  if (i <= state.builtUpTo) return "result";
  return "default";
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
    <VizPlayer code={CODE} steps={steps} speedMs={speedProp(speed)} label="Prefix sum trace" family="linear-traversal">
      {(state, ctx) => (
        <div className="flex flex-col items-start gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] text-muted">nums</span>
            <Tape
              values={state.nums}
              toneFor={(i) => numsTone(state, i)}
              focal={state.currentI}
              markers={
                state.queryL !== null && state.queryR !== null
                  ? [
                      { at: state.queryL, label: "l", color: "var(--muted)" },
                      { at: state.queryR, label: "r" },
                    ]
                  : []
              }
              reduced={ctx.reduced}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] text-muted">prefix</span>
            <Tape
              values={state.prefix.map((v, i) =>
                i <= state.builtUpTo ? v : null,
              )}
              toneFor={(i) => prefixTone(state, i)}
              focal={
                state.highlightPrefixIdx.length === 1
                  ? state.highlightPrefixIdx[0]
                  : null
              }
              reduced={ctx.reduced}
            />
          </div>
          <StatusPanel
            items={[
              {
                label: "query",
                value:
                  state.queryL === null
                    ? "—"
                    : `[${state.queryL}, ${state.queryR}]`,
              },
              ...(state.queryResult !== null
                ? [{ label: "sum", value: state.queryResult }]
                : []),
            ]}
          />
        </div>
      )}
    </VizPlayer>
  );
}
