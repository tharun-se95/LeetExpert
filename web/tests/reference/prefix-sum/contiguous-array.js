function findMaxLength(nums) {
  const firstSeen = new Map([[0, -1]]);
  let running = 0;
  let best = 0;
  for (let i = 0; i < nums.length; i++) {
    running += nums[i] === 1 ? 1 : -1;
    if (firstSeen.has(running)) best = Math.max(best, i - firstSeen.get(running));
    else firstSeen.set(running, i);
  }
  return best;
}
