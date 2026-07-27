function findKthLargest(nums, k) {
  const targetIndex = nums.length - k;

  const partition = (lo, hi) => {
    const pivot = nums[hi];
    let boundary = lo;
    for (let i = lo; i < hi; i++) {
      if (nums[i] < pivot) {
        [nums[boundary], nums[i]] = [nums[i], nums[boundary]];
        boundary++;
      }
    }
    [nums[boundary], nums[hi]] = [nums[hi], nums[boundary]];
    return boundary;
  };

  let lo = 0;
  let hi = nums.length - 1;
  for (;;) {
    const p = partition(lo, hi);
    if (p === targetIndex) return nums[p];
    if (p < targetIndex) lo = p + 1;
    else hi = p - 1;
  }
}
