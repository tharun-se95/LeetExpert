function findWords(board, words) {
  const root = new Map();
  for (const w of words) {
    let node = root;
    for (const ch of w) {
      if (!node.has(ch)) node.set(ch, new Map());
      node = node.get(ch);
    }
    node.set("$", w);
  }

  const rows = board.length;
  const cols = rows > 0 ? board[0].length : 0;
  const found = [];

  const dfs = (r, c, node) => {
    const ch = board[r][c];
    if (!node.has(ch)) return;
    const next = node.get(ch);
    if (next.has("$")) {
      found.push(next.get("$"));
      next.delete("$");
    }
    board[r][c] = "#";
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] !== "#") {
        dfs(nr, nc, next);
      }
    }
    board[r][c] = ch;
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) dfs(r, c, root);
  }
  return found;
}
