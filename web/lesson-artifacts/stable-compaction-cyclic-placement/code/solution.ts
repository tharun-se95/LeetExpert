function keepIf(nums: number[], keep: (x: number) => boolean): number {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (keep(nums[read])) {
      nums[write] = nums[read];
      write++;
    }
  }
  return write; // keepers occupy nums[0..write)
}
