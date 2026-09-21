function lengthOfLongestSubstring(s: string): number {
  const window = new Set<string>(); // the characters currently inside the window
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    while (window.has(s[right])) {
      // shrink UNTIL the newcomer is not a duplicate
      window.delete(s[left]);
      left++;
    }
    window.add(s[right]); // expand: the window is valid again
    best = Math.max(best, right - left + 1); // record AFTER restoring validity
  }
  return best;
}
