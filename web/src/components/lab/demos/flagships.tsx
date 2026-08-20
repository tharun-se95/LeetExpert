"use client";

import { ArrayStrip } from "@/components/lab/primitives/ArrayStrip";
import { PointerMarkers } from "@/components/lab/primitives/PointerMarkers";
import type { PatternDemoModule } from "@/lib/visual/types";

/** Hash Maps — locker bank / Two Sum */
export const hashMapsDemo: PatternDemoModule = {
  id: "linear-traversal/hash-maps",
  title: "Hash Maps",
  microExample: "arr = [2, 7, 11, 15], target = 9",
  steps: [
    { caption: "Empty lockers. We need two numbers that add to 9." },
    { caption: "See 2 — store locker key 2 → index 0." },
    { caption: "See 7 — need complement 2. That locker already has an index!" },
    { caption: "Doors open: indices 0 and 1. Two Sum solved in one pass." },
    { caption: "Hash map turned a nested hunt into a labeled lookup." },
  ],
  StepView({ step, accent }) {
    const filled = step >= 1;
    const open = step >= 3;
    return (
      <div className="w-full max-w-md">
        <div className="mb-3 text-center font-mono text-xs text-muted">
          target = 9 · need complement
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[2, 7, 11, 15].map((key, i) => {
            const isStore = filled && i === 0;
            const isHit = open && (i === 0 || i === 1);
            return (
              <div key={key} className="flex flex-col items-center gap-1">
                <div
                  className="flex h-14 w-full items-center justify-center rounded-[length:var(--radius-md)] border-2 font-mono text-sm font-bold transition-all"
                  style={{
                    borderColor: isHit ? accent : "var(--border)",
                    background: isHit
                      ? `color-mix(in oklab, ${accent} 25%, transparent)`
                      : isStore
                        ? `color-mix(in oklab, ${accent} 12%, transparent)`
                        : "var(--background)",
                    transform: isHit
                      ? "perspective(200px) rotateY(-18deg)"
                      : undefined,
                    transformOrigin: "left center",
                  }}
                >
                  {isStore || isHit ? key : "·"}
                </div>
                <span className="font-mono text-[10px] text-muted">
                  {isStore || isHit ? `i=${i}` : "empty"}
                </span>
              </div>
            );
          })}
        </div>
        {open ? (
          <p
            className="mt-3 text-center text-xs font-semibold"
            style={{ color: accent }}
          >
            pair → [0, 1]
          </p>
        ) : null}
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <div className="text-center font-mono text-sm" style={{ color: accent }}>
        lockers: 2→0 open with 7→1 · Two Sum
      </div>
    );
  },
};

/** Sliding Window — film strip */
export const slidingWindowDemo: PatternDemoModule = {
  id: "pointer-movement/sliding-window",
  title: "Sliding Window",
  microExample: 's = "abcabcbb" · longest without repeat',
  steps: [
    { caption: "Start a glass frame on the first letter." },
    { caption: "Grow right: a-b-c — all unique, length 3." },
    { caption: "Next a repeats — shrink left past the old a." },
    { caption: "Frame slides: b-c-a · then c-a-b · keep best length." },
    { caption: "Duplicate b forces shrink again. Best stays 3." },
  ],
  StepView({ step, accent }) {
    const chars = ["a", "b", "c", "a", "b", "c", "b", "b"];
    const windows = [
      { left: 0, right: 0 },
      { left: 0, right: 2 },
      { left: 1, right: 3 },
      { left: 2, right: 4 },
      { left: 4, right: 5 },
    ];
    const w = windows[Math.min(step, windows.length - 1)];
    return (
      <div className="w-full">
        <ArrayStrip values={chars} window={w} accent={accent} />
        <PointerMarkers
          count={chars.length}
          pointers={[
            { index: w.left, label: "L", color: accent },
            { index: w.right, label: "R", color: accent },
          ]}
        />
        <p className="mt-2 text-center font-mono text-xs text-muted">
          window [{w.left}..{w.right}] length {w.right - w.left + 1}
        </p>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <ArrayStrip
        values={["a", "b", "c", "a", "b", "c", "b", "b"]}
        window={{ left: 0, right: 2 }}
        accent={accent}
      />
    );
  },
};

/** Two Pointers */
export const twoPointersDemo: PatternDemoModule = {
  id: "pointer-movement/two-pointers",
  title: "Two Pointers",
  microExample: "arr = [1,2,4,6,8,11], target = 10",
  steps: [
    { caption: "L at start, R at end. Sum = 1+11 = 12 — too big." },
    { caption: "Move R left. 1+8 = 9 — too small." },
    { caption: "Move L right. 2+8 = 10 — hit!" },
    { caption: "Pair glows. No nested loops needed." },
  ],
  StepView({ step, accent }) {
    const values = [1, 2, 4, 6, 8, 11];
    const poses = [
      { l: 0, r: 5 },
      { l: 0, r: 4 },
      { l: 1, r: 4 },
      { l: 1, r: 4 },
    ];
    const p = poses[Math.min(step, poses.length - 1)];
    const hit = step >= 2;
    return (
      <div>
        <ArrayStrip
          values={values}
          highlight={hit ? [p.l, p.r] : [p.l, p.r]}
          accent={accent}
        />
        <PointerMarkers
          count={values.length}
          pointers={[
            { index: p.l, label: "L", color: accent },
            { index: p.r, label: "R", color: accent },
          ]}
        />
        <p className="mt-2 text-center font-mono text-xs">
          sum = {values[p.l] + values[p.r]}
          {hit ? " ✓" : ""}
        </p>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <ArrayStrip
        values={[1, 2, 4, 6, 8, 11]}
        highlight={[1, 4]}
        accent={accent}
      />
    );
  },
};

/** Binary Search — origami fold */
export const binarySearchDemo: PatternDemoModule = {
  id: "ordering-search/binary-search",
  title: "Binary Search",
  microExample: "sorted = [0..15] look for 11",
  steps: [
    { caption: "Whole ruler is live: lo=0, hi=15." },
    { caption: "Mid lance at 7. 11 > 7 — fold the left half into fog." },
    { caption: "New mid 11 — exact hit. Search space collapses." },
    { caption: "Origami for numbers: half disappears each step." },
  ],
  StepView({ step, accent }) {
    const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    const ranges = [
      { lo: 0, hi: 15, mid: 7, dim: [] as number[] },
      { lo: 8, hi: 15, mid: 11, dim: [0, 1, 2, 3, 4, 5, 6, 7] },
      {
        lo: 11,
        hi: 11,
        mid: 11,
        dim: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15],
      },
      {
        lo: 11,
        hi: 11,
        mid: 11,
        dim: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15],
      },
    ];
    const r = ranges[Math.min(step, ranges.length - 1)];
    return (
      <div>
        <ArrayStrip
          values={values}
          highlight={[r.mid]}
          dimmed={r.dim}
          accent={accent}
          size="sm"
        />
        <p className="mt-2 text-center font-mono text-[11px] text-muted">
          lo={r.lo} · mid={r.mid} · hi={r.hi}
        </p>
      </div>
    );
  },
  StaticFrame({ accent }) {
    return (
      <ArrayStrip
        values={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]}
        highlight={[11]}
        dimmed={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15]}
        accent={accent}
        size="sm"
      />
    );
  },
};
