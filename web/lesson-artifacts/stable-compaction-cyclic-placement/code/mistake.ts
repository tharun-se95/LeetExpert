function keepIf(nums: number[], keep: (x: number) => boolean): number {
  for (const x of nums) {                          // the iterator walks by position...
    if (!keep(x)) nums.splice(nums.indexOf(x), 1); // ...and splice slides every later car one slot left
  }
  return nums.length;
}
