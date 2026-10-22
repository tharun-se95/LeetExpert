function reverseRange(nums: number[], left: number, right: number): void {
  for (let i = 0; i <= right - left; i++) { // every position, not every pair
    [nums[left + i], nums[right - i]] = [nums[right - i], nums[left + i]];
  }
}
