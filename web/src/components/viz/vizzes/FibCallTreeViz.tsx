"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { speedProp } from "@/components/viz/props";
import type { VizCode, VizStep } from "@/components/viz/types";

const CODE: VizCode = {
  python: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)`,
  typescript: `function fib(n: number): number {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}`,
};

interface TreeNode {
  id: number;
  n: number;
  depth: number;
  x: number;
  parentId: number | null;
  children: TreeNode[];
}

function buildTree(startN: number): { root: TreeNode; flat: TreeNode[] } {
  let nextId = 0;
  function build(n: number, depth: number, parentId: number | null): TreeNode {
    const node: TreeNode = { id: nextId++, n, depth, x: 0, parentId, children: [] };
    if (n > 1) {
      node.children = [build(n - 1, depth + 1, node.id), build(n - 2, depth + 1, node.id)];
    }
    return node;
  }
  const root = build(startN, 0, null);

  let leafCounter = 0;
  function assignX(node: TreeNode) {
    if (node.children.length === 0) {
      node.x = leafCounter++;
    } else {
      node.children.forEach(assignX);
      const first = node.children[0].x;
      const last = node.children[node.children.length - 1].x;
      node.x = (first + last) / 2;
    }
  }
  assignX(root);

  const flat: TreeNode[] = [];
  (function collect(node: TreeNode) {
    flat.push(node);
    node.children.forEach(collect);
  })(root);

  return { root, flat };
}

type ExecEvent =
  | { type: "call"; node: TreeNode }
  | { type: "return"; node: TreeNode; value: number };

function traceEvents(root: TreeNode): ExecEvent[] {
  const events: ExecEvent[] = [];
  function trace(node: TreeNode): number {
    events.push({ type: "call", node });
    const value = node.n <= 1 ? node.n : trace(node.children[0]) + trace(node.children[1]);
    events.push({ type: "return", node, value });
    return value;
  }
  trace(root);
  return events;
}

interface FibTreeState {
  flat: TreeNode[];
  visible: Set<number>;
  returned: Map<number, number>;
  activeId: number | null;
  isRecompute: boolean;
  recomputeCount: number;
}

function buildSteps(startN: number): { steps: VizStep<FibTreeState>[]; flat: TreeNode[] } {
  const { root, flat } = buildTree(startN);
  const events = traceEvents(root);

  const steps: VizStep<FibTreeState>[] = [];
  const visible = new Set<number>();
  const returned = new Map<number, number>();
  const seenN = new Set<number>();
  let recomputeCount = 0;

  const snap = (over: Partial<FibTreeState> = {}): FibTreeState => ({
    flat,
    visible: new Set(visible),
    returned: new Map(returned),
    activeId: null,
    isRecompute: false,
    recomputeCount,
    ...over,
  });

  steps.push({
    caption: `fib(${startN}) is called. Every recursive call becomes a node — watch which n-values repeat.`,
    line: { python: 1, typescript: 1 },
    state: snap(),
  });

  for (const ev of events) {
    if (ev.type === "call") {
      visible.add(ev.node.id);
      const isRecompute = seenN.has(ev.node.n);
      if (isRecompute) recomputeCount += 1;
      seenN.add(ev.node.n);
      const isBase = ev.node.n <= 1;
      steps.push({
        caption: isRecompute
          ? `fib(${ev.node.n}) called again — recomputed! Already computed earlier in this tree. Tally → ${recomputeCount}.`
          : `fib(${ev.node.n}) called — a new node.${isBase ? " Base case: n ≤ 1." : ""}`,
        line: { python: 1, typescript: 1 },
        state: snap({ activeId: ev.node.id, isRecompute, recomputeCount }),
      });
    } else {
      returned.set(ev.node.id, ev.value);
      const isBase = ev.node.n <= 1;
      steps.push({
        caption: isBase
          ? `fib(${ev.node.n}) returns ${ev.value} immediately — base case.`
          : `fib(${ev.node.n}) returns fib(${ev.node.n - 1}) + fib(${ev.node.n - 2}) = ${ev.value}.`,
        line: { python: isBase ? 3 : 4, typescript: isBase ? 2 : 3 },
        state: snap({ activeId: ev.node.id }),
      });
    }
  }

  const finalValue = returned.get(root.id)!;
  steps.push({
    caption: `fib(${startN}) = ${finalValue}. ${events.length / 2} calls total for only ${seenN.size} distinct inputs — ${recomputeCount} of those calls recomputed something already known. That's the whole memoization motivation.`,
    line: { python: 4, typescript: 3 },
    state: snap(),
  });

  return { steps, flat };
}

