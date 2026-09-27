function search(m: number[][], target: number): boolean { // rows sorted, each starting above the last one's end
  const R = m.length, C = m[0].length;
  let lo = 0, hi = R * C - 1;              // one sorted array of R * C keys, folded into rows
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const v = m[Math.floor(mid / C)][mid % C]; // flat position back to (row, column)
    if (v === target) return true;
    if (v < target) lo = mid + 1; else hi = mid - 1;
  }
  return false;
}
