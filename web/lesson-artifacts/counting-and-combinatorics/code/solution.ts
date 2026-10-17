// Returns a bigint: with plain numbers the running product result * (n - k + i) leaves the exact
// range (above 2^53) while C(n, k) itself is still small, and the answer goes wrong.
function nChooseK(n: number, k: number): bigint {
  if (k < 0 || k > n) return 0n;
  k = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i <= k; i++) {
    result = (result * BigInt(n - k + i)) / BigInt(i);
  }
  return result;
}
