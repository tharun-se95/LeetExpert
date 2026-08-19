"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { VizPlayer } from "@/components/viz/VizPlayer";
import {
  SLOT_STEP_REM,
  StatusPanel,
  Tape,
  type Tone,
} from "@/components/viz/pieces";
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

function haystackTone(state: SearchState, i: number, m: number): Tone {
  const offset = i - state.candidateStart;
  if (state.found !== null && i >= state.found && i < state.found + m) return "result";
  if (offset < 0 || offset >= m) return "default";
  if (state.failed && offset === state.compareIndex) return "held";
  if (offset < state.matched) return "result";
  if (offset === state.compareIndex) return "focal";
  return "default";
}

function needleTone(state: SearchState, j: number): Tone {
  if (state.found !== null) return "result";
  if (state.failed && j === state.compareIndex) return "held";
  if (j < state.matched) return "result";
  if (j === state.compareIndex) return "focal";
  return "default";
}

export function SubstringSearchViz(props: Record<string, unknown>) {
  const { haystack, needle, speed } = props;
  const hVal = stringProp(haystack, "sadbutsad");
  const nVal = stringProp(needle, "sad");
  const steps = useMemo(() => buildSteps(hVal, nVal), [hVal, nVal]);
  const m = nVal.length;

  return (
    <VizPlayer
      code={CODE}
      steps={steps}
      speedMs={speedProp(speed)}
      label="Naive substring search trace"
      family="pointer-movement"
    >
      {(state, ctx) => (
        <div className="flex flex-col items-start gap-2">
          <Tape
            values={[...hVal]}
            toneFor={(i) => haystackTone(state, i, m)}
            focal={
              state.compareIndex !== null
                ? state.candidateStart + state.compareIndex
                : null
            }
            window={
              state.candidateStart + m - 1 < hVal.length
                ? { lo: state.candidateStart, hi: state.candidateStart + m - 1 }
                : null
            }
            markers={[
              { at: state.candidateStart, label: "i", color: "var(--muted)" },
            ]}
            reduced={ctx.reduced}
          />
          <motion.div
            aria-hidden
            initial={false}
            animate={{
              paddingLeft: `${state.candidateStart * SLOT_STEP_REM}rem`,
            }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 34,
            }}
          >
            <Tape values={[...nVal]} toneFor={(j) => needleTone(state, j)} hideIndices reduced={ctx.reduced} />
          </motion.div>
          {state.done ? (
            <StatusPanel
              items={[
                { label: "result", value: state.found !== null ? state.found : -1 },
              ]}
            />
          ) : null}
        </div>
      )}
    </VizPlayer>
  );
}
