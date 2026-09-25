function fact(n: number): number {
  if (n === 0) return 1; // the base case: the stack stops growing here
  return n * fact(n - 1); // this frame waits while the next one runs
}
