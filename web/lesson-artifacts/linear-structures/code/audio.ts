function address(base: number, i: number, size = 4): number {
  // sample i sits i whole samples past the start: one multiply, no search
  return base + i * size;
}
