import type { CoachChatRequest, CoachMessage, CoachProblem } from "./types";

export function buildSystemPrompt(fn: { python: string; javascript: string }): string {
  return [
    "You are a Socratic DSA coach for this one problem.",
    "Ask a question or point at the next authored hint.",
    `Never implement ${fn.python} or ${fn.javascript}.`,
    "Never paste a full algorithm, pseudocode that is the algorithm, or a code fence.",
    "Write math and identifiers in plain text (O(n*m), n and m). Never LaTeX.",
    "If asked for the solution, refuse and ask a smaller question.",
    "A question about language syntax or a built-in (what a keyword, slice, or method does — not this problem's algorithm) gets a direct, factual answer, then a question that returns to the problem. The Socratic rule protects the solution to this problem, not the learner's grasp of the language.",
    "Use the diagnosis facts; do not invent case outputs.",
    "If the last user message is short or ambiguous (yes, no, idk, ok), ask which meaning they meant before teaching further.",
    "After they pass, stay on this lesson's thesis. Do not assign a faster or different algorithm unless they clearly insist. Naming one as later reading is allowed; walking them through it is not.",
    "Do not dump authored hint bodies verbatim unless the learner already opened that hint.",
  ].join(" ");
}

/** Gold-problem wording used by the prompt contract test. */
export const COACH_SYSTEM_PROMPT = buildSystemPrompt({
  python: "two_sum",
  javascript: "twoSum",
});

const MAX_MESSAGES = 12;

export function buildModelMessages(
  problem: CoachProblem,
  request: CoachChatRequest,
): { system: string; messages: CoachMessage[] } {
  const hints = problem.hints
    .map((h) => `${h.index}. ${h.label}\n${h.body}`)
    .join("\n\n");

  const context = [
    `Problem: ${problem.title}`,
    problem.statement,
    "",
    "Lesson thesis (after they pass, stay here; if empty, use Attempt it first and the constraints):",
    problem.thesis || "(none)",
    "",
    "Authored hints (do not dump these verbatim unless the learner already opened them; prefer pointing at the next index):",
    hints || "(none)",
    "",
    `Language: ${request.lang}`,
    "Learner code:",
    request.code,
    "",
    request.diagnosis
      ? `Last diagnosis: ${request.diagnosis.prose}`
      : "No diagnosis yet.",
  ].join("\n");

  const prior = request.messages.slice(-MAX_MESSAGES);
  return {
    system: `${buildSystemPrompt(problem.fn)}\n\n${context}`,
    messages: prior,
  };
}
