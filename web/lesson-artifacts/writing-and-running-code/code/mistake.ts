function maxSubarrayDraft(nums: number[]): number {
  let best = 0;
  let cur = 0; // an empty run scores 0, so 0 can win
  for (const x of nums) {
    cur = Math.max(x, cur + x);
    best = Math.max(best, cur);
  }
  return best;
}
