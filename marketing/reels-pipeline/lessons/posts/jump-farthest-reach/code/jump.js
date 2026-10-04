function canJumpBrute(nums, i = 0) {
  if (i >= nums.length - 1) return true;
  const reach = nums[i];
  for (let step = 1; step <= reach; step++) {
    if (canJumpBrute(nums, i + step)) return true;
  }
  return false;
}

function canJump(nums) {
  let maxReach = 0;
  const last = nums.length - 1;
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) {
      return false;
    }
    maxReach = Math.max(maxReach, i + nums[i]);
    if (maxReach >= last) {
      return true;
    }
  }
  return true;
}

module.exports = { canJumpBrute, canJump };
