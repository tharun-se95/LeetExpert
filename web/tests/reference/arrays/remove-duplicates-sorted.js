function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  let w = 1;
  for (let r = 1; r < nums.length; r++) if (nums[r] !== nums[w - 1]) nums[w++] = nums[r];
  return w;
}
