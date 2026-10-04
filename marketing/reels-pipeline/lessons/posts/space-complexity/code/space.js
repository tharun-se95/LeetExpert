function maxOf(nums) {
  let best = nums[0];
  for (const x of nums) {
    if (x > best) best = x;
  }
  return best;
}

function sortedCopy(nums) {
  return [...nums].sort((a, b) => a - b);
}

function sumTo(n) {
  if (n === 0) return 0;
  return n + sumTo(n - 1);
}

function sumIter(n) {
  let total = 0;
  for (let i = 1; i <= n; i++) total += i;
  return total;
}
