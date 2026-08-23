const FENCE = /^(`{3,8})quiz[^\n]*\n([\s\S]*?)^\1\s*$/gm;

/**
 * Pulls the lesson's trailing quiz fence out of the markdown body so it can
 * be rendered after the infographic instead of inline at the end of prose
 * (see ChapterInfographic / the lesson page). Only extracts when there's
 * exactly one quiz block — lessons with several interleaved checks (a
 * checks-as-you-go pattern used elsewhere in the course) are left alone
 * rather than collapsing multiple quizzes into one relocated block.
 */
export function extractQuizFence(markdown: string): {
  body: string;
  quizSource: string | null;
} {
  const matches = [...markdown.matchAll(FENCE)];
  if (matches.length !== 1) return { body: markdown, quizSource: null };
  const m = matches[0]!;
  const quizSource = m[2]!;
  const body = (
    markdown.slice(0, m.index) + markdown.slice(m.index + m[0].length)
  )
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd()
    .concat("\n");
  return { body, quizSource };
}
