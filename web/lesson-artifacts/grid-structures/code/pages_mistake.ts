function search(m: number[][], target: number): boolean {
  const R = m.length, C = m[0].length;
  let lo = 0, hi = R * C - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const v = m[Math.floor(mid / R)][mid % C]; // the row count where the column count belongs
    if (v === target) return true;
    if (v < target) lo = mid + 1; else hi = mid - 1;
  }
  return false;
}
