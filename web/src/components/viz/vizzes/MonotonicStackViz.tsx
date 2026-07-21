"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { Cell, Legend, type CellTone } from "@/components/viz/pieces";
import { numberArrayProp, speedProp } from "@/components/viz/props";
import type { VizCode, VizStep } from "@/components/viz/types";

const CODE: VizCode = {
  python: `def next_greater(nums):
    answer = [-1] * len(nums)
    stack = []
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            j = stack.pop()
            answer[j] = x
        stack.append(i)
    return answer`,
  typescript: `function nextGreater(nums: number[]): number[] {
  const answer = new Array(nums.length).fill(-1);
  const stack: number[] = [];
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];
    while (stack.length > 0 && nums[stack[stack.length - 1]] < x) {
      const j = stack.pop()!;
      answer[j] = x;
    }
    stack.push(i);
  }
  return answer;
}`,
};

interface MonoStackState {
  values: number[];
  current: number | null;
  /** Indices on the stack, bottom to top */
  stackIdx: number[];
  answer: (number | null)[];
  justPopped: number | null;
  justPushed: number | null;
  done: boolean;
}

function buildSteps(values: number[]): VizStep<MonoStackState>[] {
  const steps: VizStep<MonoStackState>[] = [];
  const n = values.length;
  const answer: (number | null)[] = new Array(n).fill(null);
  const stackIdx: number[] = [];

  const snap = (over: Partial<MonoStackState> = {}): MonoStackState => ({
    values,
    current: null,
    stackIdx: [...stackIdx],
    answer: [...answer],
    justPopped: null,
    justPushed: null,
    done: false,
    ...over,
  });

  steps.push({
    caption:
      "Scan left to right, keeping a stack of indices whose answer is still unknown. Invariant: stack values strictly decreasing, bottom to top.",
    line: { python: 1, typescript: 1 },
    state: snap(),
  });

  for (let i = 0; i < n; i++) {
    const x = values[i];
    steps.push({
      caption: `i = ${i}: ${x} arrives. Compare it against the stack's top.`,
      line: { python: 5, typescript: 6 },
      state: snap({ current: i }),
    });
    while (stackIdx.length > 0 && values[stackIdx[stackIdx.length - 1]] < x) {
      const j = stackIdx.pop()!;
      answer[j] = x;
      steps.push({
        caption: `${values[j]} at index ${j} < ${x} — its wait is over. answer[${j}] = ${x}; pop it off.`,
        line: { python: 7, typescript: 8 },
        state: snap({ current: i, justPopped: j }),
      });
    }
    stackIdx.push(i);
    steps.push({
      caption:
        stackIdx.length > 1
          ? `${x} doesn't beat the new top — push index ${i}. It now waits for its own greater value.`
          : `Stack is empty (or ${x} loses to nothing) — push index ${i}. It waits for its own greater value.`,
      line: { python: 8, typescript: 10 },
      state: snap({ current: i, justPushed: i }),
    });
  }

  const stuck = stackIdx.slice();
  steps.push({
    caption:
      stuck.length > 0
        ? `Scan done. Indices ${stuck.join(", ")} never found a greater value — their answer stays unresolved.`
        : "Scan done. Every index found its next greater value.",
    line: { python: 9, typescript: 12 },
    state: snap({ done: true }),
  });

  return steps;
}

function cellTone(state: MonoStackState, i: number): CellTone {
  if (state.current === i) return "active";
  const onStack = state.stackIdx.includes(i);
  if (onStack) return state.done ? "dropped" : "kept";
  if (state.answer[i] !== null) return "resolved";
  return "plain";
}

function StackColumn({ values, stackIdx }: { values: number[]; stackIdx: number[] }) {
  return (
    <div className="flex min-h-32 w-16 flex-col-reverse items-center justify-start gap-1 rounded-lg border border-dashed border-border p-1.5">
      <AnimatePresence initial={false}>
        {stackIdx.map((idx) => (
          <motion.div
            key={idx}
            layout
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 28, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="flex h-8 w-11 items-center justify-center rounded-md border border-accent/60 bg-accent/14 font-mono text-xs font-semibold text-foreground"
          >
            {values[idx]}
            <span className="ml-1 text-[9px] text-muted">{idx}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function MonotonicStackViz(props: Record<string, unknown>) {
  const { data, speed } = props;
  const values = useMemo(() => numberArrayProp(data, [2, 1, 5, 3]), [data]);
  const steps = useMemo(() => buildSteps(values), [values]);

  return (
    <VizPlayer code={CODE} steps={steps} speedMs={speedProp(speed)} label="Monotonic stack trace">
      {(state) => (
        <div className="flex flex-col items-start gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] text-muted">input</span>
            <div className="flex gap-1.5">
              {state.values.map((v, i) => (
                <Cell key={i} value={v} index={i} tone={cellTone(state, i)} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] text-muted">answer</span>
            <div className="flex gap-1.5">
              {state.answer.map((a, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg border font-mono text-sm font-semibold tabular-nums",
                    a === null
                      ? "border-dashed border-border text-muted"
                      : "border-emerald-500/50 bg-emerald-500/10 text-foreground",
                  )}
                >
                  {a === null ? (
                    state.done ? "none" : "?"
                  ) : (
                    <motion.span
                      key={`ans-${i}-${a}`}
                      initial={state.justPopped === i ? { scale: 1.5, opacity: 0 } : false}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      {a}
                    </motion.span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] text-muted">stack (top ↑)</span>
            <StackColumn values={state.values} stackIdx={state.stackIdx} />
          </div>

          <Legend
            items={[
              { tone: "active", label: "arriving" },
              { tone: "kept", label: "on stack" },
              { tone: "resolved", label: "answer found" },
              { tone: "dropped", label: "never resolved" },
            ]}
          />
        </div>
      )}
    </VizPlayer>
  );
}
