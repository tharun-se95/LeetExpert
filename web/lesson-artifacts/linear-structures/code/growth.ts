function appendCopies(n: number): number {
  // copies made while appending n items to a doubling array
  let size = 0, cap = 1, copies = 0;
  for (let k = 0; k < n; k++) {
    if (size === cap) { copies += size; cap *= 2; } // full: move to a block twice as big
    size++;
  }
  return copies;
}
