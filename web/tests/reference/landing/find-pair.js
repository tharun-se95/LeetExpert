function findPair(nums, target) {
  const seen = new Set();
  for (const n of nums) {
    if (seen.has(target - n)) return [target - n, n];
    seen.add(n);
  }
  return null;
}
