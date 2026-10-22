function rotate(nums: number[], k: number): void {
  const n = nums.length;
  const out: number[] = new Array(n).fill(0); // a second row: n extra slots
  for (let i = 0; i < n; i++) out[(i + k) % n] = nums[i]; // where index i lands
  for (let i = 0; i < n; i++) nums[i] = out[i]; // copy the answer back
}
