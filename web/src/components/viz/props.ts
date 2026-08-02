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

const MAX_CHARS = 24;

export function stringProp(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.length > 0) {
    return value.slice(0, MAX_CHARS);
  }
  return fallback;
}
