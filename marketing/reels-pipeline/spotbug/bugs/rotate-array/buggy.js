function rotate(nums, k) {
  const out = nums.slice(-k).concat(nums.slice(0, -k));
  out.forEach((x, i) => { nums[i] = x; });
}
