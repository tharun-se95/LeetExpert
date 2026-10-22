function moveZeroes(nums: number[]): void {
  // Trap: compacts non-zeroes but omits the fill pass, leaving stale values in the tail
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      nums[write] = nums[read];
      write++;
    }
  }
}
