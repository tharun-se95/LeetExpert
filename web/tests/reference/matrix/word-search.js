function exist(board, word) {
  const rows = board.length;
  const cols = board[0].length;
  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  const dfs = (r, c, index) => {
    if (index === word.length) return true;
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    if (board[r][c] !== word[index]) return false;

    const original = board[r][c];
    board[r][c] = "#";

    for (const [dr, dc] of dirs) {
      if (dfs(r + dr, c + dc, index + 1)) {
        board[r][c] = original;
        return true;
      }
    }

    board[r][c] = original;
    return false;
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }
  return false;
}
