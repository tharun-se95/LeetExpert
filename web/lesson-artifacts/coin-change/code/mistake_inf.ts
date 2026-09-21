function coinChange(coins: number[], amount: number): number {
  const INF = amount + 1;
  const dp: number[] = [0, ...new Array<number>(amount).fill(INF)];
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
    }
  }
  return dp[amount]; // the mistake: unreachable amounts still hold INF
}
