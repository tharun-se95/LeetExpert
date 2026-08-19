"use client";

import { useMemo } from "react";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { StatusPanel, Tape, type Tone } from "@/components/viz/pieces";
import { stringProp, speedProp } from "@/components/viz/props";
import type { VizCode, VizStep } from "@/components/viz/types";

const CODE: VizCode = {
  python: `def is_palindrome(s: str) -> bool:
    cleaned = [c.lower() for c in s if c.isalnum()]
    left, right = 0, len(cleaned) - 1
    while left < right:
        if cleaned[left] != cleaned[right]:
            return False
        left += 1
        right -= 1
    return True`,
  typescript: `function isPalindrome(s: string): boolean {
  const cleaned = [...s.toLowerCase()].filter((c) => /[a-z0-9]/.test(c));
  let left = 0;
  let right = cleaned.length - 1;
  while (left < right) {
    if (cleaned[left] !== cleaned[right]) return false;
    left++;
    right--;
  }
  return true;
}`,
};

interface PalindromeState {
  left: number;
  right: number;
  matched: number[];
  mismatch: number[];
  done: boolean;
  result: boolean | null;
}

function clean(s: string): string[] {
  return [...s.toLowerCase()].filter((c) => /[a-z0-9]/.test(c));
}

function buildSteps(chars: string[]): VizStep<PalindromeState>[] {
  const steps: VizStep<PalindromeState>[] = [];
  let left = 0;
  let right = chars.length - 1;
  const matched: number[] = [];

  const snap = (over: Partial<PalindromeState> = {}): PalindromeState => ({
    left,
    right,
    matched: [...matched],
    mismatch: [],
    done: false,
    result: null,
    ...over,
  });

  if (chars.length <= 1) {
    steps.push({
      caption: "Zero or one character — trivially a palindrome, nothing to compare.",
      line: { python: 3, typescript: 4 },
      state: snap({ done: true, result: true }),
    });
    return steps;
  }

  steps.push({
    caption: `left = 0, right = ${chars.length - 1}. Compare inward until they meet.`,
    line: { python: 3, typescript: 4 },
    state: snap(),
  });

  while (left < right) {
    if (chars[left] !== chars[right]) {
      steps.push({
        caption: `'${chars[left]}' at ${left} != '${chars[right]}' at ${right} — not a palindrome, stop immediately.`,
        line: { python: 5, typescript: 6 },
        state: snap({ mismatch: [left, right], result: false }),
      });
      return steps;
    }
    steps.push({
      caption: `'${chars[left]}' == '${chars[right]}' — this pair matches. Move both pointers inward.`,
      line: { python: 4, typescript: 5 },
      state: snap({ matched: [...matched, left, right] }),
    });
    matched.push(left, right);
    left += 1;
    right -= 1;
  }

  steps.push({
    caption: "left and right met (or crossed) — every pair matched. It's a palindrome.",
    line: { python: 8, typescript: 9 },
    state: snap({ left, right, done: true, result: true }),
  });
  return steps;
}

function cellTone(state: PalindromeState, i: number): Tone {
  if (state.mismatch.includes(i)) return "held";
  if (state.matched.includes(i)) return "result";
  if (!state.done && (i === state.left || i === state.right)) return "focal";
  return "default";
}

export function PalindromeCheckViz(props: Record<string, unknown>) {
  const { s, speed } = props;
  const raw = stringProp(s, "racecar");
  const chars = useMemo(() => clean(raw), [raw]);
  const steps = useMemo(() => buildSteps(chars), [chars]);

  return (
    <VizPlayer
      code={CODE}
      steps={steps}
      speedMs={speedProp(speed)}
      label="Palindrome two-pointer check"
      family="pointer-movement"
    >
      {(state, ctx) => (
        <div className="flex flex-col items-start gap-3">
          <Tape
            values={chars}
            toneFor={(i) => cellTone(state, i)}
            focal={state.left}
            markers={
              state.done
                ? []
                : [
                    { at: state.left, label: "L" },
                    { at: state.right, label: "R", color: "var(--muted)" },
                  ]
            }
            reduced={ctx.reduced}
          />
          {state.result !== null ? (
            <StatusPanel
              items={[{ label: "result", value: String(state.result) }]}
            />
          ) : null}
        </div>
      )}
    </VizPlayer>
  );
}
