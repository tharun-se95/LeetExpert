/**
 * Returns the closed-form triangular sum 1 + 2 + ... + n = n * (n + 1) / 2.
 */
export function triangle(n: number): number {
  return Math.floor((n * (n + 1)) / 2);
}
