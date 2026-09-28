function incidents(g: number[][]): number {
  const R = g.length, C = g[0].length;
  function sink(r: number, c: number): void {
    if (r < 0 || r >= R || c < 0 || c >= C || g[r][c] !== 1) return;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) sink(r + dr, c + dc); // the neighbour steps straight back in here
    g[r][c] = 2;                            // marked too late
  }
  let n = 0;
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (g[r][c] === 1) { n++; sink(r, c); }
  return n;
}
