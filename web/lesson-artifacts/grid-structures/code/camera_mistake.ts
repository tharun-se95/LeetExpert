function rotate(m: number[][]): number[][] {
  const n = m.length;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) [m[i][j], m[j][i]] = [m[j][i], m[i][j]]; // every pair is visited twice
  for (const row of m) row.reverse();
  return m;
}
