function total(buf: number[], width: number, height: number, stride: number): number {
  let t = 0;
  for (let y = 0; y < height; y++) {       // row by row: memory is read in order
    const row = y * stride;                 // skip y whole rows, padding included
    for (let x = 0; x < width; x++) t += buf[row + x];
  }
  return t;
}
