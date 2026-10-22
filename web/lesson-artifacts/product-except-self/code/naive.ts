function productExceptSelf(nums: number[]): number[] {
  const answer: number[] = [];
  for (let i = 0; i < nums.length; i++) {
    let product = 1;
    for (let j = 0; j < nums.length; j++) { // multiply every other element
      if (j !== i) product *= nums[j];
    }
    answer.push(product);
  }
  return answer;
}
