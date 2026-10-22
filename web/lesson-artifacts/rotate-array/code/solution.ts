function reverseRange(nums: number[], left: number, right: number): void {
  while (left < right) {
    [nums[left], nums[right]] = [nums[right], nums[left]];
    left++;
    right--;
  }
}

function rotate(nums: number[], k: number): void {
  const n = nums.length;
  k %= n; // rotating by n puts everything back
  if (k === 0) return;
  reverseRange(nums, 0, n - 1); // whole row: the last k come first, backwards
  reverseRange(nums, 0, k - 1); // turn the first block the right way round
  reverseRange(nums, k, n - 1); // and the second
}
