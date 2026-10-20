/**
 * Mistake: bare % in JavaScript truncates toward zero, matching the dividend's sign.
 *
 * For negative numbers where a is not a multiple of m, this returns a negative result.
 * In array indexing (e.g. buffer[(i - 1) % m]), accessing a negative index yields undefined.
 */
export function wrap(a: number, m: number): number {
  return a % m;
}
