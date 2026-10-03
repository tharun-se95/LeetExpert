function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2) return false;
  const target = total / 2;
  const dp = [true, ...Array(target).fill(false)];
  for (const num of nums) {
    for (let cap = num; cap <= target; cap++) {
      if (dp[cap - num]) dp[cap] = true;
    }
  }
  return dp[target];
}
