/** Prop coercion for fence JSON — vizzes must render something sane for any input. */

const MAX_ITEMS = 8;

export function numberArrayProp(value: unknown, fallback: number[]): number[] {
  if (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((x) => typeof x === "number" && Number.isFinite(x))
  ) {
    return value.slice(0, MAX_ITEMS);
  }
  return fallback;
}

export function speedProp(value: unknown, fallback = 900): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 100) {
    return value;
  }
  return fallback;
}

// High enough that "A man, a plan, a canal: Panama" (30 raw chars, the
// canonical palindrome example) survives intact — this caps layout size,
// not example length, so err generous rather than silently truncating an
// embed into a different (possibly wrong) answer.
const MAX_CHARS = 48;

export function stringProp(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.length > 0) {
    return value.slice(0, MAX_CHARS);
  }
  return fallback;
}
