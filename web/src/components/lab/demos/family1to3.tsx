"use client";

import { ArrayStrip } from "@/components/lab/primitives/ArrayStrip";
import { PointerMarkers } from "@/components/lab/primitives/PointerMarkers";
import type { PatternDemoModule } from "@/lib/visual/types";

/** Arrays — tiles in a row: visit, swap, reverse */
export const arraysDemo: PatternDemoModule = {
  id: "linear-traversal/arrays",
  title: "Arrays",
  microExample: "arr = [4, 1, 7, 3, 9, 2, 5]",
  steps: [
    { caption: "Tiles in a row — each box has an address 0…6." },
    { caption: "Visit by address: the arrow lands on index 2 (value 7)." },
    { caption: "Swap 1 and 2 without building a new row — they leap-arc." },
    { caption: "Reverse: mirrors walk toward the center until order flips." },
    { caption: "Same seven tiles, new order — arrays mutate in place." },
  ],
  StepView({ step, accent }) {
    const base = [4, 1, 7, 3, 9, 2, 5];
    const swapped = [4, 7, 1, 3, 9, 2, 5];
    const reversed = [5, 2, 9, 3, 1, 7, 4];
    const values = step >= 4 ? reversed : step >= 2 ? swapped : base;
    const hi =
      step === 1
        ? [2]
        : step === 2
          ? [1, 2]
          : step === 3
            ? [0, 6]
            : step >= 4
              ? [0, 1, 2, 3, 4, 5, 6]
              : [];
    const leapA = step === 2;
    return (
      <div className="w-full max-w-lg">
        <div className="lab-motion flex flex-wrap items-end justify-center gap-1.5">
          {values.map((v, i) => {
            const isHi = hi.includes(i);
            const leap =
              leapA && (i === 1 || i === 2)
                ? i === 1
                  ? "translate(18px, -14px) rotate(-8deg)"
                  : "translate(-18px, -14px) rotate(8deg)"
                : step === 3 && (i === 0 || i === 6)
                  ? i === 0
                    ? "translateX(8px)"
                    : "translateX(-8px)"
                  : undefined;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-lg border font-mono text-sm font-semibold tabular-nums transition-all duration-300"
                  style={{
                    borderColor: isHi ? accent : "var(--border)",
                    background: isHi ? accent : "var(--background)",
                    color: isHi ? "#fff" : "var(--foreground)",
                    transform: leap,
                    boxShadow: leap
                      ? `0 8px 16px color-mix(in oklab, ${accent} 30%, transparent)`
                      : undefined,
                  }}
                >
                  {v}
                </div>
                <span className="font-mono text-[10px] text-muted">{i}</span>
              </div>
            );
          })}
        </div>
        {step === 1 ? (
          <PointerMarkers
            count={7}
            pointers={[{ index: 2, label: "i", color: accent }]}
            accent={accent}
          />
        ) : (
          <div className="h-9" aria-hidden />
        )}
        <p className="mt-1 text-center font-mono text-[11px] text-muted">
          {step === 0 && "addresses ready"}
          {step === 1 && "arr[2] = 7"}
          {step === 2 && "swap(1, 2)"}
          {step === 3 && "mirror 0↔6 · 1↔5 · …"}
          {step >= 4 && "reversed in place"}
        </p>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <ArrayStrip
        values={[5, 2, 9, 3, 1, 7, 4]}
        highlight={[0, 6]}
        accent={accent}
      />
    );
  },
};

