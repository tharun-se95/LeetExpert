function maxSubarrayDebug(nums: number[]): number {
  let best = 0;
  let cur = 0;
  for (const x of nums) {
    cur = Math.max(x, cur + x);
    best = Math.max(best, cur);
  }
  console.log("best", best); // lands in the Console tab, under the case that printed it
  return best;
}
