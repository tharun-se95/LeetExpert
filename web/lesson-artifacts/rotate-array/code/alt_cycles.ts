function gcd(a: number, b: number): number {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function rotate(nums: number[], k: number): void {
  const n = nums.length;
  k %= n;
  if (k === 0) return;
  for (let start = 0; start < gcd(n, k); start++) { // one pass per cycle of i -> (i + k) % n
    let held = nums[start];
    let i = start;
    do {
      const j = (i + k) % n;
      [nums[j], held] = [held, nums[j]];
      i = j;
    } while (i !== start);
  }
}
