type Case<T, R> = { args: T[]; expected: R };

function runCases<T, R>(fn: (...args: T[]) => R, cases: Case<T, R>[]) {
  return cases.map(({ args, expected }) => {
    let got: R | string;
    try {
      got = fn(...args);
    } catch (err) {
      got = String(err); // one broken case must not stop the others
    }
    return { passed: got === expected, got, expected };
  });
}
