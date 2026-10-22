function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const answer = new Array<number>(n).fill(1); // answer[0] has nothing on its left: the empty product is 1

  for (let i = 1; i < n; i++) {                // forward: answer[i] = everything to the left of i
    answer[i] = answer[i - 1] * nums[i - 1];
  }

  let right = 1;                               // backward: the product of everything to the right of i
  for (let i = n - 1; i >= 0; i--) {
    answer[i] *= right;                        // fold the right side into the left side already stored
    right *= nums[i];                          // only now does nums[i] join the right side
  }
  return answer;
}
