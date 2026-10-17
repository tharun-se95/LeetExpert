function prevIndex(i: number, n: number): number {
  return ((i - 1) % n + n) % n;
}

function safeProduct(nums: number[], mod: number): number {
  let acc = 1n;
  const m = BigInt(mod);
  for (const x of nums) {
    acc = (acc * (BigInt(x) % m)) % m;
  }
  return Number(acc);
}

// Levels of a perfectly balanced binary tree holding n keys: the bit length of n, which is floor(log2 n) + 1.
// Halving with Math.floor avoids Math.log2, whose last bit is not guaranteed on exact powers of two.
function treeHeight(n: number): number {
  if (n <= 1) return 1;
  let levels = 0;
  while (n >= 1) {
    levels++;
    n = Math.floor(n / 2);
  }
  return levels;
}

function euclidGcd(a: number, b: number): number {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}
