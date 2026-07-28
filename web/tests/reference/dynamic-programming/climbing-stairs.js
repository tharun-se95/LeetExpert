function climbStairs(n) {
  let a = 1;
  let b = 1;
  for (let i = 0; i < n - 1; i++) {
    const next = a + b;
    a = b;
    b = next;
  }
  return b;
}
