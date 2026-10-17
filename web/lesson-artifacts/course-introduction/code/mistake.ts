function firstRepeatSwapped<T>(items: T[]): T | null {
  const seen = new Set<T>();
  for (const item of items) {
    seen.add(item);                  // remembered first...
    if (seen.has(item)) return item; // ...so this is always true
  }
  return null;
}
