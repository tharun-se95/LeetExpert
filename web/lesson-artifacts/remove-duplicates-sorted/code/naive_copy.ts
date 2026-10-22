function removeDuplicates(nums: number[]): number {
  const uniq: number[] = []; // a second array: up to n extra slots
  for (const x of nums) {
    if (uniq.length === 0 || x !== uniq[uniq.length - 1]) uniq.push(x);
  }
  for (let i = 0; i < uniq.length; i++) nums[i] = uniq[i]; // copy the answer back
  return uniq.length;
}
