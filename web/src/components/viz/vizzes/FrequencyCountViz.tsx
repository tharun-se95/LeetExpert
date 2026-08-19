"use client";

import { useMemo } from "react";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { Node, StatusPanel, Tape, type Tone } from "@/components/viz/pieces";
import { stringProp, speedProp } from "@/components/viz/props";
import type { VizCode, VizStep } from "@/components/viz/types";

/** Single-string mode: matches string-toolkit's `letter_counts` exactly. */
const CODE_SINGLE: VizCode = {
  python: `def letter_counts(s: str) -> list[int]:
    counts = [0] * 26
    for ch in s:
        counts[ord(ch) - ord("a")] += 1
    return counts`,
  typescript: `function letterCounts(s: string): number[] {
  const counts = new Array(26).fill(0);
  const a = "a".charCodeAt(0);
  for (const ch of s) {
    counts[ch.charCodeAt(0) - a]++;
  }
  return counts;
}`,
};

/** Two-string mode: matches valid-anagram's fused single-pass solution exactly. */
const CODE_ANAGRAM: VizCode = {
  python: `def is_anagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    counts = [0] * 26
    a = ord("a")
    for ch_s, ch_t in zip(s, t):
        counts[ord(ch_s) - a] += 1
        counts[ord(ch_t) - a] -= 1
    return all(c == 0 for c in counts)`,
  typescript: `function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  const counts = new Array(26).fill(0);
  const a = "a".charCodeAt(0);
  for (let i = 0; i < s.length; i++) {
    counts[s.charCodeAt(i) - a]++;
    counts[t.charCodeAt(i) - a]--;
  }
  return counts.every((c) => c === 0);
}`,
};

interface FreqState {
  sIndex: number | null;
  tIndex: number | null;
  tally: Record<string, number>;
  order: string[];
  offending: string | null;
  done: boolean;
  result: boolean | null;
}

function buildSteps(s: string, t: string | null): VizStep<FreqState>[] {
  const steps: VizStep<FreqState>[] = [];
  const tally: Record<string, number> = {};
  const order: string[] = [];

  const snap = (over: Partial<FreqState> = {}): FreqState => ({
    sIndex: null,
    tIndex: null,
    tally: { ...tally },
    order: [...order],
    offending: null,
    done: false,
    result: null,
    ...over,
  });

  const track = (ch: string) => {
    if (!(ch in tally)) {
      order.push(ch);
      tally[ch] = 0;
    }
  };

  if (t === null) {
    steps.push({
      caption: "Walk the string, counting each letter into a fixed-size array — one slot per possible character.",
      line: { python: 3, typescript: 4 },
      state: snap(),
    });
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      track(ch);
      tally[ch] += 1;
      steps.push({
        caption: `'${ch}' → counts['${ch}'] = ${tally[ch]}.`,
        line: { python: 4, typescript: 5 },
        state: snap({ sIndex: i }),
      });
    }
    steps.push({
      caption: "Counting done. Two strings are rearrangements of each other exactly when their count arrays match.",
      line: { python: 5, typescript: 7 },
      state: snap({ done: true }),
    });
    return steps;
  }

  if (s.length !== t.length) {
    steps.push({
      caption: `Different lengths (${s.length} vs ${t.length}) — can't be rearrangements. Return false immediately.`,
      line: { python: 3, typescript: 2 },
      state: snap({ done: true, result: false }),
    });
    return steps;
  }

  steps.push({
    caption: "Same length — walk both strings together, incrementing for s and decrementing for t in the same pass.",
    line: { python: 6, typescript: 5 },
    state: snap(),
  });

  for (let i = 0; i < s.length; i++) {
    const chS = s[i];
    const chT = t[i];
    track(chS);
    track(chT);
    tally[chS] += 1;
    tally[chT] -= 1;
    steps.push({
      caption: `s[${i}] = '${chS}' → +1. t[${i}] = '${chT}' → -1. counts['${chS}'] = ${tally[chS]}${chS !== chT ? `, counts['${chT}'] = ${tally[chT]}` : " (same letter, net unchanged)"}.`,
      line: { python: 7, typescript: 6 },
      state: snap({ sIndex: i, tIndex: i }),
    });
  }

  const offending = order.find((ch) => tally[ch] !== 0) ?? null;
  steps.push({
    caption: offending
      ? `counts['${offending}'] = ${tally[offending]}, not zero — t doesn't have the exact same letters as s. Not an anagram.`
      : "Every slot returned to zero — s and t are anagrams.",
    line: { python: 8, typescript: 8 },
    state: snap({ done: true, result: offending === null, offending }),
  });
  return steps;
}

function sourceTone(index: number | null, i: number): Tone {
  return index === i ? "focal" : "default";
}

export function FrequencyCountViz(props: Record<string, unknown>) {
  const { s, t, speed } = props;
  const sVal = stringProp(s, "anagram");
  // Distinguish "t omitted" (single-string mode) from "t explicitly empty"
  // (two-string mode, which then correctly hits the length-mismatch check) —
  // t.length > 0 here would wrongly collapse the latter into the former.
  const tVal = typeof t === "string" ? stringProp(t, "") : null;
  const steps = useMemo(() => buildSteps(sVal, tVal), [sVal, tVal]);

  return (
    <VizPlayer
      code={tVal !== null ? CODE_ANAGRAM : CODE_SINGLE}
      steps={steps}
      speedMs={speedProp(speed)}
      label="Frequency count trace"
      family="linear-traversal"
    >
      {(state, ctx) => (
        <div className="flex flex-col items-start gap-3">
          <div className="flex flex-col gap-2">
            <Tape
              values={[...sVal]}
              toneFor={(i) => sourceTone(state.sIndex, i)}
              focal={state.sIndex}
              markers={
                state.sIndex !== null
                  ? [{ at: state.sIndex, label: "s" }]
                  : []
              }
              reduced={ctx.reduced}
            />
            {tVal !== null ? (
              <Tape
                values={[...tVal]}
                toneFor={(i) => sourceTone(state.tIndex, i)}
                focal={state.tIndex}
                markers={
                  state.tIndex !== null
                    ? [{ at: state.tIndex, label: "t", color: "var(--muted)" }]
                    : []
                }
                reduced={ctx.reduced}
              />
            ) : null}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {state.order.map((letter) => (
              <Node
                key={letter}
                value={state.tally[letter]}
                sub={letter}
                shape="square"
                size={40}
                state={
                  state.offending === letter
                    ? "held"
                    : state.done
                      ? "result"
                      : "visited"
                }
                reduced={ctx.reduced}
              />
            ))}
          </div>

          {state.result !== null ? (
            <StatusPanel
              items={[
                {
                  label: "result",
                  value: String(state.result),
                },
              ]}
            />
          ) : null}
        </div>
      )}
    </VizPlayer>
  );
}
