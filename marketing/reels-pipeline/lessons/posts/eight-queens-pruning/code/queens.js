function place(row, n, cols, d1, d2) {
  if (row === n) return 1;
  let found = 0;
  for (let col = 0; col < n; col++) {
    if (cols.has(col) || d1.has(row - col) || d2.has(row + col)) continue;
    cols.add(col);
    d1.add(row - col);
    d2.add(row + col);
    found += place(row + 1, n, cols, d1, d2);
    cols.delete(col);
    d1.delete(row - col);
    d2.delete(row + col);
  }
  return found;
}

module.exports = { place };
