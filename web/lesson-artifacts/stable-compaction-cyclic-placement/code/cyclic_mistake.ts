function rotateCyclic(nums: number[], k: number): void {
  const n = nums.length;
  if (n === 0) return;
  k %= n;
  let cur = 0, carry = nums[0];
  while (true) {                      // follow ONE chain from slot 0...
    const nxt = (cur + k) % n;
    [nums[nxt], carry] = [carry, nums[nxt]];
    cur = nxt;
    if (cur === 0) break;             // ...and stop when it closes
  }
}
