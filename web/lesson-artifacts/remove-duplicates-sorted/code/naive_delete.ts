function removeDuplicates(nums: number[]): number {
  let i = 1;
  while (i < nums.length) {
    if (nums[i] === nums[i - 1]) nums.splice(i, 1); // shifts every later element one slot left
    else i++;
  }
  return nums.length;
}
