/**
 * Generated case inputs: a sandbox case may write a value as a generator
 * instead of spelling it out, so a stated length ceiling can be tested
 * without a 5000-element literal in the lesson.
 *
 * Declarative on purpose — markdown must never carry code. Two forms, usable
 * at any depth of a case's `args` or `expect`:
 *   { "$range": [from, to] }      inclusive integers, descending when from > to
 *   { "$repeat": [value, count] } `value` (itself expandable) `count` times
 *
 * Hook-free, so the page and the CI harness expand through this one function
 * and cannot disagree about what a case is.
 */

/** Past this a case would stall the learner's tab, not test their code. */
export const MAX_GENERATED_LENGTH = 100_000;

const KEYS = ["$range", "$repeat"] as const;
type GeneratorKey = (typeof KEYS)[number];

export class GeneratorError extends Error {}

function generatorKey(value: unknown): GeneratorKey | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const keys = Object.keys(value);
  const dollar = keys.filter((k) => k.startsWith("$"));
  if (dollar.length === 0) return null;
  // A typo such as `$rnage`, or a generator mixed with data keys, must fail
  // loudly instead of reaching a runner as a plain object.
  if (keys.length !== 1 || !(KEYS as readonly string[]).includes(dollar[0])) {
    throw new GeneratorError(`unknown or mixed generator keys: ${keys.join(", ")}`);
  }
  return dollar[0] as GeneratorKey;
}

function rangeBounds(raw: unknown): { from: number; to: number; count: number } {
  if (
    !Array.isArray(raw) ||
    raw.length !== 2 ||
    !Number.isSafeInteger(raw[0]) ||
    !Number.isSafeInteger(raw[1])
  ) {
    throw new GeneratorError("$range takes two integers");
  }
  const [from, to] = raw as [number, number];
  const count = Math.abs(to - from) + 1;
  if (count > MAX_GENERATED_LENGTH) {
    throw new GeneratorError(`$range of ${count} exceeds ${MAX_GENERATED_LENGTH}`);
  }
  return { from, to, count };
}

function repeatParts(raw: unknown): { item: unknown; n: number } {
  if (!Array.isArray(raw) || raw.length !== 2) {
    throw new GeneratorError("$repeat takes [value, count]");
  }
  const n = raw[1];
  if (!Number.isSafeInteger(n) || n < 0 || n > MAX_GENERATED_LENGTH) {
    throw new GeneratorError(`$repeat count must be an integer in 0..${MAX_GENERATED_LENGTH}`);
  }
  return { item: raw[0], n };
}

/** Replaces every generator in `value` with the data it stands for. */
export function expandGenerators(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(expandGenerators);
  if (typeof value !== "object" || value === null) return value;

  const key = generatorKey(value);
  if (key === "$range") {
    const { from, to, count } = rangeBounds((value as Record<string, unknown>)[key]);
    const step = to >= from ? 1 : -1;
    return Array.from({ length: count }, (_, i) => from + i * step);
  }
  if (key === "$repeat") {
    const { item, n } = repeatParts((value as Record<string, unknown>)[key]);
    const one = expandGenerators(item);
    // Each copy is its own value: a solution that mutates one element in
    // place must not change its neighbours.
    return Array.from({ length: n }, () => structuredClone(one));
  }

  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, expandGenerators(v)]),
  );
}

export function hasGenerator(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasGenerator);
  if (typeof value !== "object" || value === null) return false;
  if (generatorKey(value) !== null) return true;
  return Object.values(value).some(hasGenerator);
}

/**
 * One-line description of a value with generators left unexpanded
 * (`[1..5000]`, `[0 × 300]`), for the case list and failure output — the
 * learner should read what the input IS, not scroll five thousand numbers.
 */
export function describeGenerated(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(describeGenerated).join(", ")}]`;
  if (typeof value !== "object" || value === null) return JSON.stringify(value);
  const key = generatorKey(value);
  if (key === "$range") {
    const { from, to } = rangeBounds((value as Record<string, unknown>)[key]);
    return `[${from}..${to}]`;
  }
  if (key === "$repeat") {
    const { item, n } = repeatParts((value as Record<string, unknown>)[key]);
    return `[${describeGenerated(item)} × ${n}]`;
  }
  const fields = Object.entries(value).map(
    ([k, v]) => `${k}: ${describeGenerated(v)}`,
  );
  return `{ ${fields.join(", ")} }`;
}
