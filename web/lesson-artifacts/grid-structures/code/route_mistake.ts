function exists(b: string[][], w: string): boolean {
  const R = b.length, C = b[0].length;
  function dfs(r: number, c: number, k: number): boolean {
    if (k === w.length) return true;
    if (r < 0 || r >= R || c < 0 || c >= C || b[r][c] !== w[k]) return false;
    b[r][c] = "#";                          // marked, and never un-marked
    return [[-1, 0], [0, 1], [1, 0], [0, -1]].some(([dr, dc]) => dfs(r + dr, c + dc, k + 1));
  }
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (dfs(r, c, 0)) return true;
  return false;
}
