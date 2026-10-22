function removeDuplicates(nums: number[]): number {
  let write = 1; // nums[0] is always kept: nothing precedes it
  for (let read = 1; read < nums.length; read++) {
    if (nums[read] !== nums[write - 1]) { // differs from the last kept value?
      nums[write] = nums[read];           // then it is new: keep it
      write++;
    }
  }
  return write; // nums[0..write) holds the distinct values
}
