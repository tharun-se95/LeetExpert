type GFunc = ((n: number) => number) | string;

const G_FUNCS: Record<string, (n: number) => number> = {
  "1": () => 1,
  logn: (n: number) => Math.log2(Math.max(1, n)),
  n: (n: number) => n,
  nlogn: (n: number) => n * Math.log2(Math.max(1, n)),
  n2: (n: number) => n * n,
  "2n": (n: number) => Math.pow(2, n),
};

function evalPoly(coeffs: number[], n: number): number {
  let val = 0;
  for (const c of coeffs) {
    val = val * n + c;
  }
  return val;
}

function isWitnessMistake(
  fCoeffs: number[],
  g: GFunc,
  c: number,
  n0: number,
  nMax: number = 100
): boolean {
  if (c <= 0 || n0 < 0) return false;
  const gFn = typeof g === "function" ? g : G_FUNCS[g];
  // Checks only n0: fails to verify that the bound holds for all n in n0..nMax
  return evalPoly(fCoeffs, n0) <= c * gFn(n0);
}
