// The lesson's TypeScript fib and its memoized twin, as plain JavaScript.
function fib(n) {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
}

function fibMemo(n, memo = new Map()) {
  if (n < 2) return n;
  if (memo.has(n)) return memo.get(n);
  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}

module.exports = { fib, fibMemo };
