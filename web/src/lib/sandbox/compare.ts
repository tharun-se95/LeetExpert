/**
 * Canonical JSON rendering, used both to compare a case's actual value to
 * its expected value and to display either one.
 *
 * Object keys are sorted so two structurally equal results never differ on
 * insertion order alone. Comparison is string equality over this rendering,
 * which keeps the JS and Python paths honest against each other: both send
 * back plain JSON-able values, and both are canonicalised the same way.
 */
export function canonical(value: unknown): string {
  return JSON.stringify(normalize(value));
}

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(source).sort()) {
      out[key] = normalize(source[key]);
    }
    return out;
  }
  // -0 and 0 are the same answer to every problem in this course
  if (typeof value === "number" && Object.is(value, -0)) return 0;
  return value;
}

/**
 * How a case decides two answers are the same.
 *
 * - `exact`      — deep equality (the default)
 * - `sorted`     — order within the top-level result carries no meaning
 * - `set-of-sets`— order carries no meaning at either level
 *
 * These exist because some problems genuinely admit several correct
 * orderings. 3Sum's triplets and Group Anagrams' groups can come out in any
 * order and still be right; comparing them exactly marks correct solutions
 * wrong, which is worse for a learner than having no test at all.
 */
export type CompareMode = "exact" | "sorted" | "set-of-sets";

/**
 * Normalises BOTH sides before equality. Applied symmetrically — never to
 * only the actual or only the expected — or the comparison stops meaning
 * anything.
 */
function normalizeFor(value: unknown, mode: CompareMode): unknown {
  if (mode === "exact" || !Array.isArray(value)) return value;

  if (mode === "sorted") {
    // Sort by canonical rendering so elements of any shape order stably.
    return [...value].sort((a, b) => canonical(a).localeCompare(canonical(b)));
  }

  // set-of-sets: sort inside each group, then sort the groups
  const inner = value.map((row) =>
    Array.isArray(row)
      ? [...row].sort((a, b) => canonical(a).localeCompare(canonical(b)))
      : row,
  );
  return inner.sort((a, b) => canonical(a).localeCompare(canonical(b)));
}

export function matches(
  actual: unknown,
  expected: unknown,
  mode: CompareMode = "exact",
): boolean {
  return (
    canonical(normalizeFor(actual, mode)) ===
    canonical(normalizeFor(expected, mode))
  );
}

/**
 * Display-only rendering: canonical form with breathing room after commas.
 * Never use this for comparison — `canonical` is the single source of truth
 * for whether two values are equal.
 */
export function pretty(value: unknown, max = 80): string {
  const text = canonical(value);
  if (text === undefined) return "undefined";
  const spaced = text.replace(/,/g, ", ");
  return spaced.length > max ? `${spaced.slice(0, max - 1)}…` : spaced;
}

/**
 * Renders a case as the call that will actually be made — `moveZeroes([0, 1,
 * 0, 3, 12])` rather than a bare `[[0,1,0,3,12]]`. The doubled brackets in
 * the latter are the args array wrapping the first argument, which reads as
 * a typo rather than as information.
 */
export function formatCall(fnName: string, args: unknown[], max = 72): string {
  const rendered = args.map((a) => pretty(a, Number.MAX_SAFE_INTEGER)).join(", ");
  const call = `${fnName}(${rendered})`;
  return call.length > max ? `${call.slice(0, max - 1)}…)` : call;
}
