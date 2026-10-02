// JavaScript twins: the AI's version (same off-by-one), the +1 fix, and the slide.
function maxSumKBug(nums, k) {
  let best = -Infinity;
  for (let i = 0; i < nums.length - k; i++) {
    let s = 0;
    for (let j = i; j < i + k; j++) s += nums[j];
    best = Math.max(best, s);
  }
  return best;
}
function maxSumKSlide(nums, k) {
  let window = 0;
  for (let i = 0; i < k; i++) window += nums[i];
  let best = window;
  for (let right = k; right < nums.length; right++) {
    window += nums[right] - nums[right - k];
    best = Math.max(best, window);
  }
  return best;
}
module.exports = { maxSumKBug, maxSumKSlide };
