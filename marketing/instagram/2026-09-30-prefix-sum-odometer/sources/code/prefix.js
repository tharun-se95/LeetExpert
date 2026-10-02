// JavaScript twin of prefix.py (the lesson's buildPrefix, plus rangeSum).
function buildPrefix(nums) {
  const prefix = new Array(nums.length + 1).fill(0);
  for (let i = 0; i < nums.length; i++) prefix[i + 1] = prefix[i] + nums[i];
  return prefix;
}
function rangeSum(prefix, l, r) {
  return prefix[r + 1] - prefix[l];
}
module.exports = { buildPrefix, rangeSum };
