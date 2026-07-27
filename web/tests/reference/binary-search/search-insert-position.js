function searchInsert(nums, target) {
  let lo = 0, hi = nums.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (nums[mid] < target) lo = mid + 1; else hi = mid; }
  return lo;
}
