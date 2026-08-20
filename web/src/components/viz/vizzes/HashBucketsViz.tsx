"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { StatusPanel } from "@/components/viz/pieces";
import { numberArrayProp, speedProp } from "@/components/viz/props";
import type { VizCode, VizStep } from "@/components/viz/types";

const CODE: VizCode = {
  python: `def insert(table, key, value):
    if table.size / table.capacity >= 0.75:
        resize(table)
    idx = key % table.capacity
    table.buckets[idx].append((key, value))
    table.size += 1

def resize(table):
    old_buckets = table.buckets
    table.capacity *= 2
    table.buckets = [[] for _ in range(table.capacity)]
    for bucket in old_buckets:
        for key, value in bucket:
            idx = key % table.capacity
            table.buckets[idx].append((key, value))`,
  typescript: `function insert(table: Table, key: number, value: number) {
  if (table.size / table.capacity >= 0.75) {
    resize(table);
  }
  const idx = key % table.capacity;
  table.buckets[idx].push([key, value]);
  table.size++;
}

function resize(table: Table) {
  const old = table.buckets;
  table.capacity *= 2;
  table.buckets = Array.from({ length: table.capacity }, () => []);
  for (const bucket of old) {
    for (const [key, value] of bucket) {
      const idx = key % table.capacity;
      table.buckets[idx].push([key, value]);
    }
  }
}`,
};

interface HashBucketsState {
  capacity: number;
  buckets: number[][];
  size: number;
  incoming: number | null;
  computedIdx: number | null;
  rehashingKey: number | null;
  justPlaced: number | null;
  resizing: boolean;
}

function buildSteps(keys: number[], initialCapacity: number): VizStep<HashBucketsState>[] {
  const steps: VizStep<HashBucketsState>[] = [];
  let capacity = initialCapacity;
  let buckets: number[][] = Array.from({ length: capacity }, () => []);
  let size = 0;

  const snap = (over: Partial<HashBucketsState> = {}): HashBucketsState => ({
    capacity,
    buckets: buckets.map((b) => [...b]),
    size,
    incoming: null,
    computedIdx: null,
    rehashingKey: null,
    justPlaced: null,
    resizing: false,
    ...over,
  });

  steps.push({
    caption: `A ${capacity}-bucket table, empty. Resize triggers when size/capacity reaches 0.75.`,
    line: { python: 1, typescript: 1 },
    state: snap(),
  });

  for (const key of keys) {
    const load = size / capacity;
    const willResize = load >= 0.75;
    steps.push({
      caption: willResize
        ? `insert(${key}): load = ${size}/${capacity} = ${load.toFixed(2)} ≥ 0.75 — resize before inserting.`
        : `insert(${key}): load = ${size}/${capacity} = ${load.toFixed(2)} < 0.75 — no resize needed.`,
      line: { python: 2, typescript: 2 },
      state: snap({ incoming: key }),
    });

    if (willResize) {
      steps.push({
        caption: "resize(table) — the load factor crossed the threshold.",
        line: { python: 3, typescript: 3 },
        state: snap({ incoming: key, resizing: true }),
      });

      const oldBuckets = buckets;
      steps.push({
        caption: "old_buckets = table.buckets — keep a handle on every existing entry before anything moves.",
        line: { python: 9, typescript: 11 },
        state: snap({ incoming: key, resizing: true }),
      });

      const oldCapacity = capacity;
      capacity *= 2;
      steps.push({
        caption: `capacity *= 2 — ${oldCapacity} → ${capacity}. Same doubling policy as the dynamic array.`,
        line: { python: 10, typescript: 12 },
        state: snap({ incoming: key, resizing: true }),
      });

      buckets = Array.from({ length: capacity }, () => []);
      steps.push({
        caption: `Allocate ${capacity} empty buckets. Every existing key must be re-hashed under the new modulus.`,
        line: { python: 11, typescript: 13 },
        state: snap({ incoming: key, resizing: true }),
      });

      for (const bucket of oldBuckets) {
        for (const k of bucket) {
          const idx = k % capacity;
          buckets[idx].push(k);
          steps.push({
            caption: `Re-file ${k}: ${k} % ${capacity} = ${idx}.`,
            line: { python: 14, typescript: 16 },
            state: snap({ incoming: key, resizing: true, rehashingKey: k, computedIdx: idx }),
          });
        }
      }
    }

    const idx = key % capacity;
    steps.push({
      caption: `idx = ${key} % ${capacity} = ${idx}.`,
      line: { python: 4, typescript: 5 },
      state: snap({ incoming: key, computedIdx: idx }),
    });

    buckets[idx].push(key);
    size += 1;
    const chain = buckets[idx];
    const collided = chain.length > 1;
    steps.push({
      caption: collided
        ? `Append ${key} to bucket ${idx} — collides with ${chain.slice(0, -1).join(", ")}; chain length → ${chain.length}. size → ${size}.`
        : `Append ${key} to bucket ${idx} — first entry there. size → ${size}.`,
      line: { python: 5, typescript: 6 },
      state: snap({ justPlaced: key }),
    });
  }

  steps.push({
    caption: `Done. ${size} keys across ${capacity} buckets — load factor ${(size / capacity).toFixed(2)}.`,
    line: { python: 6, typescript: 7 },
    state: snap(),
  });

  return steps;
}

