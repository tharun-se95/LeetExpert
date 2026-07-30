/**
 * Splits a problem lesson's post-sandbox markdown into the Explanation and
 * Solution tabs used by the `/problems/[slug]` IDE layout.
 *
 * Convention: almost every problem has a top-level `## Solution` heading.
 * Content before that is approach/hints; from that heading onward is the
 * revealable solution. The four lessons without the heading put everything
 * under Explanation and leave Solution empty — better than inventing a
 * boundary that would hide content.
 */
export function splitProblemTabs(afterSandbox: string): {
  explanation: string;
  solution: string;
} {
  const match = /^## Solution\b[^\n]*/m.exec(afterSandbox);
  if (!match || match.index === undefined) {
    return { explanation: afterSandbox.trim(), solution: "" };
  }
  return {
    explanation: afterSandbox.slice(0, match.index).trim(),
    solution: afterSandbox.slice(match.index).trim(),
  };
}
