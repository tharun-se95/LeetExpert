function fibBrokenMemo(n: number): [number, number] {
  let calls = 0;
  function helper(k: number): number {
    calls++;
    const memo: Record<number, number> = {}; // bug: recreating memo inside helper prevents cross-call caching
    if (k in memo) return memo[k];
    let res: number;
    if (k <= 1) {
      res = k;
    } else {
      res = helper(k - 1) + helper(k - 2);
    }
    memo[k] = res;
    return res;
  }
  return [helper(n), calls];
}
