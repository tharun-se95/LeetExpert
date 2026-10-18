function hasPairMistake(nums: number[], target: number): boolean {
  const seen = new Set<number>();
  for (const x of nums) {
    // Adding to seen before checking for complement
    seen.add(x);
    if (seen.has(target - x)) {
      return true;
    }
  }
  return false;
}
