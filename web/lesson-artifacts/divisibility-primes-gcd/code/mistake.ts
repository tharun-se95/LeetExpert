function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let d = 2; d * d < n; d++) {
    // BUG: strict inequality misses square of primes (4, 9, 25, 49)
    if (n % d === 0) return false;
  }
  return true;
}
