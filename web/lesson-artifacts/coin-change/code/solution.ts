function coinChange(coins: number[], amount: number): number {
  const INF = amount + 1; // larger than any real answer
  const dp: number[] = [0, ...new Array<number>(amount).fill(INF)]; // dp[a] = fewest coins that make exactly a
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a) {
        // the last coin cannot exceed the amount
        dp[a] = Math.min(dp[a], dp[a - c] + 1);
      }
    }
  }
  return dp[amount] !== INF ? dp[amount] : -1;
}
