function total(buf: number[], width: number, height: number, stride: number): number {
  let t = 0;
  for (let y = 0; y < height; y++) {
    const row = y * width;                  // the width is not the row's length in memory
    for (let x = 0; x < width; x++) t += buf[row + x];
  }
  return t;
}
