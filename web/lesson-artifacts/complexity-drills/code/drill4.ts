export function hasDuplicate(nums: number[]): boolean {
  for (let i = 0; i < nums.length; i++) {
    if (nums.slice(i + 1).includes(nums[i])) return true;
  }
  return false;
}
