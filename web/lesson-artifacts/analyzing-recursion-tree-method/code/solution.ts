function fibNaive(n: number): [number, number] {
  let calls = 0;
  function helper(k: number): number {
    calls++;
    if (k <= 1) return k;
    return helper(k - 1) + helper(k - 2);
  }
  return [helper(n), calls];
}

function fibMemo(n: number): [number, number] {
  const memo: Record<number, number> = {};
  let calls = 0;
  function helper(k: number): number {
    calls++;
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
