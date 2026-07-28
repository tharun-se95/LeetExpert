function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2 !== 0) return false;
  const target = total / 2;
  const reachable = new Array(target + 1).fill(false);
  reachable[0] = true;
  for (const x of nums) {
    for (let t = target; t >= x; t--) {
      if (reachable[t - x]) reachable[t] = true;
    }
  }
  return reachable[target];
}
