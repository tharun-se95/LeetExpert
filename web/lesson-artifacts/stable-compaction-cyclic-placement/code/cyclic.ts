function rotateCyclic(nums: number[], k: number): void {
  const n = nums.length;
  if (n === 0) return;                // k % 0 would be NaN
  k %= n;                             // k may exceed n
  let moved = 0, start = 0;
  while (moved < n) {                 // one pass per cycle
    let cur = start, carry = nums[start];
    while (true) {
      const nxt = (cur + k) % n;
      [nums[nxt], carry] = [carry, nums[nxt]]; // drop the parcel, pick up the one there
      cur = nxt;
      moved++;
      if (cur === start) break;       // the chain has closed
    }
    start += 1;                        // the next cycle starts at the next untouched slot
  }
}
