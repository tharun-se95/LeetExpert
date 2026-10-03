function subsets(nums) {
  const result = [], path = [];
  const backtrack = (start) => {
    result.push(path);
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1);
      path.pop();
    }
  };
  backtrack(0);
  return result;
}
