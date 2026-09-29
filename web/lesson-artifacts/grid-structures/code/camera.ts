function rotate(m: number[][]): number[][] { // 90° clockwise, in place: no second grid
  const n = m.length;
  for (let i = 0; i < n; i++)              // transpose: reflect across the diagonal
    for (let j = i + 1; j < n; j++) [m[i][j], m[j][i]] = [m[j][i], m[i][j]];
  for (const row of m) row.reverse();      // then flip each row
  return m;
}
