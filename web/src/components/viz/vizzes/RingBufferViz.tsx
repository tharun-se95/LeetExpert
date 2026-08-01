"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { speedProp } from "@/components/viz/props";
import type { VizCode, VizStep } from "@/components/viz/types";

const CODE: VizCode = {
  python: `def enqueue(ring, value):
    if ring.size == ring.capacity:
        return False
    tail = (ring.head + ring.size) % ring.capacity
    ring.store[tail] = value
    ring.size += 1
    return True

def dequeue(ring):
    if ring.size == 0:
        raise IndexError()
    value = ring.store[ring.head]
    ring.store[ring.head] = None
    ring.head = (ring.head + 1) % ring.capacity
    ring.size -= 1
    return value`,
  typescript: `function enqueue(ring: Ring, value: string): boolean {
  if (ring.size === ring.capacity) {
    return false;
  }
  const tail = (ring.head + ring.size) % ring.capacity;
  ring.store[tail] = value;
  ring.size++;
  return true;
}

function dequeue(ring: Ring): string | undefined {
  if (ring.size === 0) return undefined;
  const value = ring.store[ring.head];
  ring.store[ring.head] = undefined;
  ring.head = (ring.head + 1) % ring.capacity;
  ring.size--;
  return value;
}`,
};

interface RingState {
  capacity: number;
  store: (string | null)[];
  head: number;
  tail: number;
  size: number;
  op: "enqueue" | "dequeue" | null;
  opValue: string | null;
  justWritten: number | null;
  justCleared: number | null;
  wrapped: "head" | "tail" | null;
}

function opsProp(value: unknown, fallback: string[]): string[] {
  if (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((x) => typeof x === "string" && /^[+-]/.test(x))
  ) {
    return value.slice(0, 12);
  }
  return fallback;
}

function buildSteps(capacity: number, ops: string[]): VizStep<RingState>[] {
  const steps: VizStep<RingState>[] = [];
  const store: (string | null)[] = new Array(capacity).fill(null);
  let head = 0;
  let size = 0;

  const snap = (over: Partial<RingState> = {}): RingState => ({
    capacity,
    store: [...store],
    head,
    tail: (head + size) % capacity,
    size,
    op: null,
    opValue: null,
    justWritten: null,
    justCleared: null,
    wrapped: null,
    ...over,
  });

  steps.push({
    caption: `A ${capacity}-slot ring. head marks the front; tail = (head + size) % capacity is derived, never stored.`,
    line: { python: 1, typescript: 1 },
    state: snap(),
  });

  for (const raw of ops) {
    if (raw.startsWith("+")) {
      const value = raw.slice(1);
      const full = size === capacity;
      steps.push({
        caption: full
          ? `enqueue(${value}): size ${size} == capacity ${capacity} — full, rejected.`
          : `enqueue(${value}): size ${size} < capacity ${capacity} — there's room.`,
        line: { python: 2, typescript: 2 },
        state: snap({ op: "enqueue", opValue: value }),
      });
      if (full) continue;
      const rawTail = head + size;
      const tail = rawTail % capacity;
      const tailWrapped = rawTail >= capacity;
      steps.push({
        caption: `tail = (head ${head} + size ${size}) % ${capacity} = ${tail}${tailWrapped ? " — wraps back to the start" : ""}.`,
        line: { python: 4, typescript: 5 },
        state: snap({ op: "enqueue", opValue: value, tail, wrapped: tailWrapped ? "tail" : null }),
      });
      store[tail] = value;
      size += 1;
      steps.push({
        caption: `store[${tail}] = ${value}; size → ${size}.`,
        line: { python: 5, typescript: 6 },
        state: snap({ op: "enqueue", opValue: value, justWritten: tail }),
      });
    } else {
      const empty = size === 0;
      steps.push({
        caption: empty
          ? "dequeue(): size == 0 — empty, nothing to remove."
          : `dequeue(): size ${size} > 0 — the front is at head ${head}.`,
        line: { python: 10, typescript: 12 },
        state: snap({ op: "dequeue" }),
      });
      if (empty) continue;
      const value = store[head];
      const clearedIdx = head;
      store[head] = null;
      steps.push({
        caption: `value = store[${clearedIdx}] = ${value}; clear the slot — nothing shifts.`,
        line: { python: 12, typescript: 13 },
        state: snap({ op: "dequeue", opValue: value, justCleared: clearedIdx }),
      });
      const oldHead = head;
      const rawHead = oldHead + 1;
      head = rawHead % capacity;
      size -= 1;
      const headWrapped = rawHead >= capacity;
      steps.push({
        caption: `head = (${oldHead} + 1) % ${capacity} = ${head}${headWrapped ? " — wraps back to the start" : ""}; size → ${size}.`,
        line: { python: 14, typescript: 15 },
        state: snap({ op: "dequeue", opValue: value, wrapped: headWrapped ? "head" : null }),
      });
    }
  }

  steps.push({
    caption: `Done. ${size} of ${capacity} slots occupied — head at ${head}, next enqueue would land at ${(head + size) % capacity}. No shifting happened anywhere in this trace.`,
    line: { python: 1, typescript: 1 },
    state: snap(),
  });

  return steps;
}

