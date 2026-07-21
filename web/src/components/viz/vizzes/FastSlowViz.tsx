"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { Cell, Legend, MarkerRow, type CellTone } from "@/components/viz/pieces";
import { numberArrayProp, speedProp } from "@/components/viz/props";
import type { VizCode, VizStep } from "@/components/viz/types";

const CODE: VizCode = {
  python: `def has_cycle(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False`,
  typescript: `function hasCycle(head: ListNode | null): boolean {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
};

interface FastSlowState {
  values: number[];
  cycleAt: number | null;
  slowIdx: number | null;
  fastIdx: number | null;
  gap: number | null;
  met: boolean;
  done: boolean;
  result: "cycle" | "no-cycle" | null;
}

function resolveNode(pos: number, length: number, cycleAt: number | null): number | null {
  if (pos < length) return pos;
  if (cycleAt === null) return null;
  const cycleLen = length - cycleAt;
  return cycleAt + (((pos - cycleAt) % cycleLen) + cycleLen) % cycleLen;
}

function buildSteps(values: number[], cycleAt: number | null): VizStep<FastSlowState>[] {
  const steps: VizStep<FastSlowState>[] = [];
  const length = values.length;
  let slowSteps = 0;
  let fastSteps = 0;

  const label = (idx: number | null) => (idx === null ? "null" : `index ${idx} (value ${values[idx]})`);

  const snap = (over: Partial<FastSlowState> = {}): FastSlowState => {
    const slowIdx = resolveNode(slowSteps, length, cycleAt);
    const fastIdx = resolveNode(fastSteps, length, cycleAt);
    let gap: number | null = null;
    if (cycleAt !== null && slowIdx !== null && fastIdx !== null && slowIdx >= cycleAt && fastIdx >= cycleAt) {
      const cycleLen = length - cycleAt;
      gap = (((slowIdx - fastIdx) % cycleLen) + cycleLen) % cycleLen;
    }
    return {
      values,
      cycleAt,
      slowIdx,
      fastIdx,
      gap,
      met: false,
      done: false,
      result: null,
      ...over,
    };
  };

  steps.push({
    caption: "slow = fast = head. Both start together — the gap is 0, but no step has been taken yet.",
    line: { python: 2, typescript: 3 },
    state: snap(),
  });

  for (;;) {
    const fastIdxNow = resolveNode(fastSteps, length, cycleAt);
    const fastNextIdx = resolveNode(fastSteps + 1, length, cycleAt);
    const canContinue = fastIdxNow !== null && fastNextIdx !== null;
    steps.push({
      caption: canContinue
        ? `fast is at ${label(fastIdxNow)} and fast.next exists — continue.`
        : `fast is ${fastIdxNow === null ? "null" : `at ${label(fastIdxNow)}, but fast.next is null`} — the condition fails.`,
      line: { python: 3, typescript: 4 },
      state: snap(),
    });
    if (!canContinue) break;

    slowSteps += 1;
    steps.push({
      caption: `slow = slow.next — slow advances to ${label(resolveNode(slowSteps, length, cycleAt))}.`,
      line: { python: 4, typescript: 5 },
      state: snap(),
    });

    fastSteps += 2;
    steps.push({
      caption: `fast = fast.next.next — fast advances to ${label(resolveNode(fastSteps, length, cycleAt))}.`,
      line: { python: 5, typescript: 6 },
      state: snap(),
    });

    const slowIdx = resolveNode(slowSteps, length, cycleAt);
    const fastIdx = resolveNode(fastSteps, length, cycleAt);
    const met = slowIdx !== null && fastIdx !== null && slowIdx === fastIdx;
    steps.push({
      caption: met
        ? `slow is fast — same node! They've met.`
        : `slow is fast? No — ${label(slowIdx)} ≠ ${label(fastIdx)}. Keep going.`,
      line: { python: 6, typescript: 7 },
      state: snap({ met }),
    });
    if (met) {
      steps.push({
        caption: "Return True — a cycle exists. Fast could only have landed exactly on slow by lapping it.",
        line: { python: 7, typescript: 7 },
        state: snap({ met: true, done: true, result: "cycle" }),
      });
      return steps;
    }
  }

  steps.push({
    caption: `Return False — fast fell off the end, so there's no cycle. slow rests at ${label(
      resolveNode(slowSteps, length, cycleAt),
    )}.`,
    line: { python: 8, typescript: 9 },
    state: snap({ done: true, result: "no-cycle" }),
  });

  return steps;
}

function cellTone(state: FastSlowState, i: number): CellTone {
  if (state.met && (state.slowIdx === i || state.fastIdx === i)) return "active";
  if (state.slowIdx === i || state.fastIdx === i) return "kept";
  return "plain";
}

export function FastSlowViz(props: Record<string, unknown>) {
  const { data, cycleAt: cycleAtProp, speed } = props;
  const values = useMemo(() => numberArrayProp(data, [3, 2, 0, -4]), [data]);
  const cycleAt = useMemo(() => {
    if (typeof cycleAtProp !== "number" || !Number.isInteger(cycleAtProp)) return null;
    return cycleAtProp >= 0 && cycleAtProp < values.length ? cycleAtProp : null;
  }, [cycleAtProp, values.length]);
  const steps = useMemo(() => buildSteps(values, cycleAt), [values, cycleAt]);

  return (
    <VizPlayer code={CODE} steps={steps} speedMs={speedProp(speed)} label="Fast and slow pointers trace">
      {(state) => (
        <div className="flex flex-col items-start gap-3">
          <div className="flex flex-col items-start gap-1">
            <div className="flex gap-1.5">
              {state.values.map((v, i) => (
                <Cell key={i} value={v} index={i} tone={cellTone(state, i)} />
              ))}
            </div>
            <div className="flex gap-1.5">
              {state.values.map((_, i) => (
                <div key={i} className="flex w-10 justify-center">
                  {i === state.values.length - 1 ? (
                    <span className="font-mono text-[9px] text-muted">
                      {state.cycleAt !== null ? `↺ idx ${state.cycleAt}` : "→ ∅"}
                    </span>
                  ) : state.cycleAt === i ? (
                    <span className="font-mono text-[9px] text-accent">loop entry</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <MarkerRow
            length={state.values.length}
            markers={[
              ...(state.slowIdx !== null
                ? [{ index: state.slowIdx, label: "slow", color: "var(--muted)" }]
                : []),
              ...(state.fastIdx !== null ? [{ index: state.fastIdx, label: "fast" }] : []),
            ]}
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
            <span>
              slow <span className="text-foreground">{state.slowIdx === null ? "null" : state.values[state.slowIdx]}</span>
            </span>
            <span>
              fast <span className="text-foreground">{state.fastIdx === null ? "null" : state.values[state.fastIdx]}</span>
            </span>
            {state.gap !== null ? (
              <span className="rounded-md border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-accent">
                gap{" "}
                <motion.span
                  key={state.gap}
                  initial={{ scale: 1.4 }}
                  animate={{ scale: 1 }}
                  className="inline-block font-semibold"
                >
                  {state.gap}
                </motion.span>
              </span>
            ) : null}
          </div>
          <Legend
            items={[
              { tone: "kept", label: "slow / fast" },
              { tone: "active", label: "met" },
              { tone: "plain", label: "unvisited" },
            ]}
          />
        </div>
      )}
    </VizPlayer>
  );
}
