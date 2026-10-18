export function heaviest(grid: number[][]): number {
  let best = grid[0][0];
  for (const row of grid) {
    for (const weight of row) {
      if (weight > best) best = weight;
    }
  }
  return best;
}
