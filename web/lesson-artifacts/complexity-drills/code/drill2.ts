export function countCancellingPairs(nums: number[]): number {
  let pairs = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === 0) pairs++;
    }
  }
  return pairs;
}