function RingSlots({
  capacity,
  store,
  head,
  tail,
  size,
  justWritten,
  justCleared,
}: {
  capacity: number;
  store: (string | null)[];
  head: number;
  tail: number;
  size: number;
  justWritten: number | null;
  justCleared: number | null;
}) {
  const cx = 92;
  const cy = 92;
  const r = 62;
  return (
    <div
      className="relative shrink-0"
      style={{ width: 184, height: 184 }}
      role="img"
      aria-label={`Ring buffer: head at ${head}, ${size} of ${capacity} slots filled`}
    >
      {Array.from({ length: capacity }, (_, i) => {
        const angle = (i / capacity) * 2 * Math.PI - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        const v = store[i];
        const isHead = i === head && size > 0;
        const isTail = i === tail;
        const hot = justWritten === i || justCleared === i;
        return (
          <div
            key={i}
            className="absolute flex flex-col items-center"
            style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
          >
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border font-mono text-xs font-semibold transition-colors duration-300",
                v === null
                  ? "border-dashed border-border text-muted"
                  : hot
                    ? "border-pop bg-pop text-on-pop"
                    : "border-accent/50 bg-accent/12 text-foreground",
              )}
            >
              <motion.span
                key={hot ? `hot-${i}-${v}` : `static-${i}-${v ?? "e"}`}
                initial={hot ? { scale: 1.5, opacity: 0 } : false}
                animate={{ scale: 1, opacity: 1 }}
              >
                {v ?? ""}
              </motion.span>
            </div>
            <span className="mt-0.5 font-mono text-[9px] text-muted">{i}</span>
            {isHead || isTail ? (
              <span className="mt-0.5 flex gap-1 font-mono text-[9px] font-semibold leading-none">
                {isHead ? <span className="text-accent">head</span> : null}
                {isTail ? <span className="text-muted">tail</span> : null}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function RingBufferViz(props: Record<string, unknown>) {
  const { capacity, ops, speed } = props;
  const cap =
    typeof capacity === "number" && Number.isInteger(capacity) && capacity >= 2 && capacity <= 8
      ? capacity
      : 5;
  const opsList = useMemo(
    () => opsProp(ops, ["+A", "+B", "+C", "+D", "-", "+E", "+F"]),
    [ops],
  );
  const steps = useMemo(() => buildSteps(cap, opsList), [cap, opsList]);

  return (
    <VizPlayer code={CODE} steps={steps} speedMs={speedProp(speed)} label="Ring buffer trace" family="state-transition">
      {(state) => (
        <div className="flex flex-col items-center gap-3">
          <RingSlots
            capacity={state.capacity}
            store={state.store}
            head={state.head}
            tail={state.tail}
            size={state.size}
            justWritten={state.justWritten}
            justCleared={state.justCleared}
          />
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
            <span>
              op{" "}
              <span className="text-foreground">
                {state.op ? `${state.op}(${state.opValue ?? ""})` : "—"}
              </span>
            </span>
            <span>
              size{" "}
              <span className="text-foreground">
                {state.size}/{state.capacity}
              </span>
            </span>
            {state.wrapped ? (
              <span className="rounded-md border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-accent">
                {state.wrapped} wrapped
              </span>
            ) : null}
          </div>
        </div>
      )}
    </VizPlayer>
  );
}
