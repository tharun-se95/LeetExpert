/**
 * Returns floored modulo in [0, m) for m > 0.
 *
 * JavaScript's % operator truncates toward zero (matching the dividend's sign).
 * Adding m shifts negative remainders into [0, m), and the outer % m handles non-negative inputs.
 */
export function wrap(a: number, m: number): number {
  return ((a % m) + m) % m;
}
