export function addressOf(base: number, index: number, slotSize: number): number {
  if (index < 0) {
    throw new RangeError("Negative index not allowed in raw address arithmetic");
  }
  return base + index * slotSize;
}

export function buildAtEnd(n: number): number[] {
  const out: number[] = [];
  for (let x = 0; x < n; x++) {
    out.push(x);
  }
  return out;
}
