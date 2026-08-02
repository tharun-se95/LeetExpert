"use client";

import { useMemo } from "react";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { Cell, Legend, type CellTone } from "@/components/viz/pieces";
import { stringProp, speedProp } from "@/components/viz/props";
import type { VizCode, VizStep } from "@/components/viz/types";

const CODE: VizCode = {
  python: `def str_str(haystack: str, needle: str) -> int:
    n, m = len(haystack), len(needle)
    for i in range(n - m + 1):
        j = 0
        while j < m and haystack[i + j] == needle[j]:
            j += 1
        if j == m:
            return i
    return -1`,
  typescript: `function strStr(haystack: string, needle: string): number {
  const n = haystack.length, m = needle.length;
  for (let i = 0; i <= n - m; i++) {
    let j = 0;
    while (j < m && haystack[i + j] === needle[j]) j++;
    if (j === m) return i;
  }
  return -1;
}`,
};

interface SearchState {
  candidateStart: number;
  compareIndex: number | null;
  matched: number;
  failed: boolean;
  found: number | null;
  done: boolean;
}

function buildSteps(haystack: string, needle: string): VizStep<SearchState>[] {
  const steps: VizStep<SearchState>[] = [];
  const n = haystack.length;
  const m = needle.length;

  const snap = (over: Partial<SearchState>): SearchState => ({
    candidateStart: 0,
    compareIndex: null,
    matched: 0,
    failed: false,
    found: null,
    done: false,
    ...over,
  });

  if (m === 0 || m > n) {
    steps.push({
      caption: m === 0 ? "Empty needle matches at index 0." : "Needle is longer than haystack — no candidate window fits.",
      line: { python: 3, typescript: 3 },
      state: snap({ found: m === 0 ? 0 : null, done: true }),
    });
    return steps;
  }

  for (let i = 0; i <= n - m; i++) {
    steps.push({
      caption: `Try candidate start i = ${i}: does needle line up with haystack[${i}..${i + m}]?`,
      line: { python: 3, typescript: 3 },
      state: snap({ candidateStart: i }),
    });
    let j = 0;
    while (j < m && haystack[i + j] === needle[j]) {
      j += 1;
      steps.push({
        caption: `haystack[${i + j - 1}] == needle[${j - 1}] ('${needle[j - 1]}') — keep going.`,
        line: { python: 5, typescript: 4 },
        state: snap({ candidateStart: i, compareIndex: j - 1, matched: j }),
      });
    }
    if (j === m) {
      steps.push({
        caption: `All ${m} characters matched — found at index ${i}.`,
        line: { python: 7, typescript: 5 },
        state: snap({ candidateStart: i, matched: m, found: i, done: true }),
      });
      return steps;
    }
    steps.push({
      caption: `haystack[${i + j}] != needle[${j}] ('${needle[j]}') — this candidate fails, slide to the next start.`,
      line: { python: 4, typescript: 4 },
      state: snap({ candidateStart: i, compareIndex: j, matched: j, failed: true }),
    });
  }

  steps.push({
    caption: "Every candidate start failed — needle doesn't occur in haystack. Return -1.",
    line: { python: 8, typescript: 7 },
    state: snap({ candidateStart: n - m, found: null, done: true }),
  });
  return steps;
}

function haystackTone(state: SearchState, i: number, m: number): CellTone {
  const offset = i - state.candidateStart;
  if (state.found !== null && i >= state.found && i < state.found + m) return "resolved";
  if (offset < 0 || offset >= m) return "plain";
  if (state.failed && offset === state.compareIndex) return "dropped";
  if (offset < state.matched) return "resolved";
  if (offset === state.compareIndex) return "active";
  return "plain";
}

function needleTone(state: SearchState, j: number): CellTone {
  if (state.found !== null) return "resolved";
  if (state.failed && j === state.compareIndex) return "dropped";
  if (j < state.matched) return "resolved";
  if (j === state.compareIndex) return "active";
  return "plain";
}

export function SubstringSearchViz(props: Record<string, unknown>) {
  const { haystack, needle, speed } = props;
  const hVal = stringProp(haystack, "sadbutsad");
  const nVal = stringProp(needle, "sad");
  const steps = useMemo(() => buildSteps(hVal, nVal), [hVal, nVal]);

  return (
    <VizPlayer
      code={CODE}
      steps={steps}
      speedMs={speedProp(speed)}
      label="Naive substring search trace"
      family="pointer-movement"
    >
      {(state) => (
        <div className="flex flex-col items-start gap-2">
          <div className="flex gap-1.5">
            {[...hVal].map((c, i) => (
              <Cell key={`h${i}`} value={c} index={i} tone={haystackTone(state, i, nVal.length)} />
            ))}
          </div>
          <div className="flex gap-1.5" style={{ paddingLeft: `${state.candidateStart * 2.875}rem` }}>
            {[...nVal].map((c, j) => (
              <Cell key={`n${j}`} value={c} tone={needleTone(state, j)} />
            ))}
          </div>
          {state.done ? (
            <div className="font-mono text-[11px] text-muted">
              result{" "}
              <span className="font-semibold text-foreground">
                {state.found !== null ? state.found : -1}
              </span>
            </div>
          ) : null}
          <Legend
            items={[
              { tone: "active", label: "comparing" },
              { tone: "resolved", label: "matched" },
              { tone: "dropped", label: "candidate failed" },
            ]}
          />
        </div>
      )}
    </VizPlayer>
  );
}
