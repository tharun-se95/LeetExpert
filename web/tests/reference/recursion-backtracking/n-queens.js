function solveNQueens(n) {
  const result = [];
  const cols = new Set();
  const diag1 = new Set();
  const diag2 = new Set();
  const placement = [];

  const backtrack = (row) => {
    if (row === n) {
      const board = [];
      for (let r = 0; r < n; r++) {
        board.push(".".repeat(placement[r]) + "Q" + ".".repeat(n - placement[r] - 1));
      }
      result.push(board);
      return;
    }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue;
      cols.add(col);
      diag1.add(row - col);
      diag2.add(row + col);
      placement.push(col);

      backtrack(row + 1);

      placement.pop();
      diag2.delete(row + col);
      diag1.delete(row - col);
      cols.delete(col);
    }
  };

  backtrack(0);
  return result;
}
