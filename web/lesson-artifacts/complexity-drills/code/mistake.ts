export function drill4Mistake(nums: number[], target: number): boolean {
  for (const x of nums) {
    // Slicing creates a new array O(n) and membership scans it O(n), hiding O(n²) work
    if (nums.slice(1).includes(x)) {
      /* slice + scan */
    }
    if (x === target) return true;
  }
  return false;
}
