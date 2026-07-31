const STAGE_HEADING = /^### Stage \d+/;

/**
 * Split a `roadmap` fence body into per-stage markdown chunks.
 * Returns null when empty or when any chunk does not start with `### Stage N`.
 */
export function parseRoadmapStages(source: string): string[] | null {
  const trimmed = source.replace(/^\n+/, "").replace(/\n+$/, "");
  if (!trimmed.trim()) return null;

  const chunks = trimmed.split(/(?=^### Stage \d+)/m).filter((c) => c.trim());
  if (chunks.length === 0) return null;
  if (!chunks.every((c) => STAGE_HEADING.test(c.trimStart()))) return null;
  return chunks.map((c) => c.replace(/\n+$/, ""));
}
