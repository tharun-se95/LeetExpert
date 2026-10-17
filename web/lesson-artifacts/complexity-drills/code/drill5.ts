export function halvingSum(nums: number[]): number {
  function go(lo: number, hi: number): number {
    if (hi - lo <= 1) return hi > lo ? nums[lo] : 0;
    const mid = Math.floor((lo + hi) / 2);
    return go(lo, mid) + go(mid, hi);
  }
  return go(0, nums.length);
}
