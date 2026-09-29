function mask(m: number[][]): number[][] { // zero the row and column of every 0, in place
  const R = m.length, C = m[0].length;
  const row0 = m[0].includes(0);           // the border's own zeros, noted before it holds flags
  const col0 = m.some((row) => row[0] === 0);
  for (let i = 1; i < R; i++)
    for (let j = 1; j < C; j++)
      if (m[i][j] === 0) m[i][0] = m[0][j] = 0;          // flag on the border
  for (let i = 1; i < R; i++)
    for (let j = 1; j < C; j++)
      if (m[i][0] === 0 || m[0][j] === 0) m[i][j] = 0;
  if (row0) for (let j = 0; j < C; j++) m[0][j] = 0;      // the border last, once its flags have been read
  if (col0) for (let i = 0; i < R; i++) m[i][0] = 0;
  return m;
}
