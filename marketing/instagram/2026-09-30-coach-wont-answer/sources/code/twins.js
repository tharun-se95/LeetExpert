// JavaScript twins of the drafts the reel shows.
function twoSumDraft(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    seen.set(nums[i], i);
    if (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i];
  }
}
function twoSumFixed(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    if (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i];
    seen.set(nums[i], i);
  }
}
module.exports = { twoSumDraft, twoSumFixed };
