export function weighInRounds(nums: number[]): number {
  let total = 0;
  for (let size = nums.length; size > 1; size = Math.floor(size / 2)) {
    for (const x of nums) total += x;
  }
  return total;
}
