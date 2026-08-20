"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { StatusPanel, Tape, type Tone } from "@/components/viz/pieces";
import { numberArrayProp, speedProp } from "@/components/viz/props";
import type { VizCode, VizStep } from "@/components/viz/types";

const CODE: VizCode = {
  python: `def reverse_list(head):
    prev = None
    curr = head
    while curr is not None:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
  typescript: `function reverseList(head: ListNode | null) {
  let prev: ListNode | null = null;
  let curr = head;
  while (curr !== null) {
    const nxt = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nxt;
  }
  return prev;
}`,
};

interface ReversalState {
  values: number[];
  flipped: boolean[];
  prevIdx: number | null;
  currIdx: number | null;
  nxtIdx: number | null;
  justFlipped: number | null;
  done: boolean;
}

function buildSteps(values: number[]): VizStep<ReversalState>[] {
  const steps: VizStep<ReversalState>[] = [];
  const n = values.length;
  const flipped: boolean[] = new Array(n).fill(false);
  let prevIdx: number | null = null;
  let currIdx: number | null = 0;

  const snap = (over: Partial<ReversalState> = {}): ReversalState => ({
    values,
    flipped: [...flipped],
    prevIdx,
    currIdx,
    nxtIdx: null,
    justFlipped: null,
    done: false,
    ...over,
  });

  steps.push({
    caption:
      "prev = null (the reversed prefix is empty); curr = head. Everything else is the untouched suffix.",
    line: { python: 3, typescript: 3 },
    state: snap(),
  });

  for (;;) {
    steps.push({
      caption:
        currIdx !== null
          ? `curr = index ${currIdx} (value ${values[currIdx]}) ≠ null — continue.`
          : "curr = null — the condition fails; the loop exits.",
      line: { python: 4, typescript: 4 },
      state: snap(),
    });
    if (currIdx === null) break;
    const i: number = currIdx;

    const nxtIdx: number | null = i + 1 < n ? i + 1 : null;
    steps.push({
      caption: `nxt = curr.next — save the lifeline: index ${i} still points to ${
        nxtIdx !== null ? `index ${nxtIdx}` : "null"
      } before anything changes.`,
      line: { python: 5, typescript: 5 },
      state: snap({ nxtIdx }),
    });

    flipped[i] = true;
    steps.push({
      caption: `curr.next = prev — flip: index ${i} now points to ${
        prevIdx !== null ? `index ${prevIdx}` : "null"
      }. The reversed region grows to include it.`,
      line: { python: 6, typescript: 6 },
      state: snap({ nxtIdx, justFlipped: i }),
    });

    prevIdx = i;
    steps.push({
      caption: `prev = curr — prev advances to index ${i}.`,
      line: { python: 7, typescript: 7 },
      state: snap({ nxtIdx }),
    });

    currIdx = nxtIdx;
    steps.push({
      caption:
        currIdx !== null
          ? `curr = nxt — curr advances to index ${currIdx}.`
          : "curr = nxt — curr becomes null. The untouched suffix is now empty.",
      line: { python: 8, typescript: 8 },
      state: snap(),
    });
  }

  steps.push({
    caption: `Return prev — index ${prevIdx} is the new head. Reversed: ${[...values]
      .reverse()
      .join(" → ")}.`,
    line: { python: 9, typescript: 10 },
    state: snap({ done: true }),
  });

  return steps;
}

function cellTone(state: ReversalState, i: number): Tone {
  if (state.currIdx === i) return "focal";
  if (state.flipped[i]) return "result";
  return "default";
}

function NextGlyph({ i, state }: { i: number; state: ReversalState }) {
  const n = state.values.length;
  const flipped = state.flipped[i];
  const target = flipped ? (i - 1 >= 0 ? i - 1 : null) : i + 1 < n ? i + 1 : null;
  const label = flipped
    ? `← ${target !== null ? state.values[target] : "∅"}`
    : `→ ${target !== null ? state.values[target] : "∅"}`;
  const hot = state.justFlipped === i;
  return (
    <span
      className={cn(
        "font-mono text-[10px] transition-colors duration-300",
        hot ? "font-semibold text-mark" : "text-muted",
      )}
    >
      {label}
    </span>
  );
}

export function ListReversalViz(props: Record<string, unknown>) {
  const { data, speed } = props;
  const values = useMemo(() => numberArrayProp(data, [1, 2, 3, 4]), [data]);
  const steps = useMemo(() => buildSteps(values), [values]);

  return (
    <VizPlayer code={CODE} steps={steps} speedMs={speedProp(speed)} label="List reversal trace" family="relationships">
      {(state, ctx) => (
        <div className="flex flex-col items-start gap-3">
          <Tape
            values={state.values}
            toneFor={(i) => cellTone(state, i)}
            focal={state.currIdx}
            markers={[
              ...(state.prevIdx !== null
                ? [{ at: state.prevIdx, label: "prev", color: "var(--muted)" }]
                : []),
              ...(state.currIdx !== null ? [{ at: state.currIdx, label: "curr" }] : []),
              ...(state.nxtIdx !== null
                ? [{ at: state.nxtIdx, label: "nxt", color: "color-mix(in oklab, var(--accent) 55%, var(--muted))" }]
                : []),
            ]}
            reduced={ctx.reduced}
          />
          <div className="flex gap-[0.375rem]" aria-hidden>
            {state.values.map((v, i) => (
              <span
                key={i}
                className="flex w-10 justify-center font-mono text-[10px]"
              >
                <NextGlyph i={i} state={state} />
              </span>
            ))}
          </div>
          <StatusPanel
            items={[
              {
                label: "prev",
                value:
                  state.prevIdx === null ? "null" : state.values[state.prevIdx],
              },
              {
                label: "curr",
                value:
                  state.currIdx === null ? "null" : state.values[state.currIdx],
              },
              {
                label: "nxt",
                value:
                  state.nxtIdx === null ? "null" : state.values[state.nxtIdx],
              },
            ]}
          />
        </div>
      )}
    </VizPlayer>
  );
}
