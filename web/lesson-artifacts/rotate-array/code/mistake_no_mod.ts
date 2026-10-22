function reverseRange(nums: number[], left: number, right: number): void {
  while (left < right) {
    [nums[left], nums[right]] = [nums[right], nums[left]];
    left++;
    right--;
  }
}

function rotate(nums: number[], k: number): void {
  const n = nums.length;
  if (k === 0) return; // no k %= n: k may be bigger than n
  reverseRange(nums, 0, n - 1);
  reverseRange(nums, 0, k - 1); // right = k - 1 can be past the last slot
  reverseRange(nums, k, n - 1);
}
