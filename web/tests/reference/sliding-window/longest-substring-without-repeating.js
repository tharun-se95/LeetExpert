function lengthOfLongestSubstring(s) {
  const window = new Set();
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    while (window.has(s[right])) {
      window.delete(s[left]);
      left++;
    }
    window.add(s[right]);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
