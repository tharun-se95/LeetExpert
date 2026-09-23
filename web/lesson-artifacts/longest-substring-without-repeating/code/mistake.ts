function lengthOfLongestSubstring(s: string): number {
  const window = new Set<string>();
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    best = Math.max(best, right - left + 1); // the mistake: counted BEFORE the duplicate is removed
    while (window.has(s[right])) {
      window.delete(s[left]);
      left++;
    }
    window.add(s[right]);
  }
  return best;
}
