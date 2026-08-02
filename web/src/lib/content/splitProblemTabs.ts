/**
 * Splits a problem lesson's post-sandbox markdown into the Explanation,
 * Solution, and Quiz tabs used by the `/problems/[slug]` IDE layout.
 *
 * Convention: almost every problem has a top-level `## Solution` heading.
 * Content before that is approach/hints; from that heading onward is the
 * revealable solution. The four lessons without the heading put everything
 * under Explanation and leave Solution empty — better than inventing a
 * boundary that would hide content.
 *
 * The `quiz` fence is pulled out first, regardless of which side of
 * `## Solution` it sits on, so it gets its own tab instead of being
 * buried at the end of whichever section it was authored under.
 */

const QUIZ_FENCE = /```quiz\n[\s\S]*?\n```\s*/g;

function extractQuiz(source: string): { rest: string; quiz: string } {
  const found: string[] = [];
  const rest = source.replace(QUIZ_FENCE, (block) => {
    found.push(block.trim());
    return "";
  });
  return { rest: rest.trim(), quiz: found.join("\n\n") };
}

export function splitProblemTabs(afterSandbox: string): {
  explanation: string;
  solution: string;
  quiz: string;
} {
  const { rest, quiz } = extractQuiz(afterSandbox);

  const match = /^## Solution\b[^\n]*/m.exec(rest);
  if (!match || match.index === undefined) {
    return { explanation: rest.trim(), solution: "", quiz };
  }
  return {
    explanation: rest.slice(0, match.index).trim(),
    solution: rest.slice(match.index).trim(),
    quiz,
  };
}
