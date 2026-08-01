/**
 * Pull the first ```complexity fence body from lesson markdown.
 * Complexity blocks often live inside a reveal/solution string, so a
 * root-level mdast walk would miss them — fence text matching is intentional.
 */
export interface ExtractedComplexity {
  time?: string;
  space?: string;
  why?: string;
}

const COMPLEXITY_FENCE =
  /```complexity\s*\n([\s\S]*?)```/m;

export function extractComplexityFromMarkdown(
  markdown: string,
): ExtractedComplexity | null {
  const match = COMPLEXITY_FENCE.exec(markdown);
  if (!match) return null;
  try {
    const parsed: unknown = JSON.parse(match[1]);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const obj = parsed as Record<string, unknown>;
    const time = typeof obj.time === "string" ? obj.time : undefined;
    const space = typeof obj.space === "string" ? obj.space : undefined;
    const why = typeof obj.why === "string" ? obj.why : undefined;
    if (!time && !space) return null;
    return { time, space, why };
  } catch {
    return null;
  }
}
