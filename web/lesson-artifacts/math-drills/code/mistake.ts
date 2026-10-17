function prevIndex(i: number, n: number): number {
  // BUG: JavaScript % keeps the dividend's sign, so i = 0 gives -1, not n - 1
  return (i - 1) % n;
}

function safeProduct(nums: number[], mod: number): number {
  // BUG: reducing every step is right, but acc * (x % mod) can reach ~10^18, past 2^53, and a double rounds it
  let acc = 1;
  for (const x of nums) {
    acc = (acc * (x % mod)) % mod;
  }
  return acc;
}
