/**
 * Mistake: using float division without integer truncation.
 */
export function halvingsFloatDiv(n: number): number {
  let count = 0;
  while (n > 1) {
    n = n / 2; // float division: 3 / 2 = 1.5 > 1 lingers
    count++;
  }
  return count;
}