const UNIT_X = 46;
const UNIT_Y = 54;
const NODE_SIZE = 40;

function TreeCanvas({ flat, state }: { flat: TreeNode[]; state: FibTreeState }) {
  const maxX = Math.max(...flat.map((n) => n.x));
  const maxY = Math.max(...flat.map((n) => n.depth));
  const width = (maxX + 1) * UNIT_X;
  const height = (maxY + 1) * UNIT_Y;

  const pos = (n: TreeNode) => ({
    left: n.x * UNIT_X + UNIT_X / 2,
    top: n.depth * UNIT_Y + NODE_SIZE / 2,
  });

  return (
    <div className="relative" style={{ width, height }}>
      <svg className="absolute inset-0" width={width} height={height} aria-hidden>
        {flat.map((n) =>
          n.children.map((c) => {
            if (!state.visible.has(c.id)) return null;
            const p1 = pos(n);
            const p2 = pos(c);
            return (
              <line
                key={`${n.id}-${c.id}`}
                x1={p1.left}
                y1={p1.top}
                x2={p2.left}
                y2={p2.top}
                stroke="var(--border)"
                strokeWidth={1.5}
              />
            );
          }),
        )}
      </svg>
      {flat
        .filter((n) => state.visible.has(n.id))
        .map((n) => {
          const { left, top } = pos(n);
          const value = state.returned.get(n.id);
          const isActive = state.activeId === n.id;
          const isRecomputeFlash = isActive && state.isRecompute;
          return (
            <motion.div
              key={n.id}
              className="absolute flex items-center justify-center"
              style={{
                left: left - NODE_SIZE / 2,
                top: top - NODE_SIZE / 2,
                width: NODE_SIZE,
                height: NODE_SIZE,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
            >
              <div
                className={cn(
                  "flex h-full w-full flex-col items-center justify-center rounded-full border font-mono text-[10px] font-semibold leading-none transition-colors duration-300",
                  isRecomputeFlash
                    ? "border-red-500 bg-red-500/20 text-foreground"
                    : isActive
                      ? "border-accent bg-accent text-white"
                      : value !== undefined
                        ? "border-emerald-500/50 bg-emerald-500/10 text-foreground"
                        : "border-accent/50 bg-accent/12 text-foreground",
                )}
              >
                <span>fib({n.n})</span>
                {value !== undefined ? <span className="text-[9px] opacity-80">= {value}</span> : null}
              </div>
              {isRecomputeFlash ? (
                <span className="absolute -top-2 -right-1 rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
                  !
                </span>
              ) : null}
            </motion.div>
          );
        })}
    </div>
  );
}

export function FibCallTreeViz(props: Record<string, unknown>) {
  const { n, speed } = props;
  const startN = typeof n === "number" && Number.isInteger(n) && n >= 2 && n <= 6 ? n : 4;
  const { steps, flat } = useMemo(() => buildSteps(startN), [startN]);

  return (
    <VizPlayer code={CODE} steps={steps} speedMs={speedProp(speed)} label="Fibonacci call tree trace">
      {(state) => (
        <div className="flex flex-col items-center gap-3">
          <div className="overflow-x-auto">
            <TreeCanvas flat={flat} state={state} />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
            <span>
              calls so far <span className="text-foreground">{state.visible.size}</span>
            </span>
            <span className="rounded-md border border-red-500/40 bg-red-500/10 px-1.5 py-0.5 text-red-500">
              recomputed{" "}
              <motion.span
                key={state.recomputeCount}
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                className="inline-block font-semibold"
              >
                {state.recomputeCount}
              </motion.span>
            </span>
          </div>
        </div>
      )}
    </VizPlayer>
  );
}
