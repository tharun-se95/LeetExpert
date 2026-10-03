function moveZeroesShuffle(nums) {
  const n = nums.length;
  let i = 0, end = n;
  while (i < end) {
    if (nums[i] === 0) {
      for (let j = i; j < n - 1; j++) nums[j] = nums[j + 1];
      nums[n - 1] = 0;
      end--;
    } else {
      i++;
    }
  }
}

module.exports = { moveZeroesShuffle };
