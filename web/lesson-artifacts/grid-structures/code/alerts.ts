function incidents(g: number[][]): number { // g: 1 is a hot rack, 0 is fine; marked in place
  const R = g.length, C = g[0].length;
  function sink(r: number, c: number): void {
    if (r < 0 || r >= R || c < 0 || c >= C || g[r][c] !== 1) return;
    g[r][c] = 2;                            // mark it visited before going on
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) sink(r + dr, c + dc);
  }
  let n = 0;
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (g[r][c] === 1) { n++; sink(r, c); } // unvisited and hot: a new incident starts here
  return n;
}
