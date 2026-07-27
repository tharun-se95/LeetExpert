function productExceptSelf(nums) {
  const n = nums.length, out = new Array(n).fill(1);
  let pre = 1;
  for (let i = 0; i < n; i++) { out[i] = pre; pre *= nums[i]; }
  let suf = 1;
  for (let i = n - 1; i >= 0; i--) { out[i] *= suf; suf *= nums[i]; }
  return out;
}
