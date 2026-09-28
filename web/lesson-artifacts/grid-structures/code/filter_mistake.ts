const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

function blur(g: number[][]): number[][] {
  const R = g.length, C = g[0].length;
  const out = g.map((row) => row.map(() => 0));
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      let total = g[r][c], n = 1;
      for (const [dr, dc] of DIRS) {
        const nr = r + dr, nc = c + dc;
        if (nr < R && nc < C) { total += g[nr][nc]; n++; } // the far edges only: -1 still gets through
      }
      out[r][c] = Math.floor(total / n);
    }
  return out;
}
