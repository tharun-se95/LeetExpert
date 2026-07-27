class NumMatrix {
  constructor(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    this.prefix = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0));
    for (let i = 1; i <= rows; i++) {
      for (let j = 1; j <= cols; j++) {
        this.prefix[i][j] =
          matrix[i - 1][j - 1] +
          this.prefix[i - 1][j] +
          this.prefix[i][j - 1] -
          this.prefix[i - 1][j - 1];
      }
    }
  }

  sumRegion(row1, col1, row2, col2) {
    const p = this.prefix;
    return p[row2 + 1][col2 + 1] - p[row1][col2 + 1] - p[row2 + 1][col1] + p[row1][col1];
  }
}
