function isValidOrder(order: string[], deps: Record<string, string[]>): boolean {
  const place = new Map<string, number>();
  for (let i = 0; i < order.length; i++) {
    if (place.has(order[i])) return false; // listed twice: it has no single place
    place.set(order[i], i);
  }
  for (const [name, needs] of Object.entries(deps)) {
    if (!place.has(name)) return false; // a module the table names must be taught
    for (const dep of needs) {
      if (!place.has(dep) || place.get(dep)! >= place.get(name)!) return false; // missing, or not strictly earlier
    }
  }
  return true;
}
