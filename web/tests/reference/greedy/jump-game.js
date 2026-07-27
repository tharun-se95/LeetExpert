function canJump(nums) {
  let maxReach = 0;
  const last = nums.length - 1;
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false;
    maxReach = Math.max(maxReach, i + nums[i]);
    if (maxReach >= last) return true;
  }
  return true;
}
