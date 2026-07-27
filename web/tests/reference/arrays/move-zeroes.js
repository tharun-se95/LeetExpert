function moveZeroes(nums) {
  let w = 0;
  for (let r = 0; r < nums.length; r++) if (nums[r] !== 0) nums[w++] = nums[r];
  while (w < nums.length) nums[w++] = 0;
}
