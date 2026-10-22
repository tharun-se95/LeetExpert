function swap(nums: number[], i: number, j: number): void {
  [nums[i], nums[j]] = [nums[j], nums[i]]; // array pack, then destructure
}
