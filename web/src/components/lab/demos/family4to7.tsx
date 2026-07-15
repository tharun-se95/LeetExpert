"use client";

import { ArrayStrip } from "@/components/lab/primitives/ArrayStrip";
import type { PatternDemoModule } from "@/lib/visual/types";

/* ─── tiny shared helpers ───────────────────────────────────────── */

function pill(
  label: string,
  accent: string,
  opts: { active?: boolean; ghost?: boolean; dim?: boolean } = {},
) {
  const { active, ghost, dim } = opts;
  return (
    <span
      key={label + String(active) + String(ghost)}
      className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border px-2 font-mono text-xs font-bold transition-all"
      style={{
        borderColor: active || ghost ? accent : "var(--border)",
        background: active
          ? accent
          : ghost
            ? `color-mix(in oklab, ${accent} 18%, transparent)`
            : "var(--background)",
        color: active ? "#fff" : "var(--foreground)",
        opacity: dim ? 0.35 : ghost ? 0.55 : 1,
        boxShadow: active
          ? `0 0 12px color-mix(in oklab, ${accent} 55%, transparent)`
          : undefined,
      }}
    >
      {label}
    </span>
  );
}

function GraphNodes({
  positions,
  labels,
  accent,
  glow = [],
  ghosts = [],
  frontier = [],
  settled = [],
}: {
  positions: { x: number; y: number }[];
  labels: string[];
  accent: string;
  glow?: number[];
  ghosts?: number[];
  frontier?: number[];
  settled?: number[];
}) {
  const glowSet = new Set(glow);
  const ghostSet = new Set(ghosts);
  const frontSet = new Set(frontier);
  const settledSet = new Set(settled);
  return (
    <div className="relative mx-auto h-36 w-full max-w-sm">
      {labels.map((lab, i) => {
        const p = positions[i];
        const isGlow = glowSet.has(i);
        const isGhost = ghostSet.has(i);
        const isFront = frontSet.has(i);
        const isSettled = settledSet.has(i);
        return (
          <div
            key={lab}
            className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-xs font-bold transition-all"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              borderColor:
                isGlow || isFront || isSettled ? accent : "var(--border)",
              background: isGlow
                ? accent
                : isSettled
                  ? `color-mix(in oklab, ${accent} 35%, transparent)`
                  : isFront
                    ? `color-mix(in oklab, ${accent} 18%, transparent)`
                    : "var(--background)",
              color: isGlow ? "#fff" : "var(--foreground)",
              opacity: isGhost && !isGlow ? 0.4 : 1,
              boxShadow: isGlow
                ? `0 0 14px color-mix(in oklab, ${accent} 60%, transparent)`
                : undefined,
            }}
          >
            {lab}
          </div>
        );
      })}
    </div>
  );
}

