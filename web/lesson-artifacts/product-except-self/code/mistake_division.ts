function productExceptSelf(nums: number[]): number[] {
  let total = 1;
  for (const x of nums) total *= x;       // the whole product, once
  return nums.map((x) => total / x);      // then divide each element back out
}
