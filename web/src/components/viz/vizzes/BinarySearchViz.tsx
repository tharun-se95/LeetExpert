"use client";

import { useMemo } from "react";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { StatusPanel, Tape, type Tone } from "@/components/viz/pieces";
import { numberArrayProp, speedProp } from "@/components/viz/props";
import type { VizCode, VizStep } from "@/components/viz/types";

const CODE: VizCode = {
  python: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
  typescript: `function binarySearch(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return -1;
}`,
};

interface BinarySearchState {
  arr: number[];
  target: number;
  lo: number;
  hi: number;
  mid: number | null;
  found: number | null;
  dead: number[];
  empty: boolean;
}

function buildSteps(arr: number[], target: number): VizStep<BinarySearchState>[] {
  const steps: VizStep<BinarySearchState>[] = [];
  let lo = 0;
  let hi = arr.length - 1;
  const dead: number[] = [];

  const snap = (over: Partial<BinarySearchState> = {}): BinarySearchState => ({
    arr,
    target,
    lo,
    hi,
    mid: null,
    found: null,
    dead: [...dead],
    empty: false,
    ...over,
  });

  for (;;) {
    steps.push({
      caption:
        lo <= hi
          ? `lo=${lo}, hi=${hi} — range [${lo}, ${hi}] is non-empty, continue.`
          : `lo=${lo} > hi=${hi} — the range is empty.`,
      line: { python: 3, typescript: 4 },
      state: snap(),
    });
    if (lo > hi) break;

    const mid = lo + Math.floor((hi - lo) / 2);
    steps.push({
      caption: `mid = ${lo} + (${hi} − ${lo}) // 2 = ${mid}. Examine arr[${mid}] = ${arr[mid]}.`,
      line: { python: 4, typescript: 5 },
      state: snap({ mid }),
    });

    if (arr[mid] === target) {
      steps.push({
        caption: `arr[${mid}] == ${target} — found! Return ${mid}.`,
        line: { python: 6, typescript: 7 },
        state: snap({ mid, found: mid }),
      });
      return steps;
    }

    if (arr[mid] < target) {
      for (let i = lo; i <= mid; i++) dead.push(i);
      const oldLo = lo;
      lo = mid + 1;
      steps.push({
        caption: `arr[${mid}]=${arr[mid]} < ${target} — everything in [${oldLo}, ${mid}] is too small, sortedness proves it. lo = ${mid} + 1 = ${lo}.`,
        line: { python: 8, typescript: 9 },
        state: snap({ mid }),
      });
    } else {
      for (let i = mid; i <= hi; i++) dead.push(i);
      const oldHi = hi;
      hi = mid - 1;
      steps.push({
        caption: `arr[${mid}]=${arr[mid]} > ${target} — everything in [${mid}, ${oldHi}] is too big, sortedness proves it. hi = ${mid} − 1 = ${hi}.`,
        line: { python: 10, typescript: 11 },
        state: snap({ mid }),
      });
    }
  }

  steps.push({
    caption: `Return -1 — every index was checked or eliminated with a proof; ${target} is not present.`,
    line: { python: 11, typescript: 14 },
    state: snap({ empty: true }),
  });

  return steps;
}

function toneAt(state: BinarySearchState, i: number): Tone {
  if (state.found === i) return "result";
  if (state.mid === i) return "focal";
  if (state.dead.includes(i)) return "eliminated";
  return "range";
}

export function BinarySearchViz(props: Record<string, unknown>) {
  const { data, target, speed, autoPlay } = props;
  const arr = useMemo(
    () => [...numberArrayProp(data, [1, 3, 5, 7, 9, 11, 13])].sort((a, b) => a - b),
    [data],
  );
  const tgt = typeof target === "number" && Number.isFinite(target) ? target : 9;
  const steps = useMemo(() => buildSteps(arr, tgt), [arr, tgt]);

  return (
    <VizPlayer
      code={CODE}
      steps={steps}
      speedMs={speedProp(speed)}
      autoPlay={autoPlay === true}
      label="Binary search trace"
      family="ordering-search"
    >
      {(state, ctx) => (
        <div className="flex flex-col items-start gap-3">
          <Tape
            values={state.arr}
            toneFor={(i) => toneAt(state, i)}
            focal={state.mid}
            markers={[
              { at: state.lo, label: "lo", color: "var(--muted)" },
              { at: state.hi, label: "hi", color: "var(--muted)" },
              ...(state.mid !== null ? [{ at: state.mid, label: "mid" }] : []),
            ].filter((m) => m.at >= 0 && m.at < state.arr.length)}
            bracket={
              state.empty || state.lo > state.hi
                ? null
                : { lo: state.lo, hi: state.hi }
            }
            reduced={ctx.reduced}
          />
          <StatusPanel
            items={[
              { label: "target", value: state.target },
              {
                label: "range",
                value: state.empty ? "∅" : `[${state.lo}, ${state.hi}]`,
              },
            ]}
          />
        </div>
      )}
    </VizPlayer>
  );
}
