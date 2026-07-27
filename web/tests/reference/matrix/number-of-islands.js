function numIslands(grid) {
  if (!grid.length) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  const sink = (r, c) => {
    const stack = [[r, c]];
    grid[r][c] = "0";
    while (stack.length) {
      const [cr, cc] = stack.pop();
      for (const [dr, dc] of dirs) {
        const nr = cr + dr;
        const nc = cc + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === "1") {
          grid[nr][nc] = "0";
          stack.push([nr, nc]);
        }
      }
    }
  };

  let islands = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        islands++;
        sink(r, c);
      }
    }
  }
  return islands;
}
