"use client";

import { useMemo } from "react";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { StatusPanel, Tape, type Tone } from "@/components/viz/pieces";
import { numberArrayProp, speedProp } from "@/components/viz/props";
import type { VizCode, VizStep } from "@/components/viz/types";

/**
 * Rotation by three reversals — the lesson's primary solution, which
 * previously had no visual at all (only the expert cycle-chasing variant
 * did, and that one sits inside a collapsed reveal).
 *
 * The whole insight is positional: [A | B] must become [B | A], and
 * reversing everything gets the BLOCKS right while scrambling each block
 * internally. Seeing the wrong-but-nearly-right middle state is the point —
 * prose describes it, but the array showing [7,6,5,4,3,2,1] and then
 * un-scrambling in two moves is what makes it click.
 */
const CODE: VizCode = {
  python: `def rotate(nums, k):
    n = len(nums)
    k %= n
    reverse(nums, 0, n - 1)
    reverse(nums, 0, k - 1)
    reverse(nums, k, n - 1)

def reverse(nums, i, j):
    while i < j:
        nums[i], nums[j] = nums[j], nums[i]
        i += 1
        j -= 1`,
  typescript: `function rotate(nums: number[], k: number): void {
  const n = nums.length;
  k %= n;
  reverse(nums, 0, n - 1);
  reverse(nums, 0, k - 1);
  reverse(nums, k, n - 1);
}

function reverse(nums: number[], i: number, j: number): void {
  while (i < j) {
    [nums[i], nums[j]] = [nums[j], nums[i]];
    i++;
    j--;
  }
}`,
};

/** `k %= n` */
const LINE_NORMALISE = { python: 3, typescript: 3 };
/** the three reversal calls */
const LINE_REV_ALL = { python: 4, typescript: 4 };
const LINE_REV_HEAD = { python: 5, typescript: 5 };
const LINE_REV_TAIL = { python: 6, typescript: 6 };
/** the swap inside the helper */
const LINE_SWAP = { python: 10, typescript: 11 };

interface BlockState {
  nums: number[];
  /** inclusive range currently being reversed */
  range: [number, number] | null;
  /** the pair mid-swap */
  swap: [number, number] | null;
  /** boundary between the two blocks, once k is known */
  k: number | null;
  phase: string;
  done: boolean;
}

function buildSteps(data: number[], rawK: number): VizStep<BlockState>[] {
  const nums = [...data];
  const n = nums.length;
  const k = ((Math.round(rawK) % n) + n) % n;
  const steps: VizStep<BlockState>[] = [];

  const snap = (over: Partial<BlockState> = {}): BlockState => ({
    nums: [...nums],
    range: null,
    swap: null,
    k,
    phase: "",
    done: false,
    ...over,
  });

  steps.push({
    caption:
      rawK === k
        ? `k = ${k}. The last ${k} elements are block B; everything before is block A.`
        : `k = ${rawK} mod ${n} = ${k}. Rotating by n changes nothing, so only the remainder matters.`,
    line: LINE_NORMALISE,
    state: snap({ phase: "normalise" }),
  });

  if (k === 0) {
    steps.push({
      caption: "k reduces to 0 — the array is already in its rotated order.",
      line: LINE_NORMALISE,
      state: snap({ done: true }),
    });
    return steps;
  }

  const pass = (from: number, to: number, line: typeof LINE_REV_ALL, label: string, why: string) => {
    steps.push({
      caption: why,
      line,
      state: snap({ range: [from, to], phase: label }),
    });
    let i = from;
    let j = to;
    while (i < j) {
      steps.push({
        caption: `Swap positions ${i} and ${j}.`,
        line: LINE_SWAP,
        state: snap({ range: [from, to], swap: [i, j], phase: label }),
      });
      [nums[i], nums[j]] = [nums[j], nums[i]];
      i += 1;
      j -= 1;
      steps.push({
        caption: `Pointers step inward — ${j < i ? "the region is empty, this reversal is done" : `now ${i} and ${j}`}.`,
        line: LINE_SWAP,
        state: snap({ range: [from, to], phase: label }),
      });
    }
  };

  pass(
    0,
    n - 1,
    LINE_REV_ALL,
    "all",
    "Reverse the whole array. This puts the blocks in the right ORDER but scrambles each one internally.",
  );

  steps.push({
    caption: `[${nums.join(", ")}] — B is in front now, which is what we wanted, but both blocks read backwards.`,
    line: LINE_REV_ALL,
    state: snap({ phase: "after-all" }),
  });

  pass(0, k - 1, LINE_REV_HEAD, "head", `Reverse just the first ${k} — that un-scrambles block B.`);
  pass(k, n - 1, LINE_REV_TAIL, "tail", `Reverse the remaining ${n - k} — that un-scrambles block A.`);

  steps.push({
    caption: `Done: [${nums.join(", ")}]. Three reversals, no extra array.`,
    line: LINE_REV_TAIL,
    state: snap({ done: true }),
  });

  return steps;
}

function cellTone(state: BlockState, i: number): Tone {
  if (state.swap && (state.swap[0] === i || state.swap[1] === i)) return "focal";
  if (state.done) return "result";
  if (state.range && i >= state.range[0] && i <= state.range[1]) return "range";
  return "default";
}

export function BlockReversalViz(props: Record<string, unknown>) {
  const { data, k, speed } = props;
  const nums = numberArrayProp(data, [1, 2, 3, 4, 5, 6, 7]);
  const shift = typeof k === "number" && Number.isFinite(k) ? k : 3;
  const steps = useMemo(() => buildSteps(nums, shift), [nums, shift]);

  return (
    <VizPlayer
      code={CODE}
      steps={steps}
      speedMs={speedProp(speed)}
      label={`Rotating ${nums.length} elements right by ${shift} using three reversals`}
      family="pointer-movement"
    >
      {(state, ctx) => (
        <div className="flex flex-col items-start gap-3">
          <Tape
            values={state.nums}
            toneFor={(i) => cellTone(state, i)}
            focal={state.swap?.[0] ?? null}
            window={state.range ? { lo: state.range[0], hi: state.range[1] } : null}
            markers={
              state.swap
                ? [
                    { at: state.swap[0], label: "i" },
                    { at: state.swap[1], label: "j", color: "var(--muted)" },
                  ]
                : state.range
                  ? [
                      { at: state.range[0], label: "i" },
                      { at: state.range[1], label: "j", color: "var(--muted)" },
                    ]
                  : state.k !== null && state.k > 0
                    ? [{ at: state.k, label: "k", color: "var(--muted)" }]
                    : []
            }
            reduced={ctx.reduced}
          />
          <StatusPanel
            items={[
              { label: "k", value: state.k ?? "—" },
              { label: "phase", value: state.phase || "—" },
            ]}
          />
        </div>
      )}
    </VizPlayer>
  );
}
