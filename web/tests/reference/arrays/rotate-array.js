function rotate(nums, k) {
  const n = nums.length; k = ((k % n) + n) % n;
  const rev = (i, j) => { while (i < j) { [nums[i], nums[j]] = [nums[j], nums[i]]; i++; j--; } };
  rev(0, n - 1); rev(0, k - 1); rev(k, n - 1);
}
