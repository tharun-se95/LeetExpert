export interface ExampleRow {
  input: string;
  output: string;
  note?: string;
}

/**
 * Parse example fence bodies like:
 *   "race a car" → false  ("raceacar")
 *   nums = [1,1,2] → k = 2, nums = [1,2,_]
 * Lines without an arrow are ignored.
 */
export function parseExampleRows(source: string): ExampleRow[] | null {
  const rows: ExampleRow[] = [];
  for (const raw of source.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const arrow = line.includes("→")
      ? "→"
      : line.includes("->")
        ? "->"
        : null;
    if (!arrow) continue;
    const idx = line.indexOf(arrow);
    const input = line.slice(0, idx).trim();
    let rest = line.slice(idx + arrow.length).trim();
    if (!input || !rest) continue;

    let note: string | undefined;
    const noteMatch = /\(([^)]+)\)\s*$/.exec(rest);
    if (noteMatch && noteMatch.index > 0) {
      note = noteMatch[1].trim();
      // Unwrap only when the whole note is one quoted string — do not
      // strip a leading quote from notes like `"sad" begins at index 0`.
      if (
        (note.startsWith('"') && note.endsWith('"')) ||
        (note.startsWith("'") && note.endsWith("'"))
      ) {
        note = note.slice(1, -1);
      }
      rest = rest.slice(0, noteMatch.index).trim();
    }
    rows.push({ input, output: rest, note });
  }
  return rows.length > 0 ? rows : null;
}

/** Heuristic: a plain `text` fence is examples if most non-empty lines have arrows. */
export function looksLikeExamples(source: string): boolean {
  const lines = source
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return false;
  const withArrow = lines.filter((l) => l.includes("→") || l.includes("->"));
  return withArrow.length >= Math.ceil(lines.length * 0.6);
}
