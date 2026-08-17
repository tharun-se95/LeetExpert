import type { Diagnosis } from "./types";

const EMPTY = [
  "What pattern is this?",
  "Why did that case fail?",
  "What’s the next hint without spoiling it?",
];

// After a pass the pull is toward "give me a faster algorithm". These keep
// the learner on this lesson's bound instead.
const AFTER_PASS = [
  "What is the worst-case cost of what I wrote?",
  "Do I need a faster algorithm at these constraints?",
  "What should I take from this problem?",
];

const AFTER_FAIL = [
  "Why did that case fail?",
  "What’s the next hint without spoiling it?",
];

export function coachSuggestions(input: {
  hasChat: boolean;
  diagnosis: Diagnosis | null;
}): string[] {
  // Diagnosis wins over the empty state: a run that passed must not sit under
  // a "Why did that case fail?" chip just because they have not typed yet.
  if (input.diagnosis?.kind === "all-passed") return AFTER_PASS;
  if (input.diagnosis) return AFTER_FAIL;
  if (!input.hasChat) return EMPTY;
  return [];
}
