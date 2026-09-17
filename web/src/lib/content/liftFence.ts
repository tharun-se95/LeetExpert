/**
 * Removes `markdown[start, end)` — a fence the lesson page renders somewhere
 * else — and closes the gap it leaves with one blank line.
 *
 * Only the seam is tidied. Collapsing blank lines across the whole body also
 * rewrote code fences (PEP 8's two blank lines between classes), and the loader
 * had already keyed every fence's highlighting on its original text, so those
 * lookups missed: `tabs` blocks rendered as raw markdown.
 */
export function liftFence(markdown: string, start: number, end: number): string {
  const before = markdown.slice(0, start).trimEnd();
  const after = markdown.slice(end).replace(/^\s*\n/, "");
  const joined = before && after ? `${before}\n\n${after}` : before || after;
  return `${joined.trimEnd()}\n`;
}
