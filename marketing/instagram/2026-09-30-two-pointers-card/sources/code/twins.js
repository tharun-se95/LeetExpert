// JavaScript twins of the four Python snippets the reel shows.
function twoSum(numbers, target) {
  let l = 0, r = numbers.length - 1;
  while (l < r) {
    const s = numbers[l] + numbers[r];
    if (s === target) return [l + 1, r + 1];
    if (s < target) l++; else r--;
  }
}
function removeDuplicates(nums) {
  let slow = 0;
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) nums[++slow] = nums[fast];
  }
  return slow + 1;
}
function maxArea(h) {
  let l = 0, r = h.length - 1, best = 0;
  while (l < r) {
    best = Math.max(best, (r - l) * Math.min(h[l], h[r]));
    if (h[l] < h[r]) l++; else r--;
  }
  return best;
}
function merge(a, b) {
  let i = 0, j = 0;
  const out = [];
  while (i < a.length && j < b.length) out.push(a[i] <= b[j] ? a[i++] : b[j++]);
  return out.concat(a.slice(i), b.slice(j));
}
module.exports = { twoSum, removeDuplicates, maxArea, merge };
