function containsDuplicateNeighbours(nums: number[]): boolean {
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === nums[i - 1]) return true; // only the number right before it
  }
  return false;
}
