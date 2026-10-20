/**
 * Mistake: premature integer division Math.floor(n / 2) * (n + 1) truncates odd integers.
 *
 * For odd n, dividing by 2 first discards 0.5 before multiplication:
 * For n = 3, this computes Math.floor(3 / 2) * 4 = 1 * 4 = 4 instead of the true sum 6.
 */
export function triangle(n: number): number {
  return Math.floor(n / 2) * (n + 1);
}
