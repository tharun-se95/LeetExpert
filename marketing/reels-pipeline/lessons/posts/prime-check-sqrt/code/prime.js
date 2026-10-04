function isPrimeSlow(n) {
  if (n < 2) return false;
  for (let d = 2; d < n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}

module.exports = { isPrimeSlow, isPrime };
