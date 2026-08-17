import { COACH_REFUSE } from "./types";

// Any fence, not just language-tagged: an untagged block is still a code dump.
const FENCE = /```/;

function fnDefinition(name: string): RegExp {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    String.raw`(?:def|function|const|let|var)\s+${escaped}\s*[=(]`,
    "i",
  );
}

export function filterCoachReply(
  reply: string,
  fn: { python: string; javascript: string },
): string {
  if (FENCE.test(reply)) return COACH_REFUSE;
  if (fnDefinition(fn.python).test(reply)) return COACH_REFUSE;
  if (fnDefinition(fn.javascript).test(reply)) return COACH_REFUSE;
  return reply;
}
