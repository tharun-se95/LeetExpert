export function buildFrontInsert(n: number): number[] {
  // Accidental quadratic: unshifting at index 0 shifts every existing element.
  const out: number[] = [];
  for (let x = 0; x < n; x++) {
    out.unshift(x);
  }
  return out;
}
