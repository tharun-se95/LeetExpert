function hasPair(nums: number[], target: number): boolean {
  const seen = new Set<number>();
  for (const x of nums) {
    if (seen.has(target - x)) {
      return true;
    }
    seen.add(x);
  }
  return false;
}
