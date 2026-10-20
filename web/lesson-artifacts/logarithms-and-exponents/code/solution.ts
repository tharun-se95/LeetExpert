/**
 * Returns the number of times n can be halved before reaching 1 (floor log2 n).
 */
export function halvings(n: number): number {
  let count = 0;
  while (n > 1) {
    n = Math.floor(n / 2);
    count++;
  }
  return count;
}