function GraphEdges({
  edges,
  positions,
  accent,
  active = [],
  rejected = [],
}: {
  edges: [number, number][];
  positions: { x: number; y: number }[];
  accent: string;
  active?: number[];
  rejected?: number[];
}) {
  const act = new Set(active);
  const rej = new Set(rejected);
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {edges.map(([a, b], i) => {
        const pa = positions[a];
        const pb = positions[b];
        const on = act.has(i);
        const bad = rej.has(i);
        return (
          <line
            key={`${a}-${b}`}
            x1={pa.x}
            y1={pa.y}
            x2={pb.x}
            y2={pb.y}
            stroke={bad ? "var(--muted)" : on ? accent : "var(--border)"}
            strokeWidth={on ? 1.2 : 0.6}
            strokeDasharray={bad ? "2 2" : undefined}
            opacity={bad ? 0.45 : on ? 1 : 0.7}
          />
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FAMILY 4 — Recursive Exploration
   ═══════════════════════════════════════════════════════════════════ */

const DFS_POS = [
  { x: 50, y: 12 },
  { x: 22, y: 38 },
  { x: 78, y: 38 },
  { x: 12, y: 72 },
  { x: 38, y: 72 },
  { x: 78, y: 72 },
];
const DFS_LABELS = ["A", "B", "C", "D", "E", "F"];
const DFS_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [2, 5],
];

/** DFS — path glow + backtrack ghosts on a 6-node tree-ish graph */
export const dfsDemo: PatternDemoModule = {
  id: "recursive-exploration/dfs",
  title: "DFS",
  microExample: "graph A→B→D/E, A→C→F · start A",
  steps: [
    { caption: "Start at A. Path stack: [A]. Only the current node glows." },
    {
      caption:
        "Dive left to B. Path: A → B. Depth-first means go deeper before siblings.",
    },
    { caption: "Keep diving to D. Path: A → B → D. Dead end — nowhere left." },
    { caption: "Backtrack: D fades to a ghost. Return to B, then try E." },
    {
      caption:
        "Path: A → B → E. Ghosts mark visited dead ends we already explored.",
    },
    {
      caption:
        "Pop back to A, then C → F. Whole tree explored by going deep, then undoing.",
    },
  ],
  StepView({ step, accent }) {
    const frames = [
      { glow: [0], ghosts: [] as number[], edges: [] as number[], path: "A" },
      { glow: [0, 1], ghosts: [], edges: [0], path: "A → B" },
      { glow: [0, 1, 3], ghosts: [], edges: [0, 2], path: "A → B → D" },
      { glow: [0, 1, 4], ghosts: [3], edges: [0, 3], path: "A → B → E" },
      {
        glow: [0, 1, 4],
        ghosts: [3],
        edges: [0, 3],
        path: "A → B → E · ghosts=D",
      },
      {
        glow: [0, 2, 5],
        ghosts: [1, 3, 4],
        edges: [1, 4],
        path: "A → C → F",
      },
    ];
    const f = frames[Math.min(step, frames.length - 1)];
    return (
      <div className="relative w-full max-w-sm">
        <div className="relative h-36">
          <GraphEdges
            edges={DFS_EDGES}
            positions={DFS_POS}
            accent={accent}
            active={f.edges}
          />
          <GraphNodes
            positions={DFS_POS}
            labels={DFS_LABELS}
            accent={accent}
            glow={f.glow}
            ghosts={f.ghosts}
          />
        </div>
        <p className="mt-2 text-center font-mono text-[11px] text-muted">
          path: {f.path}
        </p>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div className="relative h-28 w-full max-w-xs">
        <GraphEdges
          edges={DFS_EDGES}
          positions={DFS_POS}
          accent={accent}
          active={[0, 2]}
        />
        <GraphNodes
          positions={DFS_POS}
          labels={DFS_LABELS}
          accent={accent}
          glow={[0, 1, 3]}
          ghosts={[4]}
        />
      </div>
    );
  },
};

const TREE_POS = [
  { x: 50, y: 14 },
  { x: 28, y: 48 },
  { x: 72, y: 48 },
  { x: 16, y: 82 },
  { x: 40, y: 82 },
];
const TREE_LABELS = ["1", "2", "3", "4", "5"];
const TREE_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
];

/** Tree Traversals — Pre / In / Post visit order */
export const treeTraversalsDemo: PatternDemoModule = {
  id: "recursive-exploration/tree-traversals",
  title: "Tree Traversals",
  microExample: "tree 1(2(4,5),3) · Pre / In / Post",
  steps: [
    { caption: "Same binary tree. Three ways to stamp visit order." },
    { caption: "Pre-order: root first → 1, then left subtree 2,4,5, then 3." },
    { caption: "In-order: left, root, right → 4, 2, 5, 1, 3 (sorted if BST)." },
    { caption: "Post-order: children before parent → 4, 5, 2, 3, 1." },
    {
      caption:
        "Pick the order from what you need: copy tree, print sorted, free nodes.",
    },
  ],
  StepView({ step, accent }) {
    const modes = [
      { name: "ready", order: [] as number[], reveal: 0, seq: "—" },
      {
        name: "PRE",
        order: [0, 1, 3, 4, 2],
        reveal: 5,
        seq: "1 → 2 → 4 → 5 → 3",
      },
      {
        name: "IN",
        order: [3, 1, 4, 0, 2],
        reveal: 5,
        seq: "4 → 2 → 5 → 1 → 3",
      },
      { name: "POST", order: [3, 4, 1, 2, 0], reveal: 3, seq: "4 → 5 → 2 …" },
      {
        name: "POST",
        order: [3, 4, 1, 2, 0],
        reveal: 5,
        seq: "4 → 5 → 2 → 3 → 1",
      },
    ];
    const m = modes[Math.min(step, modes.length - 1)];
    const shown = m.order.slice(0, m.reveal);
    const visitRank = new Map(shown.map((n, i) => [n, i + 1]));
    const current = shown.length ? shown[shown.length - 1] : -1;
    return (
      <div className="w-full max-w-sm">
        <p
          className="mb-1 text-center font-mono text-xs font-semibold"
          style={{ color: accent }}
        >
          {step === 0 ? "pick a walk" : m.name + "-order"}
        </p>
        <div className="relative h-36">
          <GraphEdges
            edges={TREE_EDGES}
            positions={TREE_POS}
            accent={accent}
            active={[0, 1, 2, 3]}
          />
          {TREE_LABELS.map((lab, i) => {
            const rank = visitRank.get(i);
            const on = shown.includes(i);
            const isCurrent = i === current;
            return (
              <div
                key={lab}
                className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 font-mono text-[10px] font-bold transition-all"
                style={{
                  left: `${TREE_POS[i].x}%`,
                  top: `${TREE_POS[i].y}%`,
                  borderColor: on ? accent : "var(--border)",
                  background: isCurrent
                    ? accent
                    : on
                      ? `color-mix(in oklab, ${accent} 28%, transparent)`
                      : "var(--background)",
                  color: isCurrent ? "#fff" : "var(--foreground)",
                  boxShadow: isCurrent
                    ? `0 0 12px color-mix(in oklab, ${accent} 55%, transparent)`
                    : undefined,
                }}
              >
                <span>{lab}</span>
                {rank != null ? (
                  <span className="text-[8px] opacity-90">#{rank}</span>
                ) : null}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-center font-mono text-[11px] text-muted">
          {m.seq}
        </p>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div className="text-center font-mono text-xs" style={{ color: accent }}>
        PRE 1-2-4-5-3 · IN 4-2-5-1-3 · POST 4-5-2-3-1
      </div>
    );
  },
};

/** Divide and Conquer — array bracket split / merge */
export const divideConquerDemo: PatternDemoModule = {
  id: "recursive-exploration/divide-and-conquer",
  title: "Divide and Conquer",
  microExample: "merge-sort style · arr = [8, 3, 5, 1]",
  steps: [
    { caption: "Whole array under one bracket. Too big — split the problem." },
    {
      caption:
        "Cut in half: [8, 3] | [5, 1]. Each half is a smaller twin of the original.",
    },
    {
      caption:
        "Split again to singles: [8]|[3] and [5]|[1]. Base case = size 1.",
    },
    {
      caption: "Merge conquer: sorted halves [3, 8] and [1, 5] glide together.",
    },
    { caption: "Final merge: [1, 3, 5, 8]. Split work, then combine answers." },
  ],
  StepView({ step, accent }) {
    const values =
      step <= 2 ? [8, 3, 5, 1] : step === 3 ? [3, 8, 1, 5] : [1, 3, 5, 8];
    const brackets = [
      [{ start: 0, end: 3, label: "all" }],
      [
        { start: 0, end: 1, label: "L" },
        { start: 2, end: 3, label: "R" },
      ],
      [
        { start: 0, end: 0, label: "8" },
        { start: 1, end: 1, label: "3" },
        { start: 2, end: 2, label: "5" },
        { start: 3, end: 3, label: "1" },
      ],
      [
        { start: 0, end: 1, label: "merge" },
        { start: 2, end: 3, label: "merge" },
      ],
      [{ start: 0, end: 3, label: "done" }],
    ];
    const br = brackets[Math.min(step, brackets.length - 1)];
    return (
      <div className="w-full max-w-md">
        <ArrayStrip
          values={values}
          accent={accent}
          highlight={step >= 4 ? [0, 1, 2, 3] : step === 3 ? [0, 1] : undefined}
        />
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {br.map((b) => (
            <span
              key={`${b.start}-${b.end}-${b.label}`}
              className="rounded-md border px-2 py-1 font-mono text-[10px] transition-all"
              style={{
                borderColor: accent,
                background: `color-mix(in oklab, ${accent} 12%, transparent)`,
                color: accent,
              }}
            >
              [{values.slice(b.start, b.end + 1).join(", ")}] · {b.label}
            </span>
          ))}
        </div>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <ArrayStrip
        values={[1, 3, 5, 8]}
        highlight={[0, 1, 2, 3]}
        accent={accent}
      />
    );
  },
};

/** Backtracking — perms of A B C grow / undo */
export const backtrackingDemo: PatternDemoModule = {
  id: "recursive-exploration/backtracking",
  title: "Backtracking",
  microExample: "permute [A, B, C] · grow & undo",
  steps: [
    { caption: "Empty path. Choices left: A, B, C. Try placing one letter." },
    { caption: "Pick A. Path = [A]. Still need slots for B and C." },
    { caption: "Pick B under A. Path = [A, B]. One choice left: C." },
    {
      caption:
        "Complete [A, B, C]. Record it, then undo C — try the sibling branch.",
    },
    {
      caption:
        "Undo B too. From [A] pick C instead → [A, C, B]. Branch and prune by undoing.",
    },
  ],
  StepView({ step, accent }) {
    const frames = [
      {
        path: [] as string[],
        remaining: ["A", "B", "C"],
        done: [] as string[],
        ghost: null as string | null,
      },
      { path: ["A"], remaining: ["B", "C"], done: [], ghost: null },
      { path: ["A", "B"], remaining: ["C"], done: [], ghost: null },
      { path: ["A", "B", "C"], remaining: [], done: ["ABC"], ghost: null },
      { path: ["A", "C"], remaining: ["B"], done: ["ABC"], ghost: "B" },
    ];
    const f = frames[Math.min(step, frames.length - 1)];
    return (
      <div className="w-full max-w-sm space-y-3">
        <div className="flex items-center justify-center gap-1">
          <span className="font-mono text-[10px] text-muted">path</span>
          {f.path.length === 0
            ? pill("∅", accent, { dim: true })
            : f.path.map((ch, i) =>
                pill(ch, accent, { active: i === f.path.length - 1 }),
              )}
          {f.ghost ? pill(f.ghost, accent, { ghost: true }) : null}
        </div>
        <div className="flex items-center justify-center gap-1">
          <span className="font-mono text-[10px] text-muted">left</span>
          {f.remaining.length === 0
            ? pill("—", accent, { dim: true })
            : f.remaining.map((ch) => pill(ch, accent))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1">
          <span className="font-mono text-[10px] text-muted">found</span>
          {f.done.length === 0 ? (
            <span className="text-[10px] text-muted">none yet</span>
          ) : (
            f.done.map((p) => pill(p, accent, { active: true }))
          )}
          {step >= 4 ? pill("ACB…", accent, { ghost: true }) : null}
        </div>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div className="flex justify-center gap-1">
        {["ABC", "ACB", "BAC"].map((p) =>
          pill(p, accent, { active: p === "ABC" }),
        )}
      </div>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════════
   FAMILY 5 — State Transition
   ═══════════════════════════════════════════════════════════════════ */

/** Memoization — fib(5) cache sticky notes */
export const memoizationDemo: PatternDemoModule = {
  id: "state-transition/memoization",
  title: "Memoization",
  microExample: "fib(5) · sticky-note cache",
  steps: [
    {
      caption: "Ask fib(5). No sticky note yet — must compute fib(4) + fib(3).",
    },
    {
      caption:
        "Dive to fib(4) → fib(3)+fib(2). Still blank cache. Recursion continues.",
    },
    { caption: "Hit fib(2)=1 and fib(1)=1. Pin sticky notes: 1→1, 2→1." },
    {
      caption:
        "fib(3) needed again? Pull the sticky instead of recomputing. Cache hit!",
    },
    {
      caption:
        "Fill up to fib(5)=5. Overlapping calls vanish once answers are labeled.",
    },
  ],
  StepView({ step, accent }) {
    const ask = ["fib(5)", "fib(4)", "fib(2)", "fib(3)", "fib(5)"];
    const cacheFrames: { n: number; v: number | null }[][] = [
      [
        { n: 1, v: null },
        { n: 2, v: null },
        { n: 3, v: null },
        { n: 4, v: null },
        { n: 5, v: null },
      ],
      [
        { n: 1, v: null },
        { n: 2, v: null },
        { n: 3, v: null },
        { n: 4, v: null },
        { n: 5, v: null },
      ],
      [
        { n: 1, v: 1 },
        { n: 2, v: 1 },
        { n: 3, v: null },
        { n: 4, v: null },
        { n: 5, v: null },
      ],
      [
        { n: 1, v: 1 },
        { n: 2, v: 1 },
        { n: 3, v: 2 },
        { n: 4, v: null },
        { n: 5, v: null },
      ],
      [
        { n: 1, v: 1 },
        { n: 2, v: 1 },
        { n: 3, v: 2 },
        { n: 4, v: 3 },
        { n: 5, v: 5 },
      ],
    ];
    const cache = cacheFrames[Math.min(step, cacheFrames.length - 1)];
    const hit = step === 3;
    return (
      <div className="w-full max-w-md space-y-3">
        <p className="text-center font-mono text-xs">
          calling{" "}
          <span className="font-bold" style={{ color: accent }}>
            {ask[Math.min(step, ask.length - 1)]}
          </span>
          {hit ? " · CACHE HIT" : ""}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {cache.map((c) => (
            <div
              key={c.n}
              className="flex h-14 w-14 rotate-[-2deg] flex-col items-center justify-center rounded-md border-2 font-mono text-xs shadow-sm transition-all"
              style={{
                borderColor: c.v != null ? accent : "var(--border)",
                background:
                  c.v != null
                    ? `color-mix(in oklab, ${accent} 16%, #fef9c3)`
                    : "var(--background)",
                transform:
                  hit && c.n === 3 ? "rotate(3deg) scale(1.08)" : undefined,
              }}
            >
              <span className="text-[10px] text-muted">fib({c.n})</span>
              <span className="font-bold">{c.v ?? "?"}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div
        className="flex justify-center gap-1 font-mono text-xs"
        style={{ color: accent }}
      >
        cache: 1→1 2→1 3→2 4→3 5→5
      </div>
    );
  },
};

/** Dynamic Programming — climb stairs n=5 row lights */
export const dynamicProgrammingDemo: PatternDemoModule = {
  id: "state-transition/dynamic-programming",
  title: "Dynamic Programming",
  microExample: "climbStairs(5) · dp[i] = dp[i-1] + dp[i-2]",
  steps: [
    {
      caption:
        "Stairs 0…5. Base lights: dp[0]=1 (stand still), dp[1]=1 (one step).",
    },
    {
      caption:
        "Step 2 lights up: 1+1 = 2 ways. Each cell only needs the two behind it.",
    },
    {
      caption:
        "Step 3: 2+1 = 3. Row of lights grows left → right, never recomputes.",
    },
    { caption: "Step 4: 3+2 = 5. Same Fibonacci recurrence, but bottom-up." },
    {
      caption:
        "Step 5: 5+3 = 8. Answer is the last bulb — O(n) pass, O(1) can even reuse.",
    },
  ],
  StepView({ step, accent }) {
    const dp = [1, 1, 2, 3, 5, 8];
    const lit = Math.min(step + 1, 5);
    return (
      <div className="w-full max-w-md">
        <div className="flex justify-center gap-1.5">
          {dp.map((v, i) => {
            const on = i <= lit;
            const newest = i === lit;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="flex h-12 w-10 items-center justify-center rounded-lg border-2 font-mono text-sm font-bold transition-all"
                  style={{
                    borderColor: on ? accent : "var(--border)",
                    background: on
                      ? newest
                        ? accent
                        : `color-mix(in oklab, ${accent} 22%, transparent)`
                      : "var(--background)",
                    color: newest ? "#fff" : "var(--foreground)",
                    boxShadow: newest
                      ? `0 0 14px color-mix(in oklab, ${accent} 50%, transparent)`
                      : undefined,
                    opacity: on ? 1 : 0.35,
                  }}
                >
                  {on ? v : "·"}
                </div>
                <span className="font-mono text-[10px] text-muted">i={i}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center font-mono text-[11px] text-muted">
          {lit >= 2
            ? `dp[${lit}] = dp[${lit - 1}] + dp[${lit - 2}] = ${dp[lit]}`
            : "base cases lit"}
        </p>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <ArrayStrip
        values={[1, 1, 2, 3, 5, 8]}
        highlight={[5]}
        accent={accent}
        size="sm"
      />
    );
  },
};

/** Greedy contrast — Jump Game reach line (cross-ref from DP page) */
export const greedyContrastDemo: PatternDemoModule = {
  id: "state-transition/greedy-contrast",
  title: "Greedy Contrast",
  microExample: "Jump Game · nums = [2, 3, 1, 1, 4]",
  steps: [
    {
      caption:
        "Can we reach the end? Track farthest reach line — not every path.",
    },
    { caption: "i=0 jump≤2 → reach line moves to index 2." },
    {
      caption:
        "i=1 jump≤3 → reach extends to 4 (the end!). Greedy keeps one number.",
    },
    {
      caption:
        "DP would store canReach[i] for each cell; greedy only needs the frontier.",
    },
    {
      caption:
        "When local best (farthest) proves global reachability — choose greedy over DP.",
    },
  ],
  StepView({ step, accent }) {
    const nums = [2, 3, 1, 1, 4];
    const reach = [0, 2, 4, 4, 4];
    const iAt = [0, 0, 1, 1, 4];
    const r = reach[Math.min(step, reach.length - 1)];
    const i = iAt[Math.min(step, iAt.length - 1)];
    return (
      <div className="w-full max-w-md">
        <ArrayStrip
          values={nums}
          highlight={[i]}
          window={{ left: 0, right: r }}
          accent={accent}
        />
        <div className="relative mt-2 h-6">
          <div
            className="absolute top-1 h-1 rounded-full transition-all"
            style={{
              left: "0%",
              width: `${((r + 0.5) / nums.length) * 100}%`,
              background: accent,
            }}
          />
          <span
            className="absolute top-3 font-mono text-[10px] font-bold transition-all"
            style={{
              left: `${((r + 0.5) / nums.length) * 100}%`,
              color: accent,
              transform: "translateX(-50%)",
            }}
          >
            reach={r}
          </span>
        </div>
        <p className="mt-4 text-center font-mono text-[11px] text-muted">
          i={i} · jump≤{nums[i]} · {r >= 4 ? "end reachable ✓" : "scanning"}
        </p>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <ArrayStrip
        values={[2, 3, 1, 1, 4]}
        window={{ left: 0, right: 4 }}
        highlight={[1]}
        accent={accent}
      />
    );
  },
};

/* ═══════════════════════════════════════════════════════════════════
   FAMILY 6 — Relationships
   ═══════════════════════════════════════════════════════════════════ */

const BFS_POS = [
  { x: 50, y: 12 },
  { x: 25, y: 42 },
  { x: 75, y: 42 },
  { x: 12, y: 78 },
  { x: 38, y: 78 },
  { x: 75, y: 78 },
];
const BFS_LABELS = ["0", "1", "2", "3", "4", "5"];
const BFS_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [2, 5],
];

/** BFS — wavefront levels + queue pills */
export const bfsDemo: PatternDemoModule = {
  id: "relationships/bfs",
  title: "BFS",
  microExample: "level-order from 0 · queue wavefront",
  steps: [
    { caption: "Start at 0. Queue = [0]. Level 0 wavefront lights up." },
    { caption: "Pop 0, enqueue kids 1 and 2. Queue = [1, 2]. Level 1 ring." },
    {
      caption:
        "Pop 1, enqueue 3 and 4. Queue = [2, 3, 4]. Still sweeping left→right.",
    },
    { caption: "Pop 2, enqueue 5. Queue = [3, 4, 5]. Level 2 almost full." },
    {
      caption:
        "Drain 3,4,5. Queue empty. Layers expanded like ripples in a pond.",
    },
  ],
  StepView({ step, accent }) {
    const frames = [
      { glow: [0], frontier: [] as number[], queue: ["0"], level: 0 },
      { glow: [0], frontier: [1, 2], queue: ["1", "2"], level: 1 },
      { glow: [0, 1], frontier: [2, 3, 4], queue: ["2", "3", "4"], level: 1 },
      {
        glow: [0, 1, 2],
        frontier: [3, 4, 5],
        queue: ["3", "4", "5"],
        level: 2,
      },
      {
        glow: [0, 1, 2, 3, 4, 5],
        frontier: [],
        queue: [] as string[],
        level: 2,
      },
    ];
    const f = frames[Math.min(step, frames.length - 1)];
    return (
      <div className="w-full max-w-sm space-y-2">
        <div className="relative h-36">
          <GraphEdges
            edges={BFS_EDGES}
            positions={BFS_POS}
            accent={accent}
            active={[0, 1, 2, 3, 4]}
          />
          <GraphNodes
            positions={BFS_POS}
            labels={BFS_LABELS}
            accent={accent}
            settled={f.glow}
            frontier={f.frontier}
            glow={f.frontier.length ? [f.frontier[0]] : f.glow.slice(-1)}
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1">
          <span className="font-mono text-[10px] text-muted">queue</span>
          {f.queue.length === 0
            ? pill("∅", accent, { dim: true })
            : f.queue.map((q, i) => pill(q, accent, { active: i === 0 }))}
        </div>
        <p className="text-center font-mono text-[11px] text-muted">
          level ≈ {f.level}
        </p>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div className="flex justify-center gap-1">
        {["0", "1", "2", "3"].map((q, i) =>
          pill(q, accent, { active: i === 0 }),
        )}
      </div>
    );
  },
};

/** Graph Traversal — side-by-side BFS vs DFS order (toggle via step) */
export const graphTraversalDemo: PatternDemoModule = {
  id: "relationships/graph-traversal",
  title: "Graph Traversal",
  microExample: "same graph · BFS order vs DFS order",
  steps: [
    { caption: "Shared graph. Mode: BFS. Visit order follows layers." },
    { caption: "BFS so far: 0, then 1 & 2. Wide before deep." },
    { caption: "BFS complete: 0 → 1 → 2 → 3 → 4 → 5." },
    { caption: "Flip to DFS. Same edges, different stack discipline." },
    { caption: "DFS order: 0 → 1 → 3 → 4 → 2 → 5 — deep tunnels first." },
  ],
  StepView({ step, accent }) {
    const mode = step <= 2 ? "BFS" : "DFS";
    const bfsOrder = [0, 1, 2, 3, 4, 5];
    const dfsOrder = [0, 1, 3, 4, 2, 5];
    const count =
      step === 0 ? 1 : step === 1 ? 3 : step === 2 ? 6 : step === 3 ? 1 : 6;
    const order = mode === "BFS" ? bfsOrder : dfsOrder;
    const visited = order.slice(0, count);
    return (
      <div className="w-full max-w-sm space-y-2">
        <p
          className="text-center font-mono text-xs font-bold"
          style={{ color: accent }}
        >
          mode: {mode}
        </p>
        <div className="relative h-36">
          <GraphEdges
            edges={BFS_EDGES}
            positions={BFS_POS}
            accent={accent}
            active={[0, 1, 2, 3, 4]}
          />
          <GraphNodes
            positions={BFS_POS}
            labels={BFS_LABELS}
            accent={accent}
            glow={visited.slice(-1)}
            settled={visited.slice(0, -1)}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-1">
          {visited.map((n, i) =>
            pill(String(n), accent, { active: i === visited.length - 1 }),
          )}
        </div>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div
        className="space-y-1 text-center font-mono text-[11px]"
        style={{ color: accent }}
      >
        <div>BFS 0-1-2-3-4-5</div>
        <div>DFS 0-1-3-4-2-5</div>
      </div>
    );
  },
};

/** Union Find — islands merge + path compression */
export const unionFindDemo: PatternDemoModule = {
  id: "relationships/union-find",
  title: "Union Find",
  microExample: "islands A B C D · union + path compression",
  steps: [
    { caption: "Four islands. Parent[i]=i. Each cell is its own boss." },
    { caption: "union(A,B): B's parent → A. One component of size 2." },
    { caption: "union(C,D): D → C. Two separate islands of pairs." },
    { caption: "union(A,C): link C's tree under A. One big component." },
    {
      caption:
        "find(D) with compression: D points straight to root A. Flat tree.",
    },
  ],
  StepView({ step, accent }) {
    const nodes = ["A", "B", "C", "D"];
    const parents = [
      ["A", "B", "C", "D"],
      ["A", "A", "C", "D"],
      ["A", "A", "C", "C"],
      ["A", "A", "A", "C"],
      ["A", "A", "A", "A"],
    ];
    const p = parents[Math.min(step, parents.length - 1)];
    return (
      <div className="w-full max-w-sm space-y-3">
        <div className="flex justify-center gap-3">
          {nodes.map((n, i) => {
            const root = p[i];
            const isRoot = root === n;
            return (
              <div key={n} className="flex flex-col items-center gap-1">
                {pill(n, accent, { active: isRoot || step >= 4 })}
                <span className="font-mono text-[10px] text-muted">
                  → {root}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-center font-mono text-[11px] text-muted">
          {step >= 4
            ? "path compressed · find(D)=A"
            : `components sketch · step ${step}`}
        </p>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div className="flex justify-center gap-2">
        {["A←B", "A←C", "A←D"].map((t) => pill(t, accent))}
      </div>
    );
  },
};

/** Topological Sort — Kahn indegree + queue belt */
export const topoSortDemo: PatternDemoModule = {
  id: "relationships/topological-sort",
  title: "Topological Sort",
  microExample: "courses A→B→D, A→C · Kahn indegree",
  steps: [
    {
      caption:
        "Count indegrees: A:0 B:1 C:1 D:2. Queue starts with indegree-0 nodes.",
    },
    {
      caption:
        "Belt pops A. Order=[A]. Reduce B and C indegrees → both become 0.",
    },
    { caption: "Enqueue B,C. Pop B. Order=[A,B]. D indegree 2→1." },
    { caption: "Pop C. Order=[A,B,C]. D indegree 1→0 — D joins the queue." },
    {
      caption:
        "Pop D. Order=[A,B,C,D]. Empty queue + all nodes → valid topo order.",
    },
  ],
  StepView({ step, accent }) {
    const frames = [
      { indeg: [0, 1, 1, 2], queue: ["A"], order: [] as string[] },
      { indeg: [0, 0, 0, 2], queue: ["B", "C"], order: ["A"] },
      { indeg: [0, 0, 0, 1], queue: ["C"], order: ["A", "B"] },
      { indeg: [0, 0, 0, 0], queue: ["D"], order: ["A", "B", "C"] },
      {
        indeg: [0, 0, 0, 0],
        queue: [] as string[],
        order: ["A", "B", "C", "D"],
      },
    ];
    const labs = ["A", "B", "C", "D"];
    const f = frames[Math.min(step, frames.length - 1)];
    return (
      <div className="w-full max-w-md space-y-3">
        <div className="flex justify-center gap-2">
          {labs.map((lab, i) => (
            <div key={lab} className="flex flex-col items-center gap-1">
              {pill(lab, accent, {
                active: f.order.includes(lab),
                dim:
                  f.indeg[i] > 0 &&
                  !f.order.includes(lab) &&
                  !f.queue.includes(lab),
              })}
              <span className="font-mono text-[10px] text-muted">
                deg {f.indeg[i]}
              </span>
            </div>
          ))}
        </div>
        <div
          className="flex flex-wrap items-center justify-center gap-1 rounded-lg border border-dashed px-2 py-2"
          style={{ borderColor: accent }}
        >
          <span className="font-mono text-[10px] text-muted">queue belt</span>
          {f.queue.length === 0
            ? pill("∅", accent, { dim: true })
            : f.queue.map((q, i) => pill(q, accent, { active: i === 0 }))}
        </div>
        <div className="flex flex-wrap justify-center gap-1">
          <span className="font-mono text-[10px] text-muted">order</span>
          {f.order.length === 0 ? (
            <span className="text-[10px] text-muted">—</span>
          ) : (
            f.order.map((o) => pill(o, accent, { active: true }))
          )}
        </div>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div className="flex justify-center gap-1">
        {["A", "B", "C", "D"].map((o) => pill(o, accent, { active: true }))}
      </div>
    );
  },
};

/** Dijkstra — costs tick, frontier, settle */
export const dijkstraDemo: PatternDemoModule = {
  id: "relationships/dijkstra",
  title: "Dijkstra",
  microExample: "S→A(2), S→B(5), A→B(1), B→T(3) · shortest S→T",
  steps: [
    { caption: "Dist[S]=0, others ∞. Frontier starts at S." },
    { caption: "Settle S. Relax A←2, B←5. Frontier = {A:2, B:5}." },
    {
      caption: "Pop closest A (2). Through A, B improves 5→3. Costs tick down.",
    },
    { caption: "Settle B at 3. Relax T←3+3=6. Frontier holds T." },
    { caption: "Settle T at 6. All closest-first — final distances locked." },
  ],
  StepView({ step, accent }) {
    const nodes = ["S", "A", "B", "T"];
    const frames = [
      { dist: ["0", "∞", "∞", "∞"], settled: [] as string[], frontier: ["S"] },
      { dist: ["0", "2", "5", "∞"], settled: ["S"], frontier: ["A", "B"] },
      { dist: ["0", "2", "3", "∞"], settled: ["S", "A"], frontier: ["B"] },
      { dist: ["0", "2", "3", "6"], settled: ["S", "A", "B"], frontier: ["T"] },
      {
        dist: ["0", "2", "3", "6"],
        settled: ["S", "A", "B", "T"],
        frontier: [] as string[],
      },
    ];
    const f = frames[Math.min(step, frames.length - 1)];
    return (
      <div className="w-full max-w-md space-y-3">
        <div className="flex justify-center gap-2">
          {nodes.map((n, i) => {
            const settled = f.settled.includes(n);
            const front = f.frontier.includes(n);
            return (
              <div key={n} className="flex flex-col items-center gap-1">
                {pill(n, accent, { active: settled, ghost: front && !settled })}
                <span
                  className="font-mono text-[11px] font-bold tabular-nums transition-all"
                  style={{ color: front || settled ? accent : "var(--muted)" }}
                >
                  {f.dist[i]}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap justify-center gap-1">
          <span className="font-mono text-[10px] text-muted">frontier</span>
          {f.frontier.length === 0
            ? pill("done", accent, { active: true })
            : f.frontier.map((x) => pill(x, accent, { active: true }))}
        </div>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div
        className="flex justify-center gap-2 font-mono text-xs"
        style={{ color: accent }}
      >
        <span>S:0</span>
        <span>A:2</span>
        <span>B:3</span>
        <span>T:6</span>
      </div>
    );
  },
};

/** MST — Kruskal edges accept / reject */
export const mstDemo: PatternDemoModule = {
  id: "relationships/minimum-spanning-tree",
  title: "Minimum Spanning Tree",
  microExample: "Kruskal · edges by weight 1,2,3,4,5",
  steps: [
    {
      caption:
        "Sort edges light→heavy. Start with no links. Forests are separate.",
    },
    { caption: "Accept weight-1 edge — connects two trees. MST grows." },
    { caption: "Accept weight-2. Still no cycle. Green = kept." },
    {
      caption:
        "Reject weight-3 — both ends already same component (would cycle).",
    },
    {
      caption:
        "Accept next needed edge. Spanning tree complete: n−1 accepted edges.",
    },
  ],
  StepView({ step, accent }) {
    const edges = [
      { a: "A", b: "B", w: 1 },
      { a: "B", b: "C", w: 2 },
      { a: "A", b: "C", w: 3 },
      { a: "C", b: "D", w: 4 },
      { a: "A", b: "D", w: 5 },
    ];
    const status = [
      ["?", "?", "?", "?", "?"],
      ["✓", "?", "?", "?", "?"],
      ["✓", "✓", "?", "?", "?"],
      ["✓", "✓", "✗", "?", "?"],
      ["✓", "✓", "✗", "✓", "·"],
    ];
    const st = status[Math.min(step, status.length - 1)];
    return (
      <div className="w-full max-w-md space-y-2">
        {edges.map((e, i) => {
          const s = st[i];
          const ok = s === "✓";
          const no = s === "✗";
          return (
            <div
              key={`${e.a}${e.b}${e.w}`}
              className="flex items-center justify-between rounded-lg border px-3 py-1.5 font-mono text-xs transition-all"
              style={{
                borderColor: ok || no ? accent : "var(--border)",
                background: ok
                  ? `color-mix(in oklab, ${accent} 18%, transparent)`
                  : no
                    ? "transparent"
                    : "var(--background)",
                opacity: s === "·" ? 0.35 : 1,
                textDecoration: no ? "line-through" : undefined,
              }}
            >
              <span>
                {e.a} — {e.b}
              </span>
              <span style={{ color: ok || no ? accent : "var(--muted)" }}>
                w={e.w} {s !== "?" && s !== "·" ? s : ""}
              </span>
            </div>
          );
        })}
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div
        className="space-y-1 font-mono text-[11px]"
        style={{ color: accent }}
      >
        <div>✓ A—B (1) · ✓ B—C (2) · ✗ A—C (3) · ✓ C—D (4)</div>
      </div>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════════
   FAMILY 7 — Priority Structures
   ═══════════════════════════════════════════════════════════════════ */

/** Stack — parentheses trays */
export const stackDemo: PatternDemoModule = {
  id: "priority-structures/stack",
  title: "Stack",
  microExample: 's = "()[]{}" · tray matching',
  steps: [
    {
      caption: "Empty tray stack. Read '('. Openers get pushed onto the tray.",
    },
    { caption: "See ')'. Top tray is '(' — match! Pop. Stack empty again." },
    {
      caption: "Push '['. Next closer must match this tray, not an older one.",
    },
    {
      caption:
        "After [] pops clean, push '{'. Same LIFO rule for curly braces.",
    },
    { caption: "See '}' — pop match. All trays cleared. Valid · ()[]{}." },
  ],
  StepView({ step, accent }) {
    const frames = [
      { stack: ["("], saw: "(", matched: "" },
      { stack: [] as string[], saw: ")", matched: "()" },
      { stack: ["["], saw: "[", matched: "()" },
      { stack: ["{"], saw: "{", matched: "()[]" },
      { stack: [] as string[], saw: "}", matched: "()[]{}" },
    ];
    const f = frames[Math.min(step, frames.length - 1)];
    return (
      <div className="w-full max-w-xs space-y-3">
        <p className="text-center font-mono text-xs text-muted">
          read: <span style={{ color: accent }}>{f.saw}</span>
          {f.matched ? ` · matched ${f.matched}` : ""}
        </p>
        <div
          className="mx-auto flex min-h-28 w-24 flex-col-reverse items-center justify-start gap-1 rounded-lg border-2 border-dashed p-2"
          style={{ borderColor: accent }}
        >
          {f.stack.length === 0 ? (
            <span className="font-mono text-[10px] text-muted">empty</span>
          ) : (
            f.stack.map((t, i) => (
              <div
                key={`${t}-${i}-${step}`}
                className="flex h-8 w-full items-center justify-center rounded-md border-2 font-mono text-sm font-bold transition-all"
                style={{
                  borderColor: accent,
                  background: accent,
                  color: "#fff",
                  transform:
                    i === f.stack.length - 1 ? "translateY(-2px)" : undefined,
                }}
              >
                {t}
              </div>
            ))
          )}
        </div>
        <p
          className="text-center text-xs font-semibold"
          style={{ color: accent }}
        >
          {step >= 4 ? "balanced ✓" : "matching…"}
        </p>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div className="text-center font-mono text-sm" style={{ color: accent }}>
        ()[]{} → stack ends empty ✓
      </div>
    );
  },
};

/** Queue — lunch line / level order teaser */
export const queueDemo: PatternDemoModule = {
  id: "priority-structures/queue",
  title: "Queue",
  microExample: "lunch line FIFO · teaser for tree level-order",
  steps: [
    { caption: "Empty lunch line. First student enqueues at the back." },
    {
      caption:
        "Line: [Ada]. Next enqueues Bob, then Cy — back of the line grows.",
    },
    {
      caption:
        "Serve (dequeue) Ada from the front. Line: [Bob, Cy]. Fair FIFO.",
    },
    {
      caption:
        "Same idea for tree level-order: enqueue kids at back, visit front.",
    },
    {
      caption: "Queue = 'who hasn't been served yet' — perfect for BFS layers.",
    },
  ],
  StepView({ step, accent }) {
    const frames = [
      { q: ["Ada"], front: "Ada" },
      { q: ["Ada", "Bob", "Cy"], front: "Ada" },
      { q: ["Bob", "Cy"], front: "Bob" },
      { q: ["Bob", "Cy", "kids…"], front: "Bob" },
      { q: ["layer2…"], front: "next" },
    ];
    const f = frames[Math.min(step, frames.length - 1)];
    return (
      <div className="w-full max-w-md space-y-2">
        <div className="flex items-center justify-center gap-1">
          <span className="font-mono text-[10px] text-muted">front</span>
          {f.q.map((person, i) => pill(person, accent, { active: i === 0 }))}
          <span className="font-mono text-[10px] text-muted">back</span>
        </div>
        <p className="text-center font-mono text-[11px] text-muted">
          serving → {f.front}
        </p>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div className="flex justify-center gap-1">
        {["front", "mid", "back"].map((x, i) =>
          pill(x, accent, { active: i === 0 }),
        )}
      </div>
    );
  },
};

/** Heap — tree + array bubble up / extract */
export const heapDemo: PatternDemoModule = {
  id: "priority-structures/heap-priority-queue",
  title: "Heap / Priority Queue",
  microExample: "min-heap · insert 3 then extract-min",
  steps: [
    { caption: "Heap array [2, 5, 8]. Tree view mirrors parent = (i-1)/2." },
    {
      caption: "Insert 3 at the end → [2, 5, 8, 3]. New leaf may be too small.",
    },
    {
      caption:
        "Bubble up: swap 3 with parent 5 → [2, 3, 8, 5]. Heap property restored.",
    },
    { caption: "Extract-min: pull root 2. Move last leaf 5 to root." },
    {
      caption: "Sift down: 5 vs kids 3,8 — swap with 3. Min-heap ready again.",
    },
  ],
  StepView({ step, accent }) {
    const arrays = [
      [2, 5, 8],
      [2, 5, 8, 3],
      [2, 3, 8, 5],
      [5, 3, 8],
      [3, 5, 8],
    ];
    const hi: number[][] = [[], [3], [1], [0], [0, 1]];
    const arr = arrays[Math.min(step, arrays.length - 1)];
    const highlight = hi[Math.min(step, hi.length - 1)];
    const treePos = [
      { x: 50, y: 18 },
      { x: 28, y: 55 },
      { x: 72, y: 55 },
      { x: 16, y: 88 },
    ];
    return (
      <div className="w-full max-w-sm space-y-2">
        <div className="relative mx-auto h-28 w-full">
          {arr.map((v, i) => {
            const p = treePos[i];
            if (!p) return null;
            const on = highlight.includes(i);
            return (
              <div
                key={`${v}-${i}-${step}`}
                className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-xs font-bold transition-all"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  borderColor: on ? accent : "var(--border)",
                  background: on ? accent : "var(--background)",
                  color: on ? "#fff" : "var(--foreground)",
                }}
              >
                {v}
              </div>
            );
          })}
        </div>
        <ArrayStrip
          values={arr}
          highlight={highlight}
          accent={accent}
          size="sm"
        />
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <ArrayStrip
        values={[3, 5, 8]}
        highlight={[0]}
        accent={accent}
        size="sm"
      />
    );
  },
};

/** Monotonic Stack — daily temps style pops */
export const monotonicStackDemo: PatternDemoModule = {
  id: "priority-structures/monotonic-stack",
  title: "Monotonic Stack",
  microExample: "temps = [73, 74, 75, 71, 69, 72] · next warmer",
  steps: [
    { caption: "Read 73. Stack holds indices of unresolved cooler days: [0]." },
    { caption: "74 is warmer — pop 0, answer[0]=1 day. Push 1." },
    { caption: "75 warmer still — pop 1 (1 day wait). Stack = [2]." },
    { caption: "71, 69 are cooler — they just pile on: [2, 3, 4]." },
    {
      caption:
        "72 warms past 69 and 71 — pop both with distances. Monotone decreasing breaks.",
    },
  ],
  StepView({ step, accent }) {
    const temps = [73, 74, 75, 71, 69, 72];
    const frames = [
      { i: 0, stack: [0], ans: ["?", "?", "?", "?", "?", "?"] },
      { i: 1, stack: [1], ans: ["1", "?", "?", "?", "?", "?"] },
      { i: 2, stack: [2], ans: ["1", "1", "?", "?", "?", "?"] },
      { i: 4, stack: [2, 3, 4], ans: ["1", "1", "?", "?", "?", "?"] },
      { i: 5, stack: [2, 5], ans: ["1", "1", "?", "2", "1", "?"] },
    ];
    const f = frames[Math.min(step, frames.length - 1)];
    return (
      <div className="w-full max-w-md space-y-2">
        <ArrayStrip
          values={temps}
          highlight={[f.i]}
          accent={accent}
          size="sm"
        />
        <div className="flex flex-wrap items-center justify-center gap-1">
          <span className="font-mono text-[10px] text-muted">stack idx</span>
          {f.stack.map((idx, i) =>
            pill(String(idx), accent, { active: i === f.stack.length - 1 }),
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-1">
          <span className="font-mono text-[10px] text-muted">wait</span>
          {f.ans.map((a, i) =>
            pill(a, accent, { active: a !== "?", dim: a === "?" }),
          )}
        </div>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <ArrayStrip
        values={[73, 74, 75, 71, 69, 72]}
        highlight={[5]}
        accent={accent}
        size="sm"
      />
    );
  },
};

/** Trie — letter hallway app / apple */
export const trieDemo: PatternDemoModule = {
  id: "priority-structures/trie",
  title: "Trie",
  microExample: 'insert "app", "apple" · letter hallway',
  steps: [
    { caption: 'Empty root hall. Insert "app": walk a → p → p, mark end.' },
    { caption: "Hallway lights: a-p-p. Shared prefix ready for more words." },
    {
      caption:
        'Insert "apple": reuse a-p-p, then add l → e. Branch only at the new suffix.',
    },
    { caption: 'Search "app": follow hall, land on an end-mark — found.' },
    {
      caption:
        'Prefix "ap" is a hallway that exists even before a word ends — autocomplete fuel.',
    },
  ],
  StepView({ step, accent }) {
    // nodes along path: root -a- p -p -l -e
    const letters = ["a", "p", "p", "l", "e"];
    const lit =
      step === 0 ? 3 : step === 1 ? 3 : step === 2 ? 5 : step === 3 ? 3 : 2;
    const endMarks = step >= 1 ? new Set([2]) : new Set<number>();
    if (step >= 2) endMarks.add(4);
    return (
      <div className="w-full max-w-md space-y-3">
        <div className="flex items-center justify-center gap-0">
          {pill("·", accent, { dim: true })}
          {letters.map((ch, i) => {
            const on = i < lit;
            const isEnd = endMarks.has(i);
            return (
              <div key={`${ch}-${i}`} className="flex items-center">
                <span className="mx-0.5 text-muted">─</span>
                <div
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg border-2 font-mono text-sm font-bold transition-all"
                  style={{
                    borderColor: on ? accent : "var(--border)",
                    background: on
                      ? `color-mix(in oklab, ${accent} 20%, transparent)`
                      : "var(--background)",
                    opacity: on ? 1 : 0.3,
                  }}
                >
                  {ch}
                  {isEnd ? (
                    <span
                      className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full"
                      style={{ background: accent }}
                      title="word end"
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-center font-mono text-[11px] text-muted">
          {step <= 1
            ? 'words: "app"'
            : step === 2
              ? 'words: "app", "apple"'
              : step === 3
                ? 'search "app" ✓'
                : 'prefix "ap" ✓ · autocomplete'}
        </p>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div
        className="flex items-center justify-center gap-1 font-mono text-xs"
        style={{ color: accent }}
      >
        a─p─p●─l─e●
      </div>
    );
  },
};

/** Convenience list for registerDemos([...]) / demoRegistry curated spread */
export const family4to7Demos: PatternDemoModule[] = [
  dfsDemo,
  treeTraversalsDemo,
  divideConquerDemo,
  backtrackingDemo,
  memoizationDemo,
  dynamicProgrammingDemo,
  greedyContrastDemo,
  bfsDemo,
  graphTraversalDemo,
  unionFindDemo,
  topoSortDemo,
  dijkstraDemo,
  mstDemo,
  stackDemo,
  queueDemo,
  heapDemo,
  monotonicStackDemo,
  trieDemo,
];
