function longestConsecutive(nums) {
  const seen = new Set(nums);
  let best = 0;
  for (const v of seen) {
    if (seen.has(v - 1)) continue;
    let len = 1;
    while (seen.has(v + len)) len++;
    best = Math.max(best, len);
  }
  return best;
}
