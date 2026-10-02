// JavaScript twins of the two Python files the reel shows (the fix and the `if` bug).
function minSubArrayLen(target, nums) {
  let left = 0, total = 0, best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    total += nums[right];
    while (total >= target) {
      best = Math.min(best, right - left + 1);
      total -= nums[left];
      left++;
    }
  }
  return best === Infinity ? 0 : best;
}
function minSubArrayLenIfBug(target, nums) {
  let left = 0, total = 0, best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    total += nums[right];
    if (total >= target) {
      best = Math.min(best, right - left + 1);
      total -= nums[left];
      left++;
    }
  }
  return best === Infinity ? 0 : best;
}
module.exports = { minSubArrayLen, minSubArrayLenIfBug };
