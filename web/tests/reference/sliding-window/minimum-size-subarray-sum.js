function minSubArrayLen(target, nums) {
  let left = 0;
  let windowSum = 0;
  let best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    windowSum += nums[right];
    while (windowSum >= target) {
      best = Math.min(best, right - left + 1);
      windowSum -= nums[left];
      left++;
    }
  }
  return best === Infinity ? 0 : best;
}
