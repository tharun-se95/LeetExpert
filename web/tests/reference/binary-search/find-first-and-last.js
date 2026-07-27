function searchRange(nums, target) {
  const bound = (first) => {
    let lo = 0, hi = nums.length - 1, ans = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (nums[mid] === target) { ans = mid; if (first) hi = mid - 1; else lo = mid + 1; }
      else if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
    }
    return ans;
  };
  return [bound(true), bound(false)];
}
