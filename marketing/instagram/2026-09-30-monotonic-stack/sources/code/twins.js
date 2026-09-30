// JavaScript twins: the lesson's nextGreater, and the value-stack bug.
function nextGreater(nums) {
  const answer = new Array(nums.length).fill(-1);
  const stack = [];
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[stack[stack.length - 1]] < nums[i]) answer[stack.pop()] = nums[i];
    stack.push(i);
  }
  return answer;
}
function nextGreaterValues(nums) {
  const answer = new Array(nums.length).fill(-1);
  const stack = [];
  for (const x of nums) {
    while (stack.length && stack[stack.length - 1] < x) answer[nums.indexOf(stack.pop())] = x;
    stack.push(x);
  }
  return answer;
}
module.exports = { nextGreater, nextGreaterValues };