function BucketColumn({ index, keys, state }: { index: number; keys: number[]; state: HashBucketsState }) {
  const isTarget = state.computedIdx === index;
  return (
    <motion.div layout className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "flex min-h-9 w-9 flex-col-reverse items-center gap-1 rounded-[length:var(--radius-md)] border border-dashed p-1 transition-colors duration-300",
          isTarget
            ? "border-[var(--family-accent,var(--accent))] bg-[var(--family-accent,var(--accent))]/10"
            : "border-border",
        )}
      >
        {keys.map((k) => {
          const hot = state.justPlaced === k || state.rehashingKey === k;
          return (
            <motion.div
              key={k}
              layoutId={`hb-key-${k}`}
              layout
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] border font-mono text-[10px] font-semibold",
                hot
                  ? "border-[var(--family-accent,var(--accent))] bg-[var(--family-accent,var(--accent))] text-[var(--family-on-accent,var(--on-pop))]"
                  : "border-[var(--family-accent,var(--accent))]/50 bg-[var(--family-accent,var(--accent))]/12 text-foreground",
              )}
            >
              {k}
            </motion.div>
          );
        })}
      </div>
      <span className="font-mono text-[9px] text-muted">{index}</span>
    </motion.div>
  );
}

export function HashBucketsViz(props: Record<string, unknown>) {
  const { keys, capacity, speed } = props;
  const keyList = useMemo(() => numberArrayProp(keys, [10, 3, 18, 7, 25, 11]), [keys]);
  const initialCapacity =
    typeof capacity === "number" && Number.isInteger(capacity) && capacity >= 2 && capacity <= 8
      ? capacity
      : 4;
  const steps = useMemo(() => buildSteps(keyList, initialCapacity), [keyList, initialCapacity]);

  return (
    <VizPlayer code={CODE} steps={steps} speedMs={speedProp(speed)} label="Hash buckets trace" family="relationships">
      {(state) => (
        <div className="flex flex-col items-center gap-3">
          <motion.div layout className="flex flex-wrap items-end justify-center gap-2">
            {state.buckets.map((chain, i) => (
              <BucketColumn key={i} index={i} keys={chain} state={state} />
            ))}
          </motion.div>
          <StatusPanel
            items={[
              {
                label: "inserting",
                value: state.incoming === null ? "—" : state.incoming,
              },
              {
                label: "size / capacity",
                value: `${state.size}/${state.capacity}`,
              },
              { label: "load", value: (state.size / state.capacity).toFixed(2) },
            ]}
          />
        </div>
      )}
    </VizPlayer>
  );
}
