import { diagnose } from "@/lib/coach/diagnose";
import type { Diagnosis } from "@/lib/coach/types";
import type { ThreadItem } from "@/components/coach/CoachProvider";
import { formatCall, pretty } from "@/lib/sandbox/compare";

/**
 * Build's worked problem: one pair-sum question carried through Code, Review
 * and Optimize (the six habits folded in, owner 2026-09-17). Every value the
 * windows show is computed here from METHOD_VALUES.
 * Spec: docs/superpowers/specs/2026-09-15-landing-product-page-design.md §12
 */

/**
 * The problem's input. It was the hero drawing's values until the drawing
 * became unlabelled floating points (2026-09-20); it keeps them so the worked
 * problem did not change with it.
 */
export const METHOD_VALUES: readonly number[] = [5, 3, 8, 1, 4, 7, 9];
/** Chosen so exactly one pair sums to it (7 + 9); the test checks by brute force. */
export const METHOD_TARGET = 16;

export type Pair = readonly [number, number];

/** The correct pass: look for the partner before adding the number. */
export function findPair(nums: readonly number[], target: number): Pair | null {
  const seen = new Set<number>();
  for (const n of nums) {
    if (seen.has(target - n)) return [target - n, n];
    seen.add(n);
  }
  return null;
}

/** The broken draft Review shows: adding first lets a number pair with itself. */
export function findPairAddFirst(nums: readonly number[], target: number): Pair | null {
  const seen = new Set<number>();
  for (const n of nums) {
    seen.add(n);
    if (seen.has(target - n)) return [target - n, n];
  }
  return null;
}

export const METHOD_PAIR: Pair = findPair(METHOD_VALUES, METHOD_TARGET)!;

/** The draft Review catches; executed by python3 in landingFeatures.test.tsx. */
export const DRAFT_SNIPPET = [
  "def find_pair(nums, target):",
  "    seen = set()",
  "    for n in nums:",
  "        seen.add(n)",
  "        if target - n in seen:",
  "            return (target - n, n)",
  "    return None",
] as const;

/** The draft line that causes the bug: adding before checking. */
export const DRAFT_FLAGGED_LINE = 3;

/**
 * What the coach says about the draft on the worked problem — the app's own
 * diagnose(), fed the draft's computed result, so the card reads exactly as it
 * would in a lesson. No hints exist on the landing sandbox, so none is offered.
 */
export function reviewDiagnosis(): Diagnosis {
  const got = findPairAddFirst(METHOD_VALUES, METHOD_TARGET);
  return diagnose({
    results: [
      {
        index: 0,
        name: formatCall("find_pair", [METHOD_VALUES, METHOD_TARGET]),
        passed: false,
        got: pretty(got),
        expected: pretty(METHOD_PAIR),
        error: null,
        logs: [],
        logsDropped: 0,
      },
    ],
    fatal: null,
    hintCount: 0,
    failCount: 1,
    property: false,
  });
}

/**
 * Review's coach thread (owner, 2026-09-19: the real panel, scripted): the
 * diagnosis card above, the learner asking about the result it names, and a
 * reply that points at the draft's own flagged line without writing the fix.
 * Every number and line in it is computed from the draft.
 */
export function reviewThread(): ThreadItem[] {
  const got = findPairAddFirst(METHOD_VALUES, METHOD_TARGET);
  if (!got || got[0] !== got[1]) throw new Error("the draft must pair a number with itself");
  const self = got[1];
  const flagged = DRAFT_SNIPPET[DRAFT_FLAGGED_LINE]!.trim();
  return [
    { id: "diagnosis", kind: "diagnosis", diagnosis: reviewDiagnosis() },
    { id: "ask", kind: "user", content: `Why did it return ${pretty(got)}?` },
    {
      id: "reply",
      kind: "assistant",
      content:
        `Your loop runs \`${flagged}\` before it looks for \`target - n\`. ` +
        `When \`n\` is ${self}, the partner it looks for is ${METHOD_TARGET - self}, ` +
        `and the ${self} it finds is the one it just stored, so ${self} pairs with itself.\n\n` +
        "What changes if you look for the partner first?",
    },
  ];
}

/** What the locked composer says on the landing page. */
export const COACH_LOCKED = "Open a problem to ask the coach about your own code.";
