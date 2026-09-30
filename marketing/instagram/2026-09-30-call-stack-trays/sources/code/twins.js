// JavaScript twins of factorial.py and broken.py.
function factorial(n) {
  if (n === 0) return 1;
  return n * factorial(n - 1);
}
function broken(n) {
  if (n === 0) return 1;
  return n * broken(n - 2);
}
module.exports = { factorial, broken };
