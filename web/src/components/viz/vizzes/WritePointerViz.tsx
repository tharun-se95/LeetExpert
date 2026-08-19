"use client";

import { useMemo } from "react";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { StatusPanel, Tape, type Tone } from "@/components/viz/pieces";
import { numberArrayProp, speedProp } from "@/components/viz/props";
import type { VizCode, VizStep } from "@/components/viz/types";

const CODE: VizCode = {
  python: `def compact_nonzero(nums):
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write] = nums[read]
            write += 1
    return write`,
  typescript: `function compactNonzero(nums: number[]): number {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      nums[write] = nums[read];
      write++;
    }
  }
  return write;
}`,
};

interface WritePointerState {
  nums: number[];
  /** null before the loop starts and after it ends */
  read: number | null;
  write: number;
  /** Slot that was just written, for the pop animation */
  justWrote: number | null;
  done: boolean;
}

function buildSteps(data: number[]): VizStep<WritePointerState>[] {
  const steps: VizStep<WritePointerState>[] = [];
  const nums = [...data];
  let write = 0;

  const snap = (
    read: number | null,
    justWrote: number | null,
    done = false,
  ): WritePointerState => ({ nums: [...nums], read, write, justWrote, done });

  steps.push({
    caption: "write = 0 — the kept prefix [0, 0) is empty; nothing scanned yet.",
    line: { python: 2, typescript: 2 },
    state: snap(null, null),
  });

  for (let read = 0; read < nums.length; read++) {
    const v = nums[read];
    if (v !== 0) {
      steps.push({
        caption: `read = ${read}: nums[${read}] is ${v} — nonzero, a keeper.`,
        line: { python: 4, typescript: 4 },
        state: snap(read, null),
      });
      const target = write;
      nums[target] = v;
      steps.push({
        caption:
          target === read
            ? `Copy ${v} into slot ${target} — write equals read, so it lands on itself.`
            : `Copy ${v} into slot ${target}, overwriting junk that was already read.`,
        line: { python: 5, typescript: 5 },
        state: snap(read, target),
      });
      write += 1;
      steps.push({
        caption: `write → ${write}. Invariant: nums[0..${write}) is exactly the keepers seen so far, in order.`,
        line: { python: 6, typescript: 6 },
        state: snap(read, null),
      });
    } else {
      steps.push({
        caption: `read = ${read}: nums[${read}] is 0 — junk. write stays at ${write}; the invariant needs no work.`,
        line: { python: 4, typescript: 4 },
        state: snap(read, null),
      });
    }
  }

  steps.push({
    caption: `Loop done — return write = ${write}. Keepers fill nums[0..${write}); the tail is leftover junk.`,
    line: { python: 7, typescript: 9 },
    state: snap(null, null, true),
  });

  return steps;
}

function toneAt(state: WritePointerState, i: number): Tone {
  if (state.justWrote === i) return "focal";
  if (i < state.write) return "result";
  const scanned = state.done || (state.read !== null && i <= state.read);
  return scanned ? "eliminated" : "default";
}

export function WritePointerViz(props: Record<string, unknown>) {
  const { data, speed } = props;
  const steps = useMemo(
    () => buildSteps(numberArrayProp(data, [0, 1, 0, 3, 12])),
    [data],
  );

  return (
    <VizPlayer
      code={CODE}
      steps={steps}
      speedMs={speedProp(speed)}
      label="Write-pointer compaction trace"
      family="pointer-movement"
    >
      {(state, ctx) => (
        <div className="flex flex-col items-start gap-3">
          <Tape
            values={state.nums}
            toneFor={(i) => toneAt(state, i)}
            focal={state.justWrote}
            markers={[
              ...(state.read !== null
                ? [{ at: state.read, label: "read", color: "var(--muted)" }]
                : []),
              {
                at: Math.min(state.write, state.nums.length - 1),
                label: "write",
              },
            ]}
            reduced={ctx.reduced}
          />
          <StatusPanel
            items={[
              { label: "write", value: state.write },
              { label: "read", value: state.read ?? "—" },
            ]}
          />
        </div>
      )}
    </VizPlayer>
  );
}
