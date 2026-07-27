function maxSubArray(nums) {
  let bestEndingHere = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    bestEndingHere = Math.max(nums[i], bestEndingHere + nums[i]);
    best = Math.max(best, bestEndingHere);
  }
  return best;
}
