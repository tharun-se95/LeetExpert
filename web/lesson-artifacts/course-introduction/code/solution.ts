function firstRepeat<T>(items: T[]): T | null {
  const seen = new Set<T>();
  for (const item of items) {
    if (seen.has(item)) return item; // ask first: only earlier items are in there
    seen.add(item);                  // then remember this one
  }
  return null;
}
