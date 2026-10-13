function maxSubarray(nums: number[]): number {
  let best = nums[0];
  let cur = nums[0]; // start from a real element, never from 0
  for (const x of nums.slice(1)) {
    cur = Math.max(x, cur + x); // extend the run, or start a new one at x
    best = Math.max(best, cur);
  }
  return best;
}
