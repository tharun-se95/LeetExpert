function lengthOfLongestSubstring(s: string): number {
  let best = 0;
  for (let start = 0; start < s.length; start++) {
    // try every starting point...
    const seen = new Set<string>();
    for (let end = start; end < s.length; end++) {
      // ...and read forward from scratch
      if (seen.has(s[end])) break; // this start cannot reach any further
      seen.add(s[end]);
    }
    best = Math.max(best, seen.size);
  }
  return best;
}
