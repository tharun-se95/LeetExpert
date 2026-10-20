/**
 * Mistake: using floating-point division n = n / 2 instead of integer truncation Math.floor(n / 2).
 *
 * Because JavaScript numbers are IEEE 754 floats by default, n / 2 leaves fractional values:
 * halving 3 once yields 1.5 > 1, running an extra iteration and returning 2 instead of 1.
 */
export function halvings(n: number): number {
  let count = 0;
  while (n > 1) {
    n = n / 2;
    count++;
  }
  return count;
}
