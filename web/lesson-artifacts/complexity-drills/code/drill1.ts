export function netWeight(nums: number[]): number {
  let total = 0;
  for (const x of nums) total += x;
  for (const x of nums) total -= Math.floor(x / 2);
  return total;
}
