// JavaScript twins of the three Python files the reel shows.
function removeEvensBug(nums) {
  for (const n of nums) {
    if (n % 2 === 0) nums.splice(nums.indexOf(n), 1);
  }
  return nums;
}
function removeEvensNewList(nums) {
  return nums.filter((n) => n % 2 !== 0);
}
function removeEvensInPlace(nums) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] % 2 !== 0) {
      nums[write] = nums[read];
      write++;
    }
  }
  nums.length = write;
  return nums;
}
module.exports = { removeEvensBug, removeEvensNewList, removeEvensInPlace };
