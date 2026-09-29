function exists(b: string[][], w: string): boolean { // b: rows of letters; marked while searched, then restored
  const R = b.length, C = b[0].length;
  function dfs(r: number, c: number, k: number): boolean {
    if (k === w.length) return true;
    if (r < 0 || r >= R || c < 0 || c >= C || b[r][c] !== w[k]) return false;
    const ch = b[r][c];
    b[r][c] = "#";                          // mark: this cell is on the path now
    const ok = [[-1, 0], [0, 1], [1, 0], [0, -1]].some(([dr, dc]) => dfs(r + dr, c + dc, k + 1));
    b[r][c] = ch;                           // un-mark on the way out: backtrack
    return ok;
  }
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (dfs(r, c, 0)) return true;
  return false;
}