/** Hash Sets — stamp tickets; reject duplicates */
export const hashSetsDemo: PatternDemoModule = {
  id: "linear-traversal/hash-sets",
  title: "Hash Sets",
  microExample: 'stream = [1, 2, 3, 2]  ·  stamp "seen"',
  steps: [
    {
      caption: "Tickets in a line. The stamp pad is empty — nothing seen yet.",
    },
    { caption: "Ticket 1 arrives — stamp it. Set now holds {1}." },
    { caption: "Ticket 2 stamps clean. Set = {1, 2}." },
    { caption: "Ticket 3 stamps. Set = {1, 2, 3}." },
    { caption: "Ticket 2 again — already stamped. Red X. Reject bounce." },
  ],
  StepView({ step, accent }) {
    const tickets = [1, 2, 3, 2];
    const seenCount = Math.min(step, 3);
    const reject = step >= 4;
    const stamped = new Set(tickets.slice(0, seenCount));
    return (
      <div className="w-full max-w-md">
        <div className="mb-3 flex flex-wrap justify-center gap-2">
          {tickets.map((t, i) => {
            const active = step === i + 1 || (reject && i === 3);
            const already = stamped.has(t) && i < seenCount;
            const isDupBeat = reject && i === 3;
            return (
              <div
                key={i}
                className="relative flex h-14 w-14 flex-col items-center justify-center rounded-full border-2 font-mono text-sm font-bold transition-all duration-300"
                style={{
                  borderColor: isDupBeat
                    ? "#e11d48"
                    : active || already
                      ? accent
                      : "var(--border)",
                  background:
                    already && !isDupBeat
                      ? `color-mix(in oklab, ${accent} 18%, transparent)`
                      : "var(--background)",
                  transform: isDupBeat
                    ? "translateY(-6px) scale(1.08)"
                    : active
                      ? "scale(1.05)"
                      : undefined,
                  opacity: i > step && !reject ? 0.45 : 1,
                }}
              >
                {t}
                {already && !isDupBeat ? (
                  <span
                    className="absolute -bottom-1 rounded px-1 font-mono text-[9px] font-semibold text-white"
                    style={{ background: accent }}
                  >
                    seen
                  </span>
                ) : null}
                {isDupBeat ? (
                  <span
                    className="absolute inset-0 flex items-center justify-center text-2xl font-black"
                    style={{ color: "#e11d48" }}
                    aria-hidden
                  >
                    ✕
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
        <div
          className="mx-auto flex min-h-10 max-w-xs flex-wrap items-center justify-center gap-1.5 rounded-lg border px-2 py-2 font-mono text-xs"
          style={{
            borderColor: `color-mix(in oklab, ${accent} 40%, var(--border))`,
            background: `color-mix(in oklab, ${accent} 8%, transparent)`,
          }}
        >
          <span className="text-muted">set =</span>
          {seenCount === 0 ? (
            <span className="text-muted">{"{ }"}</span>
          ) : (
            <span style={{ color: accent }}>
              {"{"}
              {[...stamped].join(", ")}
              {"}"}
            </span>
          )}
          {reject ? (
            <span className="ml-1 font-semibold" style={{ color: "#e11d48" }}>
              · dup rejected
            </span>
          ) : null}
        </div>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div className="text-center font-mono text-sm">
        <span style={{ color: accent }}>set = {"{1, 2, 3}"}</span>
        <span className="ml-2 text-muted">· 2 ✕ already seen</span>
      </div>
    );
  },
};

/** Prefix Sum — growing bars + range band */
export const prefixSumDemo: PatternDemoModule = {
  id: "linear-traversal/prefix-sum",
  title: "Prefix Sum",
  microExample: "arr = [3, 1, 4, 1, 5]  ·  range sum via prefix",
  steps: [
    { caption: "Raw bar heights: 3, 1, 4, 1, 5. Scan once left → right." },
    { caption: "Prefix grows: after index 1, running total is 4." },
    { caption: "Full prefix row written beneath: 3, 4, 8, 9, 14." },
    { caption: "Want sum(1..3)? Highlight the band — three bars in fog." },
    {
      caption: "Math: prefix[3] − prefix[0] = 9 − 3 = 6. Raise the left gate.",
    },
  ],
  StepView({ step, accent }) {
    const arr = [3, 1, 4, 1, 5];
    const prefix = [3, 4, 8, 9, 14];
    const filled = step === 0 ? 0 : step === 1 ? 2 : 5;
    const showPrefix = step >= 2;
    const band = step >= 3;
    const leftGate = step >= 4;
    const maxH = 56;
    const maxV = 5;
    return (
      <div className="w-full max-w-md">
        <div className="relative flex h-24 items-end justify-center gap-2">
          {arr.map((v, i) => {
            const on = i < filled || step >= 2;
            const inBand = band && i >= 1 && i <= 3;
            const h = (v / maxV) * maxH;
            return (
              <div key={i} className="relative flex w-10 flex-col items-center">
                <div
                  className="w-full rounded-t-md border transition-all duration-300"
                  style={{
                    height: on ? h : 4,
                    borderColor: inBand ? accent : "var(--border)",
                    background: inBand
                      ? `color-mix(in oklab, ${accent} 35%, transparent)`
                      : on
                        ? `color-mix(in oklab, ${accent} 55%, transparent)`
                        : "var(--border)",
                    transform:
                      leftGate && i === 0 ? "translateY(-10px)" : undefined,
                    opacity: leftGate && i === 0 ? 0.35 : 1,
                  }}
                />
                <span className="mt-1 font-mono text-[10px] text-muted">
                  {v}
                </span>
              </div>
            );
          })}
          {band ? (
            <div
              className="pointer-events-none absolute bottom-5 rounded-md border-2"
              style={{
                left: "18%",
                width: "52%",
                height: "70%",
                borderColor: accent,
                background: `color-mix(in oklab, ${accent} 10%, transparent)`,
              }}
              aria-hidden
            />
          ) : null}
        </div>
        <div className="mt-2 flex justify-center gap-2 font-mono text-[11px]">
          {showPrefix ? (
            prefix.map((p, i) => (
              <span
                key={i}
                className="rounded px-1.5 py-0.5 tabular-nums"
                style={{
                  background:
                    band && i === 3
                      ? accent
                      : leftGate && i === 0
                        ? `color-mix(in oklab, ${accent} 15%, transparent)`
                        : "transparent",
                  color: band && i === 3 ? "#fff" : accent,
                  textDecoration:
                    leftGate && i === 0 ? "line-through" : undefined,
                }}
              >
                {p}
              </span>
            ))
          ) : (
            <span className="text-muted">prefix growing…</span>
          )}
        </div>
        {step >= 4 ? (
          <p
            className="mt-2 text-center font-mono text-xs font-semibold"
            style={{ color: accent }}
          >
            9 − 3 = 6
          </p>
        ) : band ? (
          <p className="mt-2 text-center font-mono text-xs text-muted">
            band [1..3]
          </p>
        ) : null}
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div className="text-center font-mono text-sm" style={{ color: accent }}>
        prefix = [3,4,8,9,14] · sum(1..3) = 9−3 = 6
      </div>
    );
  },
};

/** Fast & Slow — tortoise / hare on a cyclic list */
export const fastSlowDemo: PatternDemoModule = {
  id: "pointer-movement/fast-and-slow-pointers",
  title: "Fast & Slow Pointers",
  microExample: "list = 0→1→2→3→4→2  ·  find the cycle",
  steps: [
    { caption: "Beads on a loop: node 4 secretly points back to 2." },
    { caption: "Slow and fast start at head. Slow hop = 1, fast hop = 2." },
    { caption: "Slow at 1, fast at 2 — still apart on the cycle rim." },
    { caption: "Slow at 2, fast at 4 — hare closes the gap." },
    { caption: "They meet at node 2. Loop confirmed — tortoise & hare." },
  ],
  StepView({ step, accent }) {
    // Positions for 5 nodes in a gentle arc + cycle tip
    const nodes = [
      { x: 28, y: 70, label: "0" },
      { x: 78, y: 40, label: "1" },
      { x: 140, y: 36, label: "2" },
      { x: 200, y: 48, label: "3" },
      { x: 248, y: 90, label: "4" },
    ];
    const poses = [
      { slow: 0, fast: 0 },
      { slow: 0, fast: 0 },
      { slow: 1, fast: 2 },
      { slow: 2, fast: 4 },
      { slow: 2, fast: 2 },
    ];
    const p = poses[Math.min(step, poses.length - 1)];
    const meet = step >= 4;
    const slowColor = "#0A7A6A";
    const fastColor = accent;
    return (
      <svg
        viewBox="0 0 280 140"
        className="lab-motion mx-auto h-36 w-full max-w-md"
      >
        {/* Main chain */}
        {nodes.slice(0, -1).map((n, i) => {
          const m = nodes[i + 1];
          return (
            <line
              key={`e${i}`}
              x1={n.x}
              y1={n.y}
              x2={m.x}
              y2={m.y}
              stroke="var(--border)"
              strokeWidth={2}
            />
          );
        })}
        {/* Cycle edge 4 → 2 */}
        <path
          d={`M ${nodes[4].x} ${nodes[4].y + 10} Q 190 130 ${nodes[2].x} ${nodes[2].y + 14}`}
          fill="none"
          stroke={accent}
          strokeWidth={2}
          strokeDasharray={step === 0 ? "4 3" : undefined}
          opacity={0.85}
        />
        {nodes.map((n, i) => {
          const isMeet = meet && i === 2;
          const isSlow = p.slow === i;
          const isFast = p.fast === i;
          return (
            <g key={i}>
              <circle
                cx={n.x}
                cy={n.y}
                r={isMeet ? 16 : 13}
                fill={isMeet ? accent : "var(--background)"}
                stroke={isMeet ? accent : "var(--border)"}
                strokeWidth={2}
                className="transition-all duration-300"
              />
              <text
                x={n.x}
                y={n.y + 4}
                textAnchor="middle"
                fontSize={11}
                fontFamily="var(--font-mono, monospace)"
                fontWeight={700}
                fill={isMeet ? "#fff" : "var(--foreground)"}
              >
                {n.label}
              </text>
              {isSlow && !isMeet ? (
                <circle cx={n.x - 10} cy={n.y + 18} r={5} fill={slowColor} />
              ) : null}
              {isFast && !isMeet ? (
                <circle cx={n.x + 10} cy={n.y + 18} r={5} fill={fastColor} />
              ) : null}
              {isSlow && isMeet ? (
                <circle cx={n.x - 8} cy={n.y + 22} r={4} fill={slowColor} />
              ) : null}
              {isFast && isMeet ? (
                <circle cx={n.x + 8} cy={n.y + 22} r={4} fill={fastColor} />
              ) : null}
            </g>
          );
        })}
        <text
          x={20}
          y={128}
          fontSize={10}
          fill={slowColor}
          fontFamily="monospace"
        >
          slow
        </text>
        <text
          x={60}
          y={128}
          fontSize={10}
          fill={fastColor}
          fontFamily="monospace"
        >
          fast
        </text>
        {meet ? (
          <text
            x={190}
            y={128}
            fontSize={11}
            fontWeight={700}
            fill={accent}
            fontFamily="monospace"
          >
            meet @ 2
          </text>
        ) : null}
      </svg>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div className="text-center font-mono text-sm" style={{ color: accent }}>
        slow ∩ fast @ node 2 · cycle proven
      </div>
    );
  },
};

/** Linked List Ops — reverse 4 nodes by rewiring pointers */
export const linkedListOpsDemo: PatternDemoModule = {
  id: "pointer-movement/linked-list-pointer-manipulation",
  title: "Linked List Pointer Manipulation",
  microExample: "list = A→B→C→D  ·  reverse in place",
  steps: [
    { caption: "Four nodes, cables point right. Head wears the crown (A)." },
    { caption: "Save B’s next. Unplug A→B — point A backward to null." },
    { caption: "Advance: prev=A, cur=B. Plug B→A. Cables flip one by one." },
    { caption: "C and D rewire the same way. New head crown lands on D." },
    { caption: "List reads D→C→B→A. Surgery done — no new nodes allocated." },
  ],
  StepView({ step, accent }) {
    const labels = ["A", "B", "C", "D"];
    // edge[i] = who node i points to (-1 = null)
    const edgesList = [
      [1, 2, 3, -1],
      [-1, 2, 3, -1],
      [-1, 0, 3, -1],
      [-1, 0, 1, -1],
      [-1, 0, 1, 2],
    ];
    const edges = edgesList[Math.min(step, edgesList.length - 1)];
    const head = step >= 3 ? 3 : 0;
    const xs = [40, 110, 180, 250];
    const y = 56;
    return (
      <svg
        viewBox="0 0 300 120"
        className="lab-motion mx-auto h-32 w-full max-w-md"
      >
        {labels.map((lab, i) => {
          const to = edges[i];
          if (to < 0) {
            // null stub to the left/right depending on reverse progress
            const stubRight = step < 2 && i === 3;
            const x2 = stubRight ? xs[i] + 28 : xs[i] - 28;
            return (
              <g key={`n${i}`}>
                <line
                  x1={xs[i]}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
                <text
                  x={x2}
                  y={y - 8}
                  fontSize={9}
                  fill="var(--muted-foreground, #888)"
                  fontFamily="monospace"
                >
                  null
                </text>
              </g>
            );
          }
          const x1 = xs[i];
          const x2 = xs[to];
          const mid = (x1 + x2) / 2;
          const leftward = to < i;
          const arch = leftward ? 22 : -6;
          const sx = leftward ? x1 - 14 : x1 + 14;
          const ex = leftward ? x2 + 14 : x2 - 14;
          return (
            <g key={`e${i}`}>
              <path
                d={`M ${sx} ${y} Q ${mid} ${y + arch} ${ex} ${y}`}
                fill="none"
                stroke={accent}
                strokeWidth={2.25}
                className="transition-all duration-300"
                markerEnd="url(#arrowHead)"
              />
            </g>
          );
        })}
        <defs>
          <marker
            id="arrowHead"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill={accent} />
          </marker>
        </defs>
        {labels.map((lab, i) => {
          const isHead = i === head && step !== 1;
          const active =
            (step === 1 && i === 0) ||
            (step === 2 && (i === 0 || i === 1)) ||
            (step === 3 && i >= 2) ||
            step >= 4;
          return (
            <g key={lab}>
              <circle
                cx={xs[i]}
                cy={y}
                r={16}
                fill={isHead ? accent : "var(--background)"}
                stroke={active || isHead ? accent : "var(--border)"}
                strokeWidth={2}
                className="transition-all duration-300"
                style={{
                  transform:
                    step === 2 && i === 1 ? "translateY(-4px)" : undefined,
                }}
              />
              <text
                x={xs[i]}
                y={y + 4}
                textAnchor="middle"
                fontSize={12}
                fontWeight={700}
                fontFamily="monospace"
                fill={isHead ? "#fff" : "var(--foreground)"}
              >
                {lab}
              </text>
              {isHead ? (
                <text
                  x={xs[i]}
                  y={y - 24}
                  textAnchor="middle"
                  fontSize={12}
                  fill={accent}
                >
                  ♔
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div className="text-center font-mono text-sm" style={{ color: accent }}>
        ♔ D → C → B → A → null
      </div>
    );
  },
};

/** Sorting — merge sort split / tint / zipper */
export const sortingDemo: PatternDemoModule = {
  id: "ordering-search/sorting",
  title: "Sorting",
  microExample: "arr = [5, 2, 8, 1, 9, 3, 7, 4]  ·  merge sort",
  steps: [
    { caption: "Eight messy bars. Merge sort will split, then stitch." },
    { caption: "Split down the middle — two brackets, left and right half." },
    { caption: "Each half sorts on its own (tint shows ordered crumbs)." },
    { caption: "Zipper merge: pick the smaller head from each half." },
    { caption: "One sorted tape. Order unlocked for every later hunt." },
  ],
  StepView({ step, accent }) {
    const original = [5, 2, 8, 1, 9, 3, 7, 4];
    const leftSorted = [1, 2, 5, 8];
    const rightSorted = [3, 4, 7, 9];
    const merged = [1, 2, 3, 4, 5, 7, 8, 9];
    const values =
      step >= 4
        ? merged
        : step >= 2
          ? [...leftSorted, ...rightSorted]
          : original;
    const maxV = 9;
    const maxH = 64;
    const split = step >= 1 && step < 4;
    const zipperAt = step === 3 ? 3 : -1;
    return (
      <div className="w-full max-w-lg">
        <div className="flex h-24 items-end justify-center gap-1.5">
          {values.map((v, i) => {
            const half = i < 4 ? "L" : "R";
            const tint =
              step >= 2 && step < 4
                ? half === "L"
                  ? `color-mix(in oklab, ${accent} 45%, transparent)`
                  : `color-mix(in oklab, ${accent} 20%, #2F6FED)`
                : step >= 4
                  ? accent
                  : `color-mix(in oklab, ${accent} 30%, transparent)`;
            const pull =
              zipperAt >= 0 && i === zipperAt
                ? "translateY(-10px) scaleY(1.08)"
                : undefined;
            return (
              <div key={i} className="flex w-8 flex-col items-center">
                <div
                  className="w-full rounded-t-md border transition-all duration-300"
                  style={{
                    height: (v / maxV) * maxH,
                    borderColor: accent,
                    background: tint,
                    transform: pull,
                    color: step >= 4 ? "#fff" : undefined,
                  }}
                />
                <span className="mt-1 font-mono text-[10px] tabular-nums text-muted">
                  {v}
                </span>
              </div>
            );
          })}
        </div>
        {split ? (
          <div className="mt-2 flex justify-center gap-8 font-mono text-[10px]">
            <span
              className="rounded border px-2 py-0.5"
              style={{ borderColor: accent, color: accent }}
            >
              left half
            </span>
            <span
              className="rounded border px-2 py-0.5"
              style={{ borderColor: accent, color: accent }}
            >
              right half
            </span>
          </div>
        ) : null}
        {step >= 4 ? (
          <p
            className="mt-2 text-center font-mono text-xs font-semibold"
            style={{ color: accent }}
          >
            merged · ascending
          </p>
        ) : step === 3 ? (
          <p className="mt-2 text-center font-mono text-xs text-muted">
            zipper picking next head…
          </p>
        ) : null}
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div className="flex items-end justify-center gap-1">
        {[1, 2, 3, 4, 5, 7, 8, 9].map((v) => (
          <div
            key={v}
            className="w-6 rounded-t-sm"
            style={{
              height: v * 6,
              background: accent,
            }}
          />
        ))}
      </div>
    );
  },
};

/** Intervals — capsule merge on a timeline */
export const intervalsDemo: PatternDemoModule = {
  id: "ordering-search/intervals",
  title: "Intervals",
  microExample: "intervals = [1,3], [2,6], [8,10], [15,18]",
  steps: [
    { caption: "Capsules on a timeline — meetings scatter across the day." },
    { caption: "Sort by start: shuffle into left-to-right order." },
    { caption: "[1,3] and [2,6] overlap — melt into one capsule [1,6]." },
    {
      caption: "[8,10] and [15,18] stay separate — no overlap with the merge.",
    },
    { caption: "Merged schedule: [1,6], [8,10], [15,18]. Calendar clear." },
  ],
  StepView({ step, accent }) {
    // Track as 0..20
    type Cap = { lo: number; hi: number; y: number; key: string };
    const raw: Cap[] = [
      { lo: 1, hi: 3, y: 0, key: "a" },
      { lo: 8, hi: 10, y: 1, key: "b" },
      { lo: 2, hi: 6, y: 2, key: "c" },
      { lo: 15, hi: 18, y: 0, key: "d" },
    ];
    const sorted: Cap[] = [
      { lo: 1, hi: 3, y: 0, key: "a" },
      { lo: 2, hi: 6, y: 1, key: "c" },
      { lo: 8, hi: 10, y: 0, key: "b" },
      { lo: 15, hi: 18, y: 0, key: "d" },
    ];
    const merging: Cap[] = [
      { lo: 1, hi: 6, y: 0, key: "m" },
      { lo: 8, hi: 10, y: 0, key: "b" },
      { lo: 15, hi: 18, y: 0, key: "d" },
    ];
    const caps = step >= 2 ? merging : step >= 1 ? sorted : raw;
    const scale = (n: number) => 16 + (n / 20) * 260;
    const rowH = 22;
    return (
      <div className="w-full max-w-md">
        <svg viewBox="0 0 300 100" className="lab-motion mx-auto h-28 w-full">
          <line
            x1={16}
            y1={88}
            x2={280}
            y2={88}
            stroke="var(--border)"
            strokeWidth={2}
          />
          {[0, 5, 10, 15, 20].map((t) => (
            <text
              key={t}
              x={scale(t)}
              y={98}
              fontSize={8}
              textAnchor="middle"
              fill="var(--muted-foreground, #888)"
              fontFamily="monospace"
            >
              {t}
            </text>
          ))}
          {caps.map((c, idx) => {
            const x = scale(c.lo);
            const w = scale(c.hi) - scale(c.lo);
            const y = 12 + c.y * rowH + (step >= 2 ? 10 : 0);
            const glow = step === 2 && c.key === "m";
            return (
              <g key={c.key + idx}>
                <rect
                  x={x}
                  y={y}
                  width={Math.max(w, 8)}
                  height={16}
                  rx={8}
                  fill={
                    glow
                      ? accent
                      : `color-mix(in oklab, ${accent} 28%, transparent)`
                  }
                  stroke={accent}
                  strokeWidth={1.75}
                  className="transition-all duration-300"
                  style={{
                    transform: glow ? "scaleY(1.15)" : undefined,
                    transformOrigin: "center",
                  }}
                />
                <text
                  x={x + w / 2}
                  y={y + 11}
                  textAnchor="middle"
                  fontSize={8}
                  fontFamily="monospace"
                  fontWeight={600}
                  fill={glow ? "#fff" : "var(--foreground)"}
                >
                  [{c.lo},{c.hi}]
                </text>
              </g>
            );
          })}
        </svg>
        {step >= 4 ? (
          <p
            className="text-center font-mono text-[11px]"
            style={{ color: accent }}
          >
            3 capsules remain
          </p>
        ) : null}
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div className="text-center font-mono text-sm" style={{ color: accent }}>
        [1,6] · [8,10] · [15,18]
      </div>
    );
  },
};

/** Sweep Line — vertical laser + active count */
export const sweepLineDemo: PatternDemoModule = {
  id: "ordering-search/sweep-line",
  title: "Sweep Line",
  microExample: "meetings = [1,4], [2,5], [6,8]  ·  max overlap",
  steps: [
    { caption: "Three meetings on a line. A vertical laser waits at x=0." },
    { caption: "Laser hits start@1 — active count ticks to 1." },
    { caption: "Start@2 opens another — active = 2. Peak stacks vivid." },
    { caption: "End@4 then end@5 close rooms — active falls to 0." },
    { caption: "Start@6…end@8 alone. Max overlap that day was 2." },
  ],
  StepView({ step, accent }) {
    const meetings = [
      { lo: 1, hi: 4, y: 0 },
      { lo: 2, hi: 5, y: 1 },
      { lo: 6, hi: 8, y: 0 },
    ];
    // laser x positions per step
    const laserXs = [0, 1, 2, 5, 7];
    const actives = [0, 1, 2, 0, 1];
    const lx = laserXs[Math.min(step, laserXs.length - 1)];
    const active = actives[Math.min(step, actives.length - 1)];
    const scale = (n: number) => 20 + (n / 10) * 250;
    const peak = active >= 2;
    return (
      <div className="relative w-full max-w-md">
        <div
          className="absolute right-1 top-0 rounded-md border px-2 py-1 font-mono text-[11px] font-bold tabular-nums"
          style={{
            borderColor: peak ? accent : "var(--border)",
            color: peak ? accent : "var(--foreground)",
            background: peak
              ? `color-mix(in oklab, ${accent} 16%, transparent)`
              : "var(--background)",
            transform: peak ? "scale(1.08)" : undefined,
          }}
        >
          active {active}
        </div>
        <svg viewBox="0 0 300 110" className="lab-motion mx-auto h-32 w-full">
          <line
            x1={20}
            y1={96}
            x2={280}
            y2={96}
            stroke="var(--border)"
            strokeWidth={2}
          />
          {meetings.map((m, i) => {
            const x = scale(m.lo);
            const w = scale(m.hi) - scale(m.lo);
            const y = 28 + m.y * 28;
            const live = lx >= m.lo && lx < m.hi;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={w}
                height={18}
                rx={6}
                fill={
                  live
                    ? `color-mix(in oklab, ${accent} ${peak && live ? 55 : 30}%, transparent)`
                    : `color-mix(in oklab, ${accent} 12%, transparent)`
                }
                stroke={accent}
                strokeWidth={live ? 2.25 : 1.5}
                className="transition-all duration-300"
                style={{
                  transform: live && peak ? "translateY(-2px)" : undefined,
                }}
              />
            );
          })}
          {/* laser */}
          <line
            x1={scale(lx)}
            y1={12}
            x2={scale(lx)}
            y2={96}
            stroke={accent}
            strokeWidth={2.5}
            className="transition-all duration-300"
          />
          <polygon
            points={`${scale(lx)},8 ${scale(lx) - 5},16 ${scale(lx) + 5},16`}
            fill={accent}
          />
        </svg>
        <p className="text-center font-mono text-[11px] text-muted">
          laser @ x={lx}
          {step >= 4 ? " · max was 2" : ""}
        </p>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div className="text-center font-mono text-sm" style={{ color: accent }}>
        laser peak · active = 2
      </div>
    );
  },
};

/** Convenience list for registerDemos([...]) */
export const family1to3Demos: PatternDemoModule[] = [
  arraysDemo,
  hashSetsDemo,
  prefixSumDemo,
  fastSlowDemo,
  linkedListOpsDemo,
  sortingDemo,
  intervalsDemo,
  sweepLineDemo,
];
