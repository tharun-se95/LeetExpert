function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const answer = new Array<number>(n).fill(1);
  for (let i = 1; i < n; i++) answer[i] = answer[i - 1] * nums[i - 1];

  let right = 1;
  for (let i = n - 1; i >= 0; i--) {
    right *= nums[i];                     // too early: right now includes nums[i] itself
    answer[i] *= right;
  }
  return answer;
}
