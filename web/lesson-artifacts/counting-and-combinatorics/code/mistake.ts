function nChooseK(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  // BUG: n! is a double: not exact from n = 23, Infinity at n = 171
  function fact(m: number): number {
    let f = 1;
    for (let i = 1; i <= m; i++) f *= i;
    return f;
  }
  return Math.round(fact(n) / (fact(k) * fact(n - k)));
}
