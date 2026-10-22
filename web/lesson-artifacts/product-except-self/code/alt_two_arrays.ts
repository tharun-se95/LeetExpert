function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const left = new Array<number>(n).fill(1);  // left[i]: the product of everything before i
  for (let i = 1; i < n; i++) left[i] = left[i - 1] * nums[i - 1];
  const right = new Array<number>(n).fill(1); // right[i]: the product of everything after i
  for (let i = n - 2; i >= 0; i--) right[i] = right[i + 1] * nums[i + 1];
  return nums.map((_, i) => left[i] * right[i]);
}
