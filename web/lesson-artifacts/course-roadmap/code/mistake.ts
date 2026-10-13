function isValidOrderNeighbours(order: string[], deps: Record<string, string[]>): boolean {
  for (let i = 0; i < order.length - 1; i++) {
    if ((deps[order[i]] ?? []).includes(order[i + 1])) return false; // only the next module is compared
  }
  return true;
}
