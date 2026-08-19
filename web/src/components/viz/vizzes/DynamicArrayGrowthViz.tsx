"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { StatusPanel } from "@/components/viz/pieces";
import { numberArrayProp, speedProp } from "@/components/viz/props";
import type { VizCode, VizStep } from "@/components/viz/types";

const CODE: VizCode = {
  python: `def append(arr, value):
    if arr.length == arr.capacity:
        arr.capacity *= 2
        new_store = [None] * arr.capacity
        for j in range(arr.length):
            new_store[j] = arr.store[j]
        arr.store = new_store
    arr.store[arr.length] = value
    arr.length += 1`,
  typescript: `function append(arr: Dyn, value: number): void {
  if (arr.length === arr.capacity) {
    arr.capacity *= 2;
    const next = new Array(arr.capacity);
    for (let j = 0; j < arr.length; j++) {
      next[j] = arr.store[j];
    }
    arr.store = next;
  }
  arr.store[arr.length] = value;
  arr.length++;
}`,
};

interface DynGrowState {
  capacity: number;
  length: number;
  cost: number;
  /** Contents of the live store; null = empty slot */
  store: (number | null)[];
  /** Old store shown above the new one mid-resize */
  oldStore: (number | null)[] | null;
  /** Index just copied into the new store */
  copied: number | null;
  /** Slot just written by the append itself */
  wrote: number | null;
  /** Value waiting to be appended */
  incoming: number | null;
}

function buildSteps(values: number[]): VizStep<DynGrowState>[] {
  const steps: VizStep<DynGrowState>[] = [];
  let capacity = 1;
  let length = 0;
  let cost = 0;
  let store: (number | null)[] = [null];

  const snap = (over: Partial<DynGrowState> = {}): DynGrowState => ({
    capacity,
    length,
    cost,
    store: [...store],
    oldStore: null,
    copied: null,
    wrote: null,
    incoming: null,
    ...over,
  });

  steps.push({
    caption: `A dynamic array starts tiny: capacity 1, length 0. We'll append ${values.length} values and count every unit of copy/write work.`,
    line: { python: 1, typescript: 1 },
    state: snap(),
  });

  values.forEach((v, i) => {
    const n = i + 1;
    if (length === capacity) {
      steps.push({
        caption: `Append #${n}: length ${length} == capacity ${capacity} — the store is full. ${v} can't land until we grow.`,
        line: { python: 2, typescript: 2 },
        state: snap({ incoming: v }),
      });
      const oldCap = capacity;
      capacity *= 2;
      steps.push({
        caption: `Double the capacity: ${oldCap} → ${capacity}. Multiplicative growth is the load-bearing choice.`,
        line: { python: 3, typescript: 3 },
        state: snap({ incoming: v }),
      });
      const old = store;
      store = Array.from({ length: capacity }, () => null);
      steps.push({
        caption: `Allocate a new ${capacity}-slot store — empty for now; the data still lives in the old block.`,
        line: { python: 4, typescript: 4 },
        state: snap({ oldStore: [...old], incoming: v }),
      });
      for (let j = 0; j < length; j++) {
        store[j] = old[j];
        cost += 1;
        steps.push({
          caption: `Copy element ${j} (${old[j]}) into the new store — +1 work, ${cost} total.`,
          line: { python: 6, typescript: 6 },
          state: snap({ oldStore: [...old], copied: j, incoming: v }),
        });
      }
      steps.push({
        caption: "Point the array at the new store; the old block is retired.",
        line: { python: 7, typescript: 8 },
        state: snap({ incoming: v }),
      });
    }
    store[length] = v;
    cost += 1;
    steps.push({
      caption: `Append #${n}: write ${v} into slot ${length}. +1 work, ${cost} total.`,
      line: { python: 8, typescript: 10 },
      state: snap({ wrote: length }),
    });
    length += 1;
    const summary =
      n === values.length
        ? ` All ${values.length} appends cost ${cost} units — resizes included, still well under 3 per append.`
        : "";
    steps.push({
      caption: `length → ${length}.${summary}`,
      line: { python: 9, typescript: 11 },
      state: snap({ wrote: length - 1 }),
    });
  });

  return steps;
}

function SlotRow({
  label,
  cells,
  copied,
  wrote,
  retiredLook,
  slideIn,
}: {
  label: string;
  cells: (number | null)[];
  copied?: number | null;
  wrote?: number | null;
  retiredLook?: boolean;
  slideIn?: boolean;
}) {
  return (
    <motion.div
      layout
      initial={slideIn ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2"
    >
      <span className="w-9 shrink-0 text-right font-mono text-[10px] text-muted">
        {label}
      </span>
      <div className="flex gap-1">
        {cells.map((c, i) => {
          const hot = copied === i || wrote === i;
          return (
            <div
              key={i}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md border font-mono text-xs font-semibold tabular-nums transition-colors duration-300",
                c === null
                  ? "border-dashed border-border text-muted"
                  : hot
                    ? "border-[var(--family-accent,var(--accent))] bg-[var(--family-accent,var(--accent))] text-[var(--family-on-accent,var(--on-pop))]"
                    : retiredLook
                      ? "border-border bg-background text-muted opacity-60"
                      : "border-[var(--family-accent,var(--accent))]/50 bg-[var(--family-accent,var(--accent))]/12 text-foreground",
              )}
            >
              {c === null ? "" : (
                <motion.span
                  key={`v-${c}`}
                  initial={hot ? { scale: 1.5, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {c}
                </motion.span>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function DynamicArrayGrowthViz(props: Record<string, unknown>) {
  const { values, speed } = props;
  const steps = useMemo(
    () => buildSteps(numberArrayProp(values, [3, 7, 1, 9, 4]).slice(0, 6)),
    [values],
  );

  return (
    <VizPlayer
      code={CODE}
      steps={steps}
      speedMs={speedProp(speed)}
      label="Dynamic array growth trace"
      family="linear-traversal"
    >
      {(state) => (
        <div className="flex w-full flex-col items-center gap-3">
          <div className="flex min-h-24 flex-col justify-center gap-2.5">
            {state.oldStore ? (
              <SlotRow label="old" cells={state.oldStore} copied={state.copied} retiredLook />
            ) : null}
            <SlotRow
              label={state.oldStore ? "new" : "store"}
              cells={state.store}
              copied={state.copied}
              wrote={state.wrote}
              slideIn={state.oldStore !== null}
            />
          </div>
          <StatusPanel
            items={[
              { label: "capacity", value: state.capacity },
              { label: "length", value: state.length },
              {
                label: "appending",
                value: state.incoming === null ? "—" : state.incoming,
              },
              { label: "work", value: state.cost },
            ]}
          />
        </div>
      )}
    </VizPlayer>
  );
}
