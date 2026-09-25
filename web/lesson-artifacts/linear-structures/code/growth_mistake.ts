function appendCopies(n: number): number {
  let size = 0, cap = 1, copies = 0;
  for (let k = 0; k < n; k++) {
    if (size === cap) { copies += size; cap += 1; } // grows by one slot: every append copies
    size++;
  }
  return copies;
}
