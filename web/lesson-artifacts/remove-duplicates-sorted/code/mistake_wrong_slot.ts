function removeDuplicates(nums: number[]): number {
  let write = 1; // the next slot to fill
  for (let read = 1; read < nums.length; read++) {
    if (nums[read] !== nums[write]) { // the slot to fill, not the last kept value
      nums[write] = nums[read];
      write++;
    }
  }
  return write;
}
